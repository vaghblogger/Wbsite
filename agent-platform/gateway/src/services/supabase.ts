import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { FALLBACK_AGENTS } from "./fallback-agents";

function getSupabaseUrl(): string {
  return (process.env.SUPABASE_URL || "").trim();
}

function getSupabaseKey(): string {
  return (process.env.SUPABASE_ANON_KEY || "").trim();
}

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export async function getAgents() {
  const supabase = getClient();
  if (!supabase) return FALLBACK_AGENTS;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .in("status", ["active", "beta"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  const dbAgents = data || [];

  const dbSlugs = new Set(dbAgents.map((a: { slug: string }) => a.slug));
  const missing = FALLBACK_AGENTS.filter((a) => !dbSlugs.has(a.slug));

  return [...missing, ...dbAgents];
}

export async function getAgentBySlug(slug: string) {
  const supabase = getClient();
  if (!supabase) {
    const agent = FALLBACK_AGENTS.find((a) => a.slug === slug);
    if (!agent) throw new Error("Not found");
    return agent;
  }

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    const agent = FALLBACK_AGENTS.find((a) => a.slug === slug);
    if (agent) return agent;
    throw error;
  }
  return data;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** messages.agent_id is UUID FK; chat body uses slug (e.g. ai-front-desk). */
export async function saveMessage(
  agentIdOrSlug: string,
  sessionId: string,
  userMessage: string,
  agentResponse: string
) {
  const supabase = getClient();
  if (!supabase) return;

  let agentUuid = agentIdOrSlug.trim();
  if (!UUID_RE.test(agentUuid)) {
    const { data: row, error: lookupError } = await supabase
      .from("agents")
      .select("id")
      .eq("slug", agentIdOrSlug)
      .maybeSingle();

    if (lookupError || !row?.id) {
      console.error(
        "saveMessage: could not resolve agent slug to UUID:",
        agentIdOrSlug
      );
      return;
    }
    agentUuid = row.id as string;
  }

  const { error } = await supabase.from("messages").insert({
    agent_id: agentUuid,
    session_id: sessionId,
    user_message: userMessage,
    agent_response: agentResponse,
  });

  if (error) console.error("Failed to save message:", error);
}
