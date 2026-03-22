"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { QuickActions } from "./quick-actions";
import {
  fetchSlotsForDate,
  fetchNextBookableDays,
  istYyyyMmDd,
  type CalendarSlot,
  type BookableDay,
} from "@/lib/api";

/** Sent when user picks "Other day" — agent should ask which date they want. */
const OTHER_DAY_MESSAGE =
  "I want to book on a different day (not using the quick day buttons). Please ask me which date works for me, then we can pick a time.";
import type { ChatMessage, QuickAction } from "@/types";

interface ChatInterfaceProps {
  agentName: string;
  sessionId: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  quickActions?: QuickAction[];
  persistentQuickActions?: QuickAction[];
  accentText?: string;
  /** Role allows booking UI (calendar preset). */
  bookingCalendarRole?: boolean;
  /** Show entry bar + shortcut strip (false = calendar-only until user books via chat). */
  showBookingShortcuts?: boolean;
  /** User turned on booking shortcuts + slot picker (after intent or explicit action). */
  bookingToolsOpen?: boolean;
  onOpenBookingTools?: () => void;
  onCloseBookingTools?: () => void;
}

export function ChatInterface({
  agentName,
  sessionId,
  messages,
  isStreaming,
  onSend,
  onClear,
  quickActions,
  persistentQuickActions,
  accentText,
  bookingCalendarRole,
  showBookingShortcuts = true,
  bookingToolsOpen,
  onOpenBookingTools,
  onCloseBookingTools,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [slotDate, setSlotDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookableDays, setBookableDays] = useState<BookableDay[]>([]);
  const [bookableDaysLoading, setBookableDaysLoading] = useState(false);

  useEffect(() => {
    if (!bookingCalendarRole || !bookingToolsOpen || !showBookingShortcuts) {
      setBookableDays([]);
      return;
    }
    let cancelled = false;
    setBookableDaysLoading(true);
    fetchNextBookableDays(2).then((r) => {
      if (cancelled) return;
      setBookableDays(r.days?.length ? r.days : []);
      setBookableDaysLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bookingCalendarRole, bookingToolsOpen, showBookingShortcuts, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStreaming]);

  const loadSlots = useCallback(
    async (date: string) => {
      setSlotDate(date);
      setSlotsLoading(true);
      setSlotsOpen(true);
      const r = await fetchSlotsForDate(date, sessionId);
      setSlots(r.slots || []);
      setSlotsLoading(false);
    },
    [sessionId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const noUserYet = !messages.some((m) => m.role === "user");
  const hasUser = !noUserYet;
  const showPrimaryQuickGrid = quickActions && quickActions.length > 0 && noUserYet;
  const showQuickRow = quickActions && quickActions.length > 0 && hasUser;

  /** Which day shows emerald (follows tap; defaults to first bookable day, or Today if list empty). */
  const highlightedDayDate =
    slotDate ??
    (bookableDays.length > 0 ? bookableDays[0].date : istYyyyMmDd(0));
  const dayButtonClass = (date: string, isSelected: boolean) =>
    `rounded-full border px-2.5 py-1.5 text-[11px] disabled:opacity-40 min-h-[36px] touch-manipulation ${
      isSelected
        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25"
        : "border-white/[0.08] bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700/80"
    }`;

  return (
    <div className="flex flex-col h-full min-h-[min(640px,88dvh)] max-h-[min(900px,96dvh)] rounded-xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.06] bg-zinc-900/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="h-4 w-4 text-violet-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            Chat · {agentName}
          </span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 py-4 space-y-4 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center px-2">
            <div className="bg-zinc-800/60 rounded-full p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-zinc-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No messages yet</p>
            <p className="text-xs text-muted-foreground/60">
              Send a message to start chatting with {agentName}
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          <div className="space-y-4 px-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </AnimatePresence>

        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "assistant" &&
          !messages[messages.length - 1].content && <TypingIndicator />}
      </ScrollArea>

      {showPrimaryQuickGrid && (
        <QuickActions
          actions={quickActions!}
          onAction={onSend}
          disabled={isStreaming}
          accentText={accentText}
          variant="grid"
        />
      )}

      {showQuickRow && (
        <QuickActions
          actions={quickActions!}
          onAction={onSend}
          disabled={isStreaming}
          accentText={accentText}
          variant="row"
        />
      )}

      {bookingCalendarRole &&
        showBookingShortcuts &&
        !bookingToolsOpen &&
        onOpenBookingTools && (
        <div className="border-t border-white/[0.06] bg-zinc-900/50 px-3 py-2.5 shrink-0">
          <p className="text-[11px] text-zinc-400 mb-2">
            Booking calendar &amp; quick slots stay hidden until you need them.
          </p>
          <button
            type="button"
            onClick={onOpenBookingTools}
            className="w-full rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-left text-sm font-medium text-violet-200 hover:bg-violet-500/15 touch-manipulation min-h-[44px]"
          >
            Book or reschedule — show calendar &amp; shortcuts
          </button>
        </div>
      )}

      {bookingCalendarRole && showBookingShortcuts && bookingToolsOpen && (
        <div className="border-t border-white/[0.06] bg-zinc-900/60 px-3 py-2 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Booking shortcuts
            </span>
            <div className="flex items-center gap-2">
              {onCloseBookingTools && (
                <button
                  type="button"
                  onClick={onCloseBookingTools}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 touch-manipulation py-1"
                >
                  Hide
                </button>
              )}
              <button
                type="button"
                onClick={() => setSlotsOpen((o) => !o)}
                className="text-[10px] text-violet-400 flex items-center gap-0.5 touch-manipulation py-1"
              >
                Times {slotsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mb-1.5">
            First two buttons = next days with open slots (Sun closed; after 7pm IST skips today).
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bookableDaysLoading && (
              <span className="text-[11px] text-zinc-500 py-1.5">Loading days…</span>
            )}
            {!bookableDaysLoading &&
              bookableDays.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => loadSlots(day.date)}
                  className={dayButtonClass(day.date, highlightedDayDate === day.date)}
                >
                  {day.label} · times
                </button>
              ))}
            {!bookableDaysLoading && bookableDays.length === 0 && (
              <>
                <button
                  type="button"
                  disabled={isStreaming}
                  onClick={() => loadSlots(istYyyyMmDd(0))}
                  className={dayButtonClass(
                    istYyyyMmDd(0),
                    highlightedDayDate === istYyyyMmDd(0)
                  )}
                >
                  Today · times
                </button>
                <button
                  type="button"
                  disabled={isStreaming}
                  onClick={() => loadSlots(istYyyyMmDd(1))}
                  className={dayButtonClass(
                    istYyyyMmDd(1),
                    highlightedDayDate === istYyyyMmDd(1)
                  )}
                >
                  Tomorrow · times
                </button>
              </>
            )}
            <button
              type="button"
              disabled={isStreaming}
              onClick={() => onSend(OTHER_DAY_MESSAGE)}
              className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-[11px] text-violet-200 hover:bg-violet-500/20 disabled:opacity-40 min-h-[36px] touch-manipulation"
            >
              Other day — ask me in chat
            </button>
          </div>
          <AnimatePresence>
            {slotsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 mt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    {slotDate
                      ? `Open slots ${slotDate} (IST) — tap to book`
                      : "Tap a day above to load times"}
                  </p>
                  {slotsLoading ? (
                    <p className="text-[11px] text-zinc-500">Loading slots…</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto touch-pan-y">
                      {slots.map((s) => (
                        <button
                          key={s.start_iso_ist}
                          type="button"
                          disabled={isStreaming}
                          onClick={() =>
                            onSend(
                              `Book a visit on ${slotDate} at ${s.label} IST. Use this exact time for availability — slot ${s.start_iso_ist}`
                            )
                          }
                          className="rounded-lg border border-violet-500/25 bg-violet-500/10 px-2 py-1.5 text-[11px] text-violet-200 hover:bg-violet-500/20 disabled:opacity-40 min-h-[36px] touch-manipulation"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!slotsLoading && slots.length === 0 && slotDate && (
                    <p className="text-[11px] text-amber-200/90">
                      No free slots or closed—type another time in chat.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="p-3 sm:p-4 border-t border-white/[0.06] shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              enterKeyHint="send"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message…"
              disabled={isStreaming}
              className="w-full h-11 min-h-[44px] rounded-full bg-zinc-800/80 border border-zinc-700/50 px-4 sm:px-5 text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 disabled:opacity-50 transition-all"
            />
          </div>
          <motion.div whileTap={{ scale: 0.95 }} className="shrink-0">
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isStreaming}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20 disabled:opacity-30 touch-manipulation"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
