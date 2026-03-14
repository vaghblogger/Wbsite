# Phase 1 — OpenAI LLM (implemented)

Configurable **AI Front Desk** uses **OpenAI** via LangGraph **ReAct** (`create_react_agent`). Default chat model is **`gpt-5.2`** (override with `OPENAI_MODEL` in `.env`).

## Flow

```
User message (+ optional history, phone)
  -> Gateway POST /api/chat (agent_id, overrides: prompt_config, instructions, restrictions, agent_kind)
  -> Engine POST /run
  -> compose_prompt_from_request() + prompt_builder + configurable_front_desk_base.txt
  -> create_react_agent(FRONT_DESK_TOOLS)
  -> OPENAI_MODEL (default gpt-5.2) → tool calls → final reply
  -> SSE chunks → gateway → frontend stream
```

## Key files

| File | Role |
|------|------|
| [`agent-engine/app/llm.py`](../agent-engine/app/llm.py) | `is_llm_configured()`, `get_llm()` — default model **`gpt-5.2`** (`OPENAI_MODEL`); `get_llm_fast()` defaults to **`gpt-4o-mini`** (`OPENAI_MODEL_FAST`) |
| [`agent-engine/app/graphs/front_desk_graph.py`](../agent-engine/app/graphs/front_desk_graph.py) | ReAct graph, `run_configurable_front_desk()`, prompt composition |
| [`agent-engine/app/graphs/front_desk_tools.py`](../agent-engine/app/graphs/front_desk_tools.py) | Mock tools; context via `set_front_desk_context(session_id, phone)` |
| [`agent-engine/app/prompts/prompt_builder.py`](../agent-engine/app/prompts/prompt_builder.py) | Builds system prompt from DB / request overrides |

## Fallback if no API key

If `OPENAI_API_KEY` is missing in `agent-engine/.env`:

- The engine returns a clear message in chat (no crash).
- Gateway + frontend still run.

## Cost notes

- **Primary** default: **`gpt-5.2`** (higher quality; pricing on [OpenAI pricing](https://platform.openai.com/docs/pricing)).
- **Fast** default: **`gpt-4o-mini`** for any future quick-classification use.
- Tool calls add extra turns; restart the engine after changing `.env`.

## Changing model

Set in `agent-engine/.env` (no code change):

```env
OPENAI_MODEL=gpt-5.2
OPENAI_MODEL_FAST=gpt-4o-mini
```

Aliases such as `gpt-5.2-2025-12-11` also work. For a cheaper primary model, e.g. `gpt-4o-mini` or `gpt-5-mini`.

## Status vs older plans

| Old assumption | Current state |
|----------------|---------------|
| Separate “AI Receptionist” StateGraph + keyword intent | Unified **front desk** ReAct agent; legacy receptionist graph removed from registry |
| Single static system prompt | Per-request prompt from **preset / DB / overrides** |
