import { handleGetAgents, handleGetAgent } from "./routes/agents";
import { handleChat } from "./routes/chat";
import {
  handleAnalyticsInsightsShowcase,
  handleDocProcessingShowcase,
  handleIntegrationsBlueprintShowcase,
  handleStrategyRoadmapShowcase,
} from "./routes/showcase";
import type { WebSocketData } from "./types";

const PORT = Number(process.env.PORT) || 3001;
/** Bun defaults to 10s; streaming /chat + slow engine calls need a longer idle window (max 255). */
const IDLE_TIMEOUT = Math.min(
  255,
  Math.max(10, Number(process.env.GATEWAY_IDLE_TIMEOUT) || 120)
);
const RATE_LIMIT_WINDOW_MS = Math.max(
  10_000,
  Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000
);
const RATE_LIMIT_MAX_REQUESTS = Math.max(
  10,
  Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60
);

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Request-Id",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function shouldRateLimit(pathname: string): boolean {
  return pathname === "/api/chat" || pathname.startsWith("/api/showcase/");
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  rateLimitStore.set(key, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

const server = Bun.serve<WebSocketData>({
  port: PORT,
  idleTimeout: IDLE_TIMEOUT,

  fetch(req, server) {
    const url = new URL(req.url);
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const origin = req.headers.get("origin");
    const corsHeaders = buildCorsHeaders(origin);

    if (shouldRateLimit(url.pathname)) {
      const key = `${getClientIp(req)}:${url.pathname}`;
      if (isRateLimited(key)) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please retry shortly." }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "content-type": "application/json",
              "x-request-id": requestId,
            },
          }
        );
      }
    }

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...corsHeaders, "x-request-id": requestId },
      });
    }

    // WebSocket upgrade
    if (url.pathname === "/ws/agent-events") {
      if (!isAllowedOrigin(origin)) {
        return new Response("Origin not allowed", { status: 403 });
      }
      const sessionId = url.searchParams.get("session_id") || "default";
      const upgraded = server.upgrade(req, {
        data: { sessionId },
      });
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // REST routes
    const handler = async (): Promise<Response> => {
      if (url.pathname === "/health" && req.method === "GET") {
        const AGENT_ENGINE_URL = process.env.AGENT_ENGINE_URL || "http://localhost:8000";
        const upstream = await fetch(`${AGENT_ENGINE_URL}/health`);
        return Response.json(
          { status: "ok", upstream: upstream.ok ? "ok" : "degraded" },
          { status: upstream.ok ? 200 : 503 }
        );
      }

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

      if (url.pathname === "/api/showcase/doc-processing/run" && req.method === "POST") {
        return handleDocProcessingShowcase(req);
      }
      if (url.pathname === "/api/showcase/analytics/insights" && req.method === "POST") {
        return handleAnalyticsInsightsShowcase(req);
      }
      if (url.pathname === "/api/showcase/integrations/blueprint" && req.method === "POST") {
        return handleIntegrationsBlueprintShowcase(req);
      }
      if (url.pathname === "/api/showcase/strategy/roadmap" && req.method === "POST") {
        return handleStrategyRoadmapShowcase(req);
      }

      const AGENT_ENGINE_URL = process.env.AGENT_ENGINE_URL || "http://localhost:8000";
      const internalToken = (process.env.INTERNAL_ENGINE_TOKEN || "").trim();
      const engineHeaders: Record<string, string> = {
        ...(internalToken ? { "X-Internal-Token": internalToken } : {}),
        "X-Request-Id": requestId,
      };
      if (url.pathname === "/api/calendar/slots" && req.method === "GET") {
        const date = url.searchParams.get("date") || "";
        const sessionId = url.searchParams.get("session_id") || "";
        const r = await fetch(
          `${AGENT_ENGINE_URL}/calendar/slots?date=${encodeURIComponent(date)}&session_id=${encodeURIComponent(sessionId)}`,
          { headers: engineHeaders }
        );
        return new Response(await r.text(), {
          status: r.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname === "/api/calendar/next-bookable-days" && req.method === "GET") {
        const count = url.searchParams.get("count") || "2";
        const r = await fetch(
          `${AGENT_ENGINE_URL}/calendar/next-bookable-days?count=${encodeURIComponent(count)}`,
          { headers: engineHeaders }
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
          `${AGENT_ENGINE_URL}/calendar/appointments?${q.toString()}`,
          { headers: engineHeaders }
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
      res.headers.set("x-request-id", requestId);
      console.log(
        "[gateway]",
        req.method,
        url.pathname,
        res.status,
        `request_id=${requestId}`
      );
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
