export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkingHours = {
  start: string;
  end: string;
};

export type ServiceBookingRule = {
  serviceSlug: string;
  allowedDurations: readonly number[];
  defaultDuration: number;
  workingHoursByDay: Partial<Record<DayKey, WorkingHours>>;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  blockedDates: readonly string[];
  dailyMaxBookings: number;
};

const BASE_HOURS: Partial<Record<DayKey, WorkingHours>> = {
  mon: { start: "18:00", end: "21:00" },
  tue: { start: "18:00", end: "21:00" },
  wed: { start: "18:00", end: "21:00" },
  thu: { start: "18:00", end: "21:00" },
  fri: { start: "18:00", end: "21:00" },
  sat: { start: "09:00", end: "19:00" },
  sun: { start: "09:00", end: "19:00" },
};

const BASE_RULE = {
  allowedDurations: [30, 60],
  defaultDuration: 30,
  workingHoursByDay: BASE_HOURS,
  bufferBeforeMin: 0,
  bufferAfterMin: 0,
  minNoticeMinutes: 60,
  maxAdvanceDays: 21,
  blockedDates: [],
  dailyMaxBookings: 10,
} as const;

export const SERVICE_BOOKING_RULES: Record<string, ServiceBookingRule> = {
  "workflow-automation": {
    ...BASE_RULE,
    serviceSlug: "workflow-automation",
    defaultDuration: 60,
  },
  "document-data-processing": {
    ...BASE_RULE,
    serviceSlug: "document-data-processing",
  },
  "analytics-insights": {
    ...BASE_RULE,
    serviceSlug: "analytics-insights",
    defaultDuration: 60,
  },
  "integrations-custom": {
    ...BASE_RULE,
    serviceSlug: "integrations-custom",
    defaultDuration: 60,
  },
  "strategy-roadmapping": {
    ...BASE_RULE,
    serviceSlug: "strategy-roadmapping",
    defaultDuration: 60,
  },
  "ai-chatbots": {
    ...BASE_RULE,
    serviceSlug: "ai-chatbots",
  },
  "ai-front-desk": {
    ...BASE_RULE,
    serviceSlug: "ai-front-desk",
  },
  generic: {
    ...BASE_RULE,
    serviceSlug: "generic",
  },
};

export function getBookingRule(serviceSlug?: string): ServiceBookingRule {
  if (!serviceSlug) return SERVICE_BOOKING_RULES.generic;
  return SERVICE_BOOKING_RULES[serviceSlug] ?? SERVICE_BOOKING_RULES.generic;
}
