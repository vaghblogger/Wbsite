import { getBookingRule } from "@/data/service-booking-rules";

type BusyRange = { start: Date; end: Date };

export type SlotCandidate = {
  startIso: string;
  endIso: string;
  label: string;
};

function parseTime(input: string): { hours: number; minutes: number } {
  const [h, m] = input.split(":").map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

function formatIstDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + days));
  return dt.toISOString().slice(0, 10);
}

function dayKeyFromYmd(ymd: string): DayKey {
  const middayIst = new Date(`${ymd}T12:00:00+05:30`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(middayIst);
  const map: Record<string, DayKey> = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  };
  return map[weekday] || "sun";
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function buildSlotsForService(args: {
  serviceSlug?: string;
  durationMin: number;
  busy: BusyRange[];
  now?: Date;
  maxSlots?: number;
  timezone?: string;
}): SlotCandidate[] {
  const {
    serviceSlug,
    durationMin,
    busy,
    now = new Date(),
    maxSlots = 20,
    timezone = "Asia/Kolkata",
  } = args;

  const rule = getBookingRule(serviceSlug);
  if (!rule.allowedDurations.includes(durationMin)) return [];

  const slots: SlotCandidate[] = [];
  const slotsPerDay = new Map<string, number>();
  const startYmd = formatIstDate(now);
  const endYmd = addDaysYmd(startYmd, rule.maxAdvanceDays);
  let cursorYmd = startYmd;

  while (cursorYmd <= endYmd && slots.length < maxSlots) {
    const ymd = cursorYmd;
    if (!rule.blockedDates.includes(ymd)) {
      const hours = rule.workingHoursByDay[dayKeyFromYmd(ymd)];
      if (hours) {
        const start = parseTime(hours.start);
        const end = parseTime(hours.end);
        const dayStart = new Date(
          `${ymd}T${String(start.hours).padStart(2, "0")}:${String(start.minutes).padStart(2, "0")}:00+05:30`
        );
        const dayEnd = new Date(
          `${ymd}T${String(end.hours).padStart(2, "0")}:${String(end.minutes).padStart(2, "0")}:00+05:30`
        );

        let current = new Date(dayStart);
        const minNotice = new Date(now.getTime() + rule.minNoticeMinutes * 60 * 1000);
        const durationMs = durationMin * 60 * 1000;
        const gapMs = (rule.bufferBeforeMin + rule.bufferAfterMin) * 60 * 1000;

        while (current.getTime() + durationMs <= dayEnd.getTime() && slots.length < maxSlots) {
          const slotStart = new Date(current);
          const slotEnd = new Date(current.getTime() + durationMs);

          const eligibleTime = slotStart >= minNotice;
          const conflict = busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
          const dayCount = slotsPerDay.get(ymd) ?? 0;
          const underDailyCap = dayCount < rule.dailyMaxBookings;
          if (eligibleTime && !conflict && underDailyCap) {
            slots.push({
              startIso: slotStart.toISOString(),
              endIso: slotEnd.toISOString(),
              label: slotStart.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                timeZone: timezone,
              }),
            });
            slotsPerDay.set(ymd, dayCount + 1);
          }
          current = new Date(current.getTime() + durationMs + gapMs);
        }
      }
    }
    cursorYmd = addDaysYmd(cursorYmd, 1);
  }

  return slots;
}
