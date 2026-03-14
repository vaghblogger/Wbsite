import { handleGetAgents, handleGetAgent } from "./routes/agents";
import { handleChat } from "./routes/chat";
import type { WebSocketData } from "./types";

const PORT = Number(process.env.PORT) || 3001;
/** Bun defaults to 10s; streaming /chat + slow engine calls need a longer idle window (max 255). */
const IDLE_TIMEOUT = Math.min(
  255,
  Math.max(10, Number(process.env.GATEWAY_IDLE_TIMEOUT) || 120)
);

const server = Bun.serve<WebSocketData>({
  port: PORT,
  idleTimeout: IDLE_TIMEOUT,

  fetch(req, server) {
    const url = new URL(req.url);

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // WebSocket upgrade
    if (url.pathname === "/ws/agent-events") {
      const sessionId = url.searchParams.get("session_id") || "default";
      const upgraded = server.upgrade(req, {
        data: { sessionId },
      });
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // REST routes
    const handler = async (): Promise<Response> => {
      if (url.pathname === "/api/agents" && req.method === "GET") {
        return handleGetAgents();
      }

      const agentMatch = url.pathname.match(/^\/api\/agents\/(.+)$/);
      if (agentMatch && req.method === "GET") {
        return handleGetAgent(agentMatch[1]);
      }

      if (url.pathname === "/api/chat" && req.method === "POST") {
        return handleChat(req, (sessionId, data) => {
          server.publish(`session:${sessionId}`, data);
        });
      }

      const AGENT_ENGINE_URL = process.env.AGENT_ENGINE_URL || "http://localhost:8000";
      if (url.pathname === "/api/calendar/slots" && req.method === "GET") {
        const date = url.searchParams.get("date") || "";
        const sessionId = url.searchParams.get("session_id") || "";
        const r = await fetch(
          `${AGENT_ENGINE_URL}/calendar/slots?date=${encodeURIComponent(date)}&session_id=${encodeURIComponent(sessionId)}`
        );
        return new Response(await r.text(), {
          status: r.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname === "/api/calendar/next-bookable-days" && req.method === "GET") {
        const count = url.searchParams.get("count") || "2";
        const r = await fetch(
          `${AGENT_ENGINE_URL}/calendar/next-bookable-days?count=${encodeURIComponent(count)}`
        );
        return new Response(await r.text(), {
          status: r.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname === "/api/calendar/appointments" && req.method === "GET") {
        const sessionId = url.searchParams.get("session_id") || "";
        const phone = url.searchParams.get("phone") || "";
        const q = new URLSearchParams({
          session_id: sessionId,
          phone,
        });
        const r = await fetch(
          `${AGENT_ENGINE_URL}/calendar/appointments?${q.toString()}`
        );
        return new Response(await r.text(), {
          status: r.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404 });
    };

    return handler().then((res) => {
      // Add CORS headers to every response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.headers.set(key, value);
      });
      return res;
    });
  },

  websocket: {
    open(ws) {
      const channel = `session:${ws.data.sessionId}`;
      ws.subscribe(channel);
      ws.send(JSON.stringify({ type: "connected", session_id: ws.data.sessionId }));
    },
    message(ws, message) {
      // Client messages are not expected, but handle gracefully
      console.log(`WS message from ${ws.data.sessionId}: ${message}`);
    },
    close(ws) {
      const channel = `session:${ws.data.sessionId}`;
      ws.unsubscribe(channel);
    },
  },
});

console.log(`Gateway server running on http://localhost:${server.port}`);
if (!(process.env.SUPABASE_URL || "").trim() || !(process.env.SUPABASE_ANON_KEY || "").trim()) {
  console.log(
    "[gateway] SUPABASE_URL / SUPABASE_ANON_KEY not set — using in-memory agent list. Add .env to use Supabase."
  );
}
