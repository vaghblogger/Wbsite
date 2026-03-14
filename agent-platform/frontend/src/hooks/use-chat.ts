"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage, ChatConfigOverrides } from "@/types";

function buildHistory(msgs: ChatMessage[]) {
  return msgs
    .filter(
      (m) =>
        m.role === "user" ||
        (m.role === "assistant" && String(m.content).trim().length > 0)
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

export function useChat(agentId: string, sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(false);
  const overridesRef = useRef<ChatConfigOverrides | undefined>(undefined);
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function setOverrides(o: ChatConfigOverrides | undefined) {
    overridesRef.current = o;
  }

  function injectWelcome(text: string) {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: text,
      timestamp: new Date(),
    };
    setMessages([msg]);
  }

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      abortRef.current = false;

      try {
        const history = buildHistory(messagesRef.current);
        await sendChatMessage(
          agentId,
          text.trim(),
          sessionId,
          (chunk) => {
            if (abortRef.current) return;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + chunk,
                };
              }
              return updated;
            });
          },
          () => {},
          overridesRef.current,
          history,
        );
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant" && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content:
                "Sorry, I'm unable to connect right now. Please make sure the gateway and agent engine are running.",
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [agentId, sessionId, isStreaming]
  );

  const clear = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, clear, setOverrides, injectWelcome };
}
