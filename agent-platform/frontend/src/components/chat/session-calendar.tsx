"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar as CalIcon,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  fetchSessionAppointments,
  fetchSlotsForDate,
  istYyyyMmDd,
  type SessionAppointment,
  type CalendarSlot,
} from "@/lib/api";

function parseIstDate(iso: string): { y: number; m: number; d: number } {
  const dt = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function SessionCalendar({
  sessionId,
  mergePhone,
  refreshKey,
  accentText = "text-violet-400",
  assistantName = "the assistant",
  onPickSlot,
}: {
  sessionId: string;
  /** After user lists appointments in chat, engine sends this — calendar loads their visits */
  mergePhone?: string | null;
  refreshKey?: number;
  accentText?: string;
  /** Shown in help copy (preset assistant name — avoids hardcoding one brand). */
  assistantName?: string;
  onPickSlot?: (dateYyyyMmDd: string, slot: CalendarSlot) => void;
}) {
  const [list, setList] = useState<SessionAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewY, setViewY] = useState(() => {
    const [y, m] = istYyyyMmDd(0).split("-").map(Number);
    return { y, m };
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchSessionAppointments(
      sessionId,
      mergePhone?.trim() || undefined
    ).then((a) => {
      setList(a);
      setLoading(false);
    });
  }, [sessionId, mergePhone]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const todayIst = istYyyyMmDd(0);
  const maxBookIst = istYyyyMmDd(14);
  const markedDays = useMemo(() => {
    const s = new Set<string>();
    for (const a of list) {
      const { y, m, d } = parseIstDate(a.start_iso_ist);
      s.add(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return s;
  }, [list]);

  const { y, m: mo } = viewY;
  const daysInMonth = new Date(y, mo, 0).getDate();
  const firstNoonIst = new Date(
    `${y}-${String(mo).padStart(2, "0")}-01T12:00:00+05:30`
  );
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(firstNoonIst);
  const order: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const pad = order[wd] ?? 0;

  const cells: (number | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedKey =
    selectedDay != null
      ? `${y}-${String(mo).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      : null;
  const apptsOnSelected =
    selectedKey != null
      ? list.filter((a) => {
          const p = parseIstDate(a.start_iso_ist);
          const k = `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
          return k === selectedKey;
        })
      : [];

  const openDay = async (day: number) => {
    const dateStr = `${y}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < todayIst || dateStr > maxBookIst) return;
    setSelectedDay(day);
    setSlotsLoading(true);
    const r = await fetchSlotsForDate(dateStr, sessionId);
    setSlots(r.slots || []);
    setSlotsLoading(false);
  };

  const prevMonth = () => {
    setViewY((v) => (v.m <= 1 ? { y: v.y - 1, m: 12 } : { y: v.y, m: v.m - 1 }));
    setSelectedDay(null);
    setSlots([]);
  };
  const nextMonth = () => {
    setViewY((v) => (v.m >= 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m: v.m + 1 }));
    setSelectedDay(null);
    setSlots([]);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-3 sm:p-4 max-w-full overflow-hidden touch-manipulation">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalIcon className={`h-4 w-4 shrink-0 ${accentText}`} />
          <span className="text-sm font-medium truncate">Your calendar</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => load()}
            className="p-2 rounded-lg border border-white/[0.08] bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-zinc-700"
            aria-label="Refresh calendar"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
        Bookings from <strong className="text-zinc-400">this chat</strong> show here.
        {mergePhone ? (
          <>
            {" "}
            <span className="text-emerald-400/90">
              Also shows visits for the phone you used with {assistantName} (e.g. “show my
              appointments”).
            </span>
          </>
        ) : (
          <> Ask {assistantName} to show your appointments once — then visits can appear here too.</>
        )}
      </p>

      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg border border-white/[0.08] bg-zinc-800/60 hover:bg-zinc-700/80"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-zinc-300">
          {y}-{String(mo).padStart(2, "0")} · IST
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg border border-white/[0.08] bg-zinc-800/60 hover:bg-zinc-700/80"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mb-1.5">
        Tap a day ({todayIst}–{maxBookIst} IST) — open times in the next 14 days
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null)
            return <div key={`e-${i}`} className="h-9 rounded-md bg-transparent" />;
          const key = `${y}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = key === todayIst;
          const hasAppt = markedDays.has(key);
          const isSel = selectedDay === day;
          const bookable = key >= todayIst && key <= maxBookIst;
          return (
            <button
              type="button"
              key={key}
              disabled={!bookable}
              onClick={() => openDay(day)}
              className={`h-9 rounded-md flex flex-col items-center justify-center text-xs relative transition-colors
                ${!bookable ? "opacity-35 cursor-not-allowed bg-zinc-900/40 text-zinc-600" : ""}
                ${bookable && isSel ? "ring-2 ring-violet-500 bg-violet-500/20" : ""}
                ${bookable && isToday && !isSel ? "ring-1 ring-violet-500/50 bg-violet-500/10" : ""}
                ${bookable && !isToday && !isSel ? "bg-zinc-800/50 hover:bg-zinc-700/60 active:bg-zinc-600/60" : ""}
                ${hasAppt && bookable ? "text-emerald-200" : bookable ? "text-zinc-400" : ""}`}
            >
              {day}
              {hasAppt && bookable && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDay != null && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
          <p className="text-[11px] font-medium text-zinc-300">{selectedKey}</p>
          {apptsOnSelected.length > 0 && (
            <ul className="space-y-2">
              {apptsOnSelected.map((a) => (
                <li
                  key={a.id}
                  className="flex gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] p-2"
                >
                  <CalendarCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-emerald-100 truncate">
                      {a.type}
                    </p>
                    {a.patient_name ? (
                      <p className="text-[10px] text-emerald-200/80 truncate">{a.patient_name}</p>
                    ) : null}
                    <p className="text-[10px] text-emerald-300/90 mt-0.5">
                      {new Date(a.start_iso_ist).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      IST
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-muted-foreground">Open times (tap to book in chat)</p>
          {slotsLoading ? (
            <p className="text-[11px] text-zinc-500">Loading…</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {slots.map((s) => (
                <button
                  key={s.start_iso_ist}
                  type="button"
                  onClick={() => onPickSlot?.(selectedKey!, s)}
                  className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-2 py-1 text-[11px] text-violet-200 hover:bg-violet-500/25 active:scale-[0.98]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {!slotsLoading && slots.length === 0 && (
            <p className="text-[10px] text-amber-200/80">
              No free slots or closed (Sun). Busy times stay available in chat only as “taken.”
            </p>
          )}
        </div>
      )}

      {list.length > 0 && !selectedDay && (
        <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 max-h-40 overflow-y-auto">
          {list.map((a) => (
            <li
              key={a.id}
              className="flex gap-2 rounded-lg border border-white/[0.08] bg-zinc-800/40 p-2"
            >
              <CalendarCheck className={`h-4 w-4 shrink-0 mt-0.5 ${accentText}`} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 items-start">
                  <span className="text-[11px] font-medium text-zinc-200 truncate">
                    {a.type}
                  </span>
                  <span className="shrink-0 text-[10px] text-violet-300/90 tabular-nums">
                    {new Date(a.start_iso_ist).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(a.start_iso_ist).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · IST
                </p>
                {a.patient_name ? (
                  <p className="text-[10px] text-zinc-400 truncate">{a.patient_name}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && list.length === 0 && (
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          No bookings in this chat yet. Book via chat — the calendar updates when a visit is
          confirmed.
        </p>
      )}
    </div>
  );
}
