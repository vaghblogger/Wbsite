"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones, MessageSquareText, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("live_chat_widget_open", { source: "floating" });
        }}
        className="fixed bottom-4 left-4 z-[65] inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-200 shadow-lg hover:bg-zinc-800"
      >
        <Headphones className="h-3.5 w-3.5 text-violet-300" />
        Need help?
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[65] w-[min(90vw,280px)] rounded-xl border border-white/10 bg-zinc-950/95 p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-100">Quick support</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="Close quick support"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-xs text-zinc-400">
        Start with our AI booking assistant or send an email and get a reply.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new Event("open-booking-chatbot"));
            trackEvent("live_chat_widget_handoff", { destination: "chatbot" });
          }}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-violet-500/40 bg-violet-500/15 px-2 py-2 text-xs text-violet-100 hover:bg-violet-500/25"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          Open AI chat
        </button>
        <Link
          href="/contact"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/20 px-2 py-2 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Email us
        </Link>
      </div>
    </div>
  );
}
