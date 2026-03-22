"use client";

import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingSlot } from "@/hooks/use-booking-chatbot";
import { useEffect, useMemo, useState } from "react";

function slotDateKey(slot: BookingSlot): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(slot.startIso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function slotDateLabel(slot: BookingSlot): string {
  return new Date(slot.startIso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function slotTimeLabel(slot: BookingSlot): string {
  return new Date(slot.startIso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingPanel({
  slots,
  loading,
  onSelectSlot,
}: {
  slots: BookingSlot[];
  loading: boolean;
  onSelectSlot: (slot: BookingSlot) => void;
}) {
  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, BookingSlot[]>();
    for (const slot of slots) {
      const key = slotDateKey(slot);
      const list = grouped.get(key) ?? [];
      list.push(slot);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries());
  }, [slots]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  useEffect(() => {
    if (!groupedByDate.length) {
      setSelectedDateKey(null);
      return;
    }
    if (!selectedDateKey || !groupedByDate.some(([k]) => k === selectedDateKey)) {
      setSelectedDateKey(groupedByDate[0][0]);
    }
  }, [groupedByDate, selectedDateKey]);
  const activeDateKey = selectedDateKey ?? groupedByDate[0]?.[0] ?? null;
  const visibleSlots = activeDateKey ? groupedByDate.find(([k]) => k === activeDateKey)?.[1] ?? [] : [];

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
        <CalendarCheck className="h-4 w-4 text-violet-400" />
        Real-time slots (IST)
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading availability...
        </div>
      ) : null}
      {!loading && slots.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No slots found right now. Try another duration or send an email.
        </p>
      ) : null}
      {!loading && slots.length > 0 ? (
        <div className="mt-2 space-y-2">
          <div className="flex max-h-20 flex-wrap gap-2 overflow-y-auto">
            {groupedByDate.map(([dateKey, dateSlots]) => (
              <button
                key={dateKey}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeDateKey === dateKey
                    ? "border-violet-500/60 bg-violet-500/20 text-violet-100"
                    : "border-white/15 bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/80"
                }`}
                onClick={() => setSelectedDateKey(dateKey)}
              >
                {slotDateLabel(dateSlots[0])}
              </button>
            ))}
          </div>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {visibleSlots.map((slot) => (
              <Button
                key={slot.startIso}
                type="button"
                variant="outline"
                className="h-8 rounded-full border-violet-500/40 bg-violet-500/10 px-3 text-xs text-violet-200 hover:bg-violet-500/20"
                onClick={() => onSelectSlot(slot)}
              >
                {slotTimeLabel(slot)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
