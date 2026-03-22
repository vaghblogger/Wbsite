import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { buildSlotsForService } from "@/lib/booking-rules";
import { createCalendarBooking, listBusyWindows } from "@/lib/google-calendar";
import { lockSlot, unlockSlot, upsertBooking } from "@/lib/booking-store";

type CreateRequest = {
  serviceSlug?: string;
  durationMin?: number;
  email?: string;
  name?: string;
  slotStartIso?: string;
  notes?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateRequest;
  const serviceSlug = body.serviceSlug || "generic";
  const durationMin = body.durationMin === 60 ? 60 : 30;
  const email = (body.email || "").trim().toLowerCase();
  const name = (body.name || "").trim();
  const slotStartIso = body.slotStartIso || "";

  if (!isEmail(email) || !name || !slotStartIso) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", message: "Missing required booking fields." },
      { status: 400 }
    );
  }

  const slotKey = `${slotStartIso}|${durationMin}`;
  if (!lockSlot(slotKey)) {
    return NextResponse.json(
      { ok: false, code: "BOOKING_IN_PROGRESS", message: "Slot is being booked. Please retry." },
      { status: 409 }
    );
  }

  try {
    const now = new Date();
    const max = new Date(now);
    max.setDate(max.getDate() + 21);
    const busyResult = await listBusyWindows(now.toISOString(), max.toISOString());
    if (busyResult.status !== "ok") {
      return NextResponse.json(
        {
          ok: false,
          code: "BOOKING_UNAVAILABLE",
          message:
            "Live calendar booking is temporarily unavailable. Please use contact for a manual confirmation.",
        },
        { status: 503 }
      );
    }
    const possibleSlots = buildSlotsForService({
      serviceSlug,
      durationMin,
      busy: busyResult.windows.map((b) => ({ start: new Date(b.startIso), end: new Date(b.endIso) })),
      now,
      maxSlots: 40,
    });
    const slotStillValid = possibleSlots.some((slot) => slot.startIso === slotStartIso);
    if (!slotStillValid) {
      return NextResponse.json(
        { ok: false, code: "SLOT_TAKEN", alternatives: possibleSlots.slice(0, 5) },
        { status: 409 }
      );
    }

    const created = await createCalendarBooking({
      email,
      name,
      serviceSlug,
      durationMin,
      slotStartIso,
      notes: body.notes,
    });

    const bookingId = randomUUID();
    upsertBooking({
      id: bookingId,
      eventId: created.eventId,
      email,
      serviceSlug,
      durationMin,
      slotStartIso: created.startIso,
      slotEndIso: created.endIso,
      meetUrl: created.meetUrl,
      calendarUrl: created.calendarUrl,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      bookingId,
      eventId: created.eventId,
      meetUrl: created.meetUrl,
      calendarUrl: created.calendarUrl,
      status: "confirmed",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.startsWith("GOOGLE_MEET_REQUIRED")) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEET_OR_INVITE_FAILED",
          message:
            message.replace(/^GOOGLE_MEET_REQUIRED:\s*/, "") ||
            "Could not add Google Meet or send the invite. Check Google Workspace: Meet enabled, external guests allowed, then try again.",
        },
        { status: 503 }
      );
    }

    if (
      message === "GOOGLE_CALENDAR_NOT_CONFIGURED" ||
      message === "GOOGLE_CALENDAR_AUTH_INVALID_KEY" ||
      message === "GOOGLE_CALENDAR_ID_NOT_FOUND"
    ) {
      if (message === "GOOGLE_CALENDAR_ID_NOT_FOUND") {
        console.error(
          "GOOGLE_CALENDAR_ID_NOT_FOUND: GOOGLE_CALENDAR_ID must be a calendar the API identity can access. " +
            "Without impersonation use the service account email, or share your calendar with that email and set GOOGLE_CALENDAR_ID to your calendar address/ID. " +
            "With GOOGLE_CALENDAR_IMPERSONATE_USER, primary or the user email is valid."
        );
      }
      return NextResponse.json(
        {
          ok: false,
          code: "BOOKING_UNAVAILABLE",
          message:
            "Live calendar booking is temporarily unavailable. Please use contact for a manual confirmation.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        code: "BOOKING_CREATE_FAILED",
        message,
      },
      { status: 500 }
    );
  } finally {
    unlockSlot(slotKey);
  }
}
