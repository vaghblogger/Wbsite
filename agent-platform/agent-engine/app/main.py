import asyncio
import json
import os
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents.registry import get_agent_graph, list_available_agents, FRONT_DESK_AGENT_IDS
from app.agents.registry import is_configurable_front_desk
from app.config import HOST, PORT

app = FastAPI(title="Agent Engine", version="1.0.0")


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [item.strip() for item in raw.split(",") if item.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_internal_token(req: Request) -> None:
    expected = os.getenv("INTERNAL_ENGINE_TOKEN", "").strip()
    if not expected:
        return
    provided = req.headers.get("x-internal-token", "").strip()
    if provided != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    started = time.perf_counter()
    request_id = request.headers.get("x-request-id", "")
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    response.headers["x-request-id"] = request_id
    print(
        "[agent-engine]",
        request.method,
        request.url.path,
        response.status_code,
        f"{elapsed_ms:.1f}ms",
        f"request_id={request_id or 'n/a'}",
    )
    return response


class RunRequest(BaseModel):
    agent_id: str
    message: str
    session_id: str = ""
    phone: str = ""
    history: list[dict] = Field(default_factory=list)
    agent_kind: str = ""
    prompt_config: dict = Field(default_factory=dict)
    instructions: str = ""
    restrictions: str = ""


@app.get("/health")
async def health():
    return {"status": "ok", "agents": list(list_available_agents())}


@app.post("/health/sheets-test")
async def health_sheets_test(request: Request):
    """Append one test row if Sheets env is configured; check agent-engine terminal for errors."""
    from app.tools.vision_crm import _append_airtable_sheets, sheets_creds_path

    if os.getenv("ALLOW_SHEETS_HEALTH_TEST", "false").lower() != "true":
        raise HTTPException(status_code=404, detail="Not Found")

    _require_internal_token(request)
    sid = os.getenv("GOOGLE_SHEETS_LOG_ID", "").strip()
    creds = sheets_creds_path()
    if not sid:
        return {"ok": False, "error": "GOOGLE_SHEETS_LOG_ID not set"}
    if not os.path.isfile(creds):
        return {
            "ok": False,
            "error": f"Creds file not found: {creds}",
            "hint": "Save Google's JSON as agent-engine/google-sheets-credentials.json",
        }
    _append_airtable_sheets(
        "healthcheck",
        {"message": "Sheets connection OK — you can delete this row", "source": "POST /health/sheets-test"},
    )
    return {
        "ok": True,
        "message": "Open tab **healthcheck** (created if needed); new rows go to tabs by kind: ticket, crm_update, log.",
    }


@app.get("/calendar/slots")
async def calendar_slots(request: Request, date: str, session_id: str = ""):
    """Free slots for one clinic day (IST). session_id unused; reserved for future per-session blocks."""
    _require_internal_token(request)
    from app.tools.vision_calendar import list_slots_for_date

    return list_slots_for_date(date)


@app.get("/calendar/next-bookable-days")
async def calendar_next_bookable_days(request: Request, count: int = 2):
    """Next N IST days with at least one free slot (skips Sunday / closed / after hours)."""
    _require_internal_token(request)
    from app.tools.vision_calendar import next_bookable_days

    n = min(max(count, 1), 7)
    return next_bookable_days(n)


@app.get("/calendar/appointments")
async def calendar_appointments(request: Request, session_id: str, phone: str = ""):
    _require_internal_token(request)
    from app.tools.vision_calendar import get_merged_appointments

    if not session_id.strip() and not phone.strip():
        return {"appointments": []}
    return {
        "appointments": get_merged_appointments(
            session_id.strip() or "default", phone.strip() or None
        )
    }


def _use_front_desk(req: RunRequest) -> bool:
    if is_configurable_front_desk(req.agent_kind):
        return True
    if req.agent_id in FRONT_DESK_AGENT_IDS:
        return True
    return False


@app.post("/run")
async def run_agent(request: RunRequest, req: Request):
    _require_internal_token(req)
    event_queue: asyncio.Queue = asyncio.Queue()
    front_desk = _use_front_desk(request)

    if not front_desk:
        g = get_agent_graph(request.agent_id)
        if not g:
            return StreamingResponse(
                iter([f"data: {json.dumps({'type': 'error', 'content': 'Agent not found'})}\n\n"]),
                media_type="text/event-stream",
            )

    async def run_graph():
        try:
            if front_desk:
                from app.graphs.front_desk_graph import (
                    run_configurable_front_desk,
                    compose_prompt_from_request,
                )

                system = compose_prompt_from_request(
                    "configurable_front_desk",
                    request.prompt_config or {},
                    request.instructions or "",
                    request.restrictions or "",
                )

                cal_merge_phone = None
                try:
                    pack = await asyncio.wait_for(
                        run_configurable_front_desk(
                            system,
                            request.message,
                            request.session_id or "default",
                            request.phone or "",
                            request.history or [],
                        ),
                        timeout=75.0,
                    )
                    if isinstance(pack, tuple) and len(pack) == 2:
                        response, cal_merge_phone = pack[0], pack[1]
                    else:
                        response = pack  # type: ignore
                except asyncio.TimeoutError:
                    response = (
                        "That took too long — please send your message again. "
                        "If you tapped a calendar slot, try once more or type the date and time."
                    )
                if cal_merge_phone:
                    await event_queue.put(
                        f"data: {json.dumps({'type': 'calendar_merge_phone', 'phone': cal_merge_phone})}\n\n"
                    )
            else:
                async def cb(ev: dict):
                    await event_queue.put(f"data: {json.dumps({**ev, 'type': 'node_event'})}\n\n")

                result = await g.ainvoke(
                    {
                        "messages": [],
                        "current_input": request.message,
                        "intent": "",
                        "tool_results": {},
                        "response": "",
                    },
                    config={"configurable": {"event_callback": cb}},
                )
                response = result.get("response", "")

            response = (response or "").strip() or (
                "I couldn't generate a reply. Please try again or rephrase."
            )
            words = response.split(" ")
            for i in range(0, len(words), 4):
                chunk = " ".join(words[i : i + 4])
                if i > 0:
                    chunk = " " + chunk
                await event_queue.put(
                    f"data: {json.dumps({'type': 'response_chunk', 'content': chunk})}\n\n"
                )
                await asyncio.sleep(0.04)
            await event_queue.put(
                f"data: {json.dumps({'type': 'response_done', 'content': response})}\n\n"
            )
        except Exception as e:
            await event_queue.put(
                f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            )
        finally:
            await event_queue.put(None)

    async def event_generator():
        task = asyncio.create_task(run_graph())
        while True:
            ev = await event_queue.get()
            if ev is None:
                yield "data: [DONE]\n\n"
                break
            yield ev
        await task

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
