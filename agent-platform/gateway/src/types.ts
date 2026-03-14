export interface ChatRequest {
  agent_id: string;
  message: string;
  session_id?: string;
  phone?: string;
  history?: { role: string; content: string }[];
  agent_kind?: string;
  prompt_config?: Record<string, string>;
  instructions?: string;
  restrictions?: string;
}

export interface WebSocketData {
  sessionId: string;
}
