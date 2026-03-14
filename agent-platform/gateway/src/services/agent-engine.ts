const AGENT_ENGINE_URL = process.env.AGENT_ENGINE_URL || "http://localhost:8000";

export interface AgentRunRequest {
  agent_id: string;
  message: string;
  session_id: string;
  phone?: string;
  history?: { role: string; content: string }[];
  agent_kind?: string;
  prompt_config?: Record<string, string>;
  instructions?: string;
  restrictions?: string;
}

export async function runAgent(
  request: AgentRunRequest,
  onEvent: (event: string) => void
): Promise<string> {
  const res = await fetch(`${AGENT_ENGINE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: request.agent_id,
      message: request.message,
      session_id: request.session_id,
      phone: request.phone || "",
      history: request.history || [],
      agent_kind: request.agent_kind || "",
      prompt_config: request.prompt_config || {},
      instructions: request.instructions || "",
      restrictions: request.restrictions || "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Agent engine error: ${res.status}`);
  }

  if (!res.body) {
    throw new Error("No response body from agent engine");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          onEvent(JSON.stringify(parsed));

          if (parsed.type === "response_chunk" && parsed.content) {
            fullResponse += parsed.content;
          }
          if (parsed.type === "response_done" && parsed.content) {
            fullResponse = parsed.content;
          }
        } catch {
          fullResponse += data;
          onEvent(JSON.stringify({ type: "response_chunk", content: data }));
        }
      }
    }
  }

  return fullResponse;
}
