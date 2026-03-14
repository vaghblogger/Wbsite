"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createWebSocket } from "@/lib/api";
import type { NodeStatus, WorkflowEvent } from "@/types";

export function useWorkflowEvents(sessionId: string) {
  const [nodeStates, setNodeStates] = useState<Record<string, NodeStatus>>({});
  const [connected, setConnected] = useState(false);
  /** Bumps when gateway signals calendar_refresh after a chat turn */
  const [calendarTick, setCalendarTick] = useState(0);
  /** Set when user looked up appointments in chat (get_client_appointments) — calendar merges that phone */
  const [calendarMergePhone, setCalendarMergePhone] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const resetNodes = useCallback(() => {
    setNodeStates({});
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    let ws: WebSocket;
    try {
      ws = createWebSocket(sessionId);
      wsRef.current = ws;
    } catch {
      return;
    }

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data: WorkflowEvent = JSON.parse(event.data);
        if (data.type === "node_event" && data.node && data.status) {
          setNodeStates((prev) => ({ ...prev, [data.node!]: data.status! }));
        }
        if (data.type === "calendar_refresh") {
          setCalendarTick((n) => n + 1);
        }
        if (data.type === "calendar_merge_phone" && data.phone?.trim()) {
          setCalendarMergePhone(data.phone.trim());
          setCalendarTick((n) => n + 1);
        }
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId]);

  return { nodeStates, connected, resetNodes, calendarTick, calendarMergePhone };
}
