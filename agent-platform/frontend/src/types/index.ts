export interface AgentNode {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export interface AgentEdge {
  source: string;
  target: string;
}

export interface AgentWorkflow {
  nodes: AgentNode[];
  edges: AgentEdge[];
}

export interface QuickAction {
  label: string;
  message: string;
  icon?: string;
}

export interface AgentPresetRole {
  id: string;
  label: string;
  icon: string;
  accent: string;
  prompt_config: Record<string, string>;
  instructions: string;
  restrictions: string;
  welcome_message?: string;
  quick_actions?: QuickAction[];
  /** Shown on every turn (e.g. Today / Tomorrow) for booking-friendly roles */
  persistent_quick_actions?: QuickAction[];
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  workflow_json: AgentWorkflow;
  tools: string[];
  status: "active" | "beta" | "inactive";
  accent_color: string;
  icon: string;
  created_at: string;
  preset_roles?: AgentPresetRole[];
  agent_kind?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type NodeStatus = "idle" | "running" | "completed";

export interface WorkflowEvent {
  type:
    | "node_event"
    | "response_chunk"
    | "response_done"
    | "calendar_refresh"
    | "calendar_merge_phone";
  phone?: string;
  node?: string;
  status?: NodeStatus;
  content?: string;
}

export interface ChatConfigOverrides {
  prompt_config?: Record<string, string>;
  instructions?: string;
  restrictions?: string;
  agent_kind?: string;
}
