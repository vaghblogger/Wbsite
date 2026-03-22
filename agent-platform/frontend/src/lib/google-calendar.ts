import { randomUUID } from "crypto";
import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

type BusyWindow = { startIso: string; endIso: string };

type CreateBookingInput = {
  email: string;
  name: string;
  serviceSlug: string;
  durationMin: number;
  slotStartIso: string;
  notes?: string;
};

type CreatedBooking = {
  eventId: string;
  meetUrl?: string;
  calendarUrl?: string;
  startIso: string;
  endIso: string;
};

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";

function isCalendarNotFoundError(error: unknown): boolean {
  const err = error as { code?: number; response?: { status?: number }; message?: string };
  if (err?.code === 404) return true;
  if (err?.response?.status === 404) return true;
  if (typeof err?.message === "string" && /not found/i.test(err.message)) return true;
  return false;
}

function getGoogleApiHttpStatus(error: unknown): number | undefined {
  const err = error as { response?: { status?: number } };
  return typeof err.response?.status === "number" ? err.response.status : undefined;
}

function logGoogleCalendarApiError(label: string, error: unknown): void {
  const err = error as {
    message?: string;
    response?: { status?: number; data?: unknown };
  };
  console.error(label, {
    message: err.message,
    status: err.response?.status,
    data: err.response?.data,
  });
}

function normalizePrivateKey(rawValue?: string): string | null {
  if (!rawValue) return null;

  let value = rawValue.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  // Support values pasted as escaped newlines.
  value = value.replace(/\\n/g, "\n");

  // Support base64-encoded key values (common in some secret managers).
  if (!value.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(value)) {
    try {
      const decoded = Buffer.from(value.replace(/\s+/g, ""), "base64").toString("utf8");
      if (decoded.includes("BEGIN")) {
        value = decoded;
      }
    } catch {
      // Fall through; validation below will handle unusable key text.
    }
  }

  if (!value.includes("BEGIN PRIVATE KEY")) {
    return null;
  }

  return value;
}

function requireGoogleConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  if (!clientEmail || !privateKey) {
    return null;
  }
  return { clientEmail, privateKey };
}

async function getCalendarClient() {
  const config = requireGoogleConfig();
  if (!config) return null;

  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    subject: process.env.GOOGLE_CALENDAR_IMPERSONATE_USER || undefined,
  });
  try {
    await auth.authorize();
  } catch (error) {
    console.error("GOOGLE_CALENDAR_AUTH_FAILED", error);
    throw new Error("GOOGLE_CALENDAR_AUTH_INVALID_KEY");
  }
  return google.calendar({ version: "v3", auth });
}

export async function isGoogleCalendarReady(): Promise<boolean> {
  return Boolean(requireGoogleConfig());
}

export type ListBusyWindowsResult = {
  windows: BusyWindow[];
  status: "ok" | "unconfigured" | "error";
};

export async function listBusyWindows(
  timeMinIso: string,
  timeMaxIso: string
): Promise<ListBusyWindowsResult> {
  try {
    const calendar = await getCalendarClient();
    if (!calendar) return { windows: [], status: "unconfigured" };

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMinIso,
        timeMax: timeMaxIso,
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busy = response.data.calendars?.[CALENDAR_ID]?.busy ?? [];
    const windows = busy
      .filter((b) => b.start && b.end)
      .map((b) => ({ startIso: String(b.start), endIso: String(b.end) }));
    return { windows, status: "ok" };
  } catch (error) {
    console.error("GOOGLE_CALENDAR_BUSY_LOOKUP_FAILED", error);
    return { windows: [], status: "error" };
  }
}

function meetUrlFromEvent(
  event: calendar_v3.Schema$Event | null | undefined
): string | undefined {
  const meetEntry = event?.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video"
  );
  return meetEntry?.uri ?? undefined;
}

function eventToCreated(
  event: calendar_v3.Schema$Event,
  fallbackStart: Date,
  fallbackEnd: Date
): CreatedBooking {
  if (!event.id) {
    throw new Error("GOOGLE_EVENT_CREATE_FAILED");
  }
  return {
    eventId: event.id,
    meetUrl: meetUrlFromEvent(event),
    calendarUrl: event.htmlLink ?? undefined,
    startIso: event.start?.dateTime ?? fallbackStart.toISOString(),
    endIso: event.end?.dateTime ?? fallbackEnd.toISOString(),
  };
}

/** Add Google Meet to an existing event and notify attendees (sendUpdates all). */
async function attachGoogleMeetAndNotify(
  calendar: calendar_v3.Calendar,
  eventId: string
): Promise<calendar_v3.Schema$Event> {
  const patchRes = await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });
  const updated = patchRes.data;
  if (!updated?.id) {
    throw new Error("GOOGLE_MEET_ATTACH_FAILED");
  }
  return updated;
}

/** When insert used sendUpdates none, nudge Calendar to email guests with a harmless description touch-up. */
async function notifyAttendeesAfterSilentInsert(
  calendar: calendar_v3.Calendar,
  eventId: string,
  currentDescription: string | null | undefined
): Promise<void> {
  const base = (currentDescription || "").trimEnd();
  const next =
    base.length > 0
      ? `${base}\n\n— Invitation sent from the booking assistant.`
      : "— Invitation sent from the booking assistant.";
  try {
    await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId,
      sendUpdates: "all",
      requestBody: { description: next },
    });
  } catch (error) {
    console.warn("GOOGLE_CALENDAR_NOTIFY_ATTENDEES_FAILED", error);
  }
}

export async function createCalendarBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  const calendar = await getCalendarClient();
  if (!calendar) {
    throw new Error("GOOGLE_CALENDAR_NOT_CONFIGURED");
  }

  const startDate = new Date(input.slotStartIso);
  const endDate = new Date(startDate.getTime() + input.durationMin * 60 * 1000);

  const baseDescription = input.notes || "Booked via website booking chatbot";

  type Strategy = {
    sendUpdates: "all" | "none";
    includeMeet: boolean;
    includeAttendees: boolean;
  };

  /** Never insert without the booker as attendee — avoids silent "solo block" bookings. */
  const strategies: Strategy[] = [
    { sendUpdates: "all", includeMeet: true, includeAttendees: true },
    { sendUpdates: "none", includeMeet: true, includeAttendees: true },
    { sendUpdates: "none", includeMeet: false, includeAttendees: true },
  ];

  let lastError: unknown;
  let insertedEvent: calendar_v3.Schema$Event | null = null;
  let usedSendUpdates: "all" | "none" = "none";

  for (let i = 0; i < strategies.length; i++) {
    const s = strategies[i];
    const isLast = i === strategies.length - 1;

    const requestBody: Record<string, unknown> = {
      summary: `Vagh Labs · ${input.serviceSlug}`,
      description: baseDescription,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      attendees: [{ email: input.email, displayName: input.name }],
    };

    if (s.includeMeet) {
      requestBody.conferenceData = {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    try {
      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        conferenceDataVersion: s.includeMeet ? 1 : 0,
        sendUpdates: s.sendUpdates,
        requestBody: requestBody as calendar_v3.Schema$Event,
      });

      const event = response.data;
      if (!event?.id) {
        throw new Error("GOOGLE_EVENT_CREATE_FAILED");
      }

      insertedEvent = event;
      usedSendUpdates = s.sendUpdates;
      break;
    } catch (error) {
      if (isCalendarNotFoundError(error)) {
        throw new Error("GOOGLE_CALENDAR_ID_NOT_FOUND");
      }

      const status = getGoogleApiHttpStatus(error);
      if (status === 404) {
        throw new Error("GOOGLE_CALENDAR_ID_NOT_FOUND");
      }

      if (status == null) {
        logGoogleCalendarApiError("GOOGLE_CALENDAR_INSERT_FAILED", error);
        throw error;
      }

      lastError = error;
      if (isLast) {
        break;
      }

      if (status === 403 || status === 400) {
        continue;
      }

      logGoogleCalendarApiError("GOOGLE_CALENDAR_INSERT_FAILED", error);
      throw error;
    }
  }

  if (!insertedEvent?.id) {
    logGoogleCalendarApiError("GOOGLE_CALENDAR_INSERT_FAILED_ALL_STRATEGIES", lastError);
    throw lastError instanceof Error ? lastError : new Error("GOOGLE_CALENDAR_INSERT_FAILED");
  }

  const insertedId = insertedEvent.id;
  let finalEvent: calendar_v3.Schema$Event = insertedEvent;
  let attendeesNotifiedByMeetPatch = false;

  if (!meetUrlFromEvent(finalEvent)) {
    try {
      finalEvent = await attachGoogleMeetAndNotify(calendar, insertedId);
      attendeesNotifiedByMeetPatch = true;
    } catch (error) {
      logGoogleCalendarApiError("GOOGLE_MEET_ATTACH_FAILED", error);
      throw new Error(
        "GOOGLE_MEET_REQUIRED: Could not add Google Meet or invite the guest. Check Workspace settings for Meet and external guests, then try again."
      );
    }
  }

  if (!meetUrlFromEvent(finalEvent)) {
    throw new Error(
      "GOOGLE_MEET_REQUIRED: Event was created but Google Meet is missing. Check Meet is enabled for this calendar."
    );
  }

  const finalId = finalEvent.id ?? insertedId;
  if (usedSendUpdates === "none" && !attendeesNotifiedByMeetPatch) {
    await notifyAttendeesAfterSilentInsert(calendar, finalId, finalEvent.description);
  }

  return eventToCreated(finalEvent, startDate, endDate);
}

export type ListUpcomingByEmailResult = {
  bookings: CreatedBooking[];
  status: "ok" | "unconfigured" | "error";
};

function eventToCreatedBooking(item: {
  id?: string | null;
  start?: { dateTime?: string | null } | null;
  end?: { dateTime?: string | null } | null;
  conferenceData?: { entryPoints?: { entryPointType?: string | null; uri?: string | null }[] } | null;
  htmlLink?: string | null;
}): CreatedBooking | null {
  if (!item.id || !item.start?.dateTime || !item.end?.dateTime) return null;
  const meetEntry = item.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video");
  return {
    eventId: String(item.id),
    meetUrl: meetEntry?.uri ?? undefined,
    calendarUrl: item.htmlLink ?? undefined,
    startIso: String(item.start.dateTime),
    endIso: String(item.end.dateTime),
  };
}

function eventMatchesGuestEmail(
  item: {
    attendees?: { email?: string | null }[] | null;
    organizer?: { email?: string | null } | null;
    summary?: string | null;
    description?: string | null;
  },
  normalizedEmail: string
): boolean {
  const attendees = item.attendees ?? [];
  if (attendees.some((a) => a.email?.toLowerCase() === normalizedEmail)) return true;
  if (item.organizer?.email?.toLowerCase() === normalizedEmail) return true;
  const text = `${item.summary ?? ""} ${item.description ?? ""}`.toLowerCase();
  return text.includes(normalizedEmail);
}

/** Upcoming events where the guest appears as attendee/organizer or email appears in text, plus q-search merge. */
export async function listUpcomingByEmail(email: string): Promise<ListUpcomingByEmailResult> {
  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();
  try {
    const calendar = await getCalendarClient();
    if (!calendar) return { bookings: [], status: "unconfigured" };

    const timeMin = new Date().toISOString();
    const [qResponse, listResponse] = await Promise.all([
      calendar.events.list({
        calendarId: CALENDAR_ID,
        q: trimmed,
        singleEvents: true,
        orderBy: "startTime",
        timeMin,
        maxResults: 25,
      }),
      calendar.events.list({
        calendarId: CALENDAR_ID,
        singleEvents: true,
        orderBy: "startTime",
        timeMin,
        maxResults: 100,
      }),
    ]);

    const byId = new Map<string, calendar_v3.Schema$Event>();
    for (const item of qResponse.data.items ?? []) {
      if (item.id) byId.set(item.id, item);
    }
    for (const item of listResponse.data.items ?? []) {
      if (item.id) byId.set(item.id, item);
    }

    const matched = [...byId.values()].filter(
      (item) => item.id && item.start?.dateTime && item.end?.dateTime && eventMatchesGuestEmail(item, normalized)
    );

    matched.sort((a, b) =>
      String(a.start?.dateTime).localeCompare(String(b.start?.dateTime))
    );

    const bookings: CreatedBooking[] = [];
    for (const item of matched) {
      const b = eventToCreatedBooking(item);
      if (b) bookings.push(b);
    }

    return { bookings, status: "ok" };
  } catch (error) {
    if (isCalendarNotFoundError(error)) {
      console.error(
        "GOOGLE_CALENDAR_LOOKUP_BY_EMAIL_FAILED: calendar not found (404). Same fix as create: valid GOOGLE_CALENDAR_ID + share calendar with service account if needed."
      );
    } else {
      console.error("GOOGLE_CALENDAR_LOOKUP_BY_EMAIL_FAILED", error);
    }
    return { bookings: [], status: "error" };
  }
}

export async function cancelBookingEvent(eventId: string): Promise<void> {
  const calendar = await getCalendarClient();
  if (!calendar) throw new Error("GOOGLE_CALENDAR_NOT_CONFIGURED");
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
    sendUpdates: "all",
  });
}

export async function rescheduleBookingEvent(args: {
  eventId: string;
  newSlotStartIso: string;
  durationMin: number;
}): Promise<CreatedBooking> {
  const calendar = await getCalendarClient();
  if (!calendar) throw new Error("GOOGLE_CALENDAR_NOT_CONFIGURED");

  const end = new Date(new Date(args.newSlotStartIso).getTime() + args.durationMin * 60000).toISOString();
  const response = await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId: args.eventId,
    sendUpdates: "all",
    requestBody: {
      start: { dateTime: args.newSlotStartIso },
      end: { dateTime: end },
    },
  });

  const event = response.data;
  const meetEntry = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video");
  return {
    eventId: String(event.id),
    meetUrl: meetEntry?.uri ?? undefined,
    calendarUrl: event.htmlLink ?? undefined,
    startIso: String(event.start?.dateTime ?? args.newSlotStartIso),
    endIso: String(event.end?.dateTime ?? end),
  };
}
