import type { ChatConfigOverrides } from "@/types";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export async function fetchAgents() {
  const res = await fetch(`${GATEWAY_URL}/api/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
}

export async function fetchAgent(slug: string) {
  const res = await fetch(`${GATEWAY_URL}/api/agents/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch agent");
  return res.json();
}

export type CalendarSlot = { start_iso_ist: string; label: string };

export async function fetchSlotsForDate(
  dateYyyyMmDd: string,
  sessionId: string
): Promise<{ ok: boolean; slots: CalendarSlot[]; message?: string }> {
  const q = new URLSearchParams({ date: dateYyyyMmDd, session_id: sessionId });
  const res = await fetch(`${GATEWAY_URL}/api/calendar/slots?${q}`, { cache: "no-store" });
  if (!res.ok) return { ok: false, slots: [] };
  return res.json();
}

export type BookableDay = { date: string; label: string };

export async function fetchNextBookableDays(
  count = 2
): Promise<{ ok: boolean; days: BookableDay[] }> {
  const res = await fetch(
    `${GATEWAY_URL}/api/calendar/next-bookable-days?count=${count}`,
    { cache: "no-store" }
  );
  if (!res.ok) return { ok: false, days: [] };
  return res.json();
}

export type SessionAppointment = {
  id: string;
  start_iso_ist: string;
  type: string;
  patient_name: string;
  phone?: string;
};

export async function fetchSessionAppointments(
  sessionId: string,
  phone?: string
): Promise<SessionAppointment[]> {
  const q = new URLSearchParams({ session_id: sessionId });
  if (phone?.trim()) q.set("phone", phone.trim());
  const res = await fetch(`${GATEWAY_URL}/api/calendar/appointments?${q}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const j = await res.json();
  return j.appointments || [];
}

export async function sendChatMessage(
  agentId: string,
  message: string,
  sessionId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  overrides?: ChatConfigOverrides,
  history?: { role: string; content: string }[],
) {
  const body: Record<string, unknown> = {
    agent_id: agentId,
    message,
    session_id: sessionId,
  };
  if (history && history.length > 0) body.history = history;
  if (overrides?.prompt_config) body.prompt_config = overrides.prompt_config;
  if (overrides?.instructions) body.instructions = overrides.instructions;
  if (overrides?.restrictions) body.restrictions = overrides.restrictions;
  if (overrides?.agent_kind) body.agent_kind = overrides.agent_kind;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  const res = await fetch(`${GATEWAY_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  }).finally(() => clearTimeout(t));

  if (!res.ok) throw new Error("Chat request failed");
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    onChunk(text);
  }

  onDone();
}

export function createWebSocket(sessionId: string) {
  return new WebSocket(`${WS_URL}/ws/agent-events?session_id=${sessionId}`);
}

/** Calendar day in Asia/Kolkata (offsetDays from now). */
export function istYyyyMmDd(offsetDays = 0): string {
  const t = Date.now() + offsetDays * 24 * 60 * 60 * 1000;
  return new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
