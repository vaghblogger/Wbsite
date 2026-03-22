import { runAgent } from "../services/agent-engine";
import { saveMessage, getAgentBySlug } from "../services/supabase";
import type { ChatRequest } from "../types";

export async function handleChat(
  req: Request,
  publishEvent: (sessionId: string, data: string) => void
): Promise<Response> {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agent_id, message, session_id } = body;
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!agent_id || !message) {
    return Response.json(
      { error: "agent_id and message are required" },
      { status: 400 }
    );
  }

  const sessionId = session_id || crypto.randomUUID();

  const hasKeys = (o: unknown): boolean =>
    !!o && typeof o === "object" && Object.keys(o as Record<string, unknown>).length > 0;

  let agent_kind = body.agent_kind || "";

  // Body values are role-specific (from frontend Role Picker).
  // DB values are agent-level defaults (shared across all roles).
  // Role-level must win; DB only fills gaps.
  let prompt_config: Record<string, string> = {};
  let instructions = "";
  let restrictions = "";

  try {
    const row = await getAgentBySlug(agent_id);
    if (row) {
      agent_kind = row.agent_kind || agent_kind;

      let dbConfig = row.prompt_config;
      if (typeof dbConfig === "string") {
        try { dbConfig = JSON.parse(dbConfig); } catch { dbConfig = {}; }
      }

      prompt_config = hasKeys(body.prompt_config)
        ? (body.prompt_config as Record<string, string>)
        : hasKeys(dbConfig)
          ? (dbConfig as Record<string, string>)
          : {};

      instructions = (body.instructions || "").trim()
        || (row.instructions || "").trim()
        || "";
      restrictions = (body.restrictions || "").trim()
        || (row.restrictions || "").trim()
        || "";
    }
  } catch {
    prompt_config = (body.prompt_config || {}) as Record<string, string>;
    instructions = body.instructions || "";
    restrictions = body.restrictions || "";
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const fullResponse = await runAgent(
          {
            agent_id,
            message,
            session_id: sessionId,
            request_id: requestId,
            phone: body.phone,
            history: body.history,
            agent_kind,
            prompt_config: prompt_config as Record<string, string>,
            instructions,
            restrictions,
          },
          (event) => {
            publishEvent(sessionId, event);
            try {
              const parsed = JSON.parse(event);
              if (parsed.type === "response_chunk" && parsed.content) {
                controller.enqueue(new TextEncoder().encode(parsed.content));
              }
            } catch {
              controller.enqueue(new TextEncoder().encode(event));
            }
          }
        );

        saveMessage(agent_id, sessionId, message, fullResponse).catch(() => {});
        publishEvent(
          sessionId,
          JSON.stringify({ type: "calendar_refresh", session_id: sessionId })
        );
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Agent execution failed";
        controller.enqueue(
          new TextEncoder().encode(`\n\n[Error: ${errMsg}]`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
