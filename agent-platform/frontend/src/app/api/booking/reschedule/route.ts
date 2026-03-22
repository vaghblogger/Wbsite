import { NextResponse } from "next/server";
import { getBooking, lockSlot, unlockSlot, upsertBooking } from "@/lib/booking-store";
import { rescheduleBookingEvent } from "@/lib/google-calendar";

type RescheduleRequest = {
  bookingId?: string;
  newSlotStartIso?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RescheduleRequest;
  const bookingId = body.bookingId || "";
  const newSlotStartIso = body.newSlotStartIso || "";
  if (!bookingId || !newSlotStartIso) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", message: "bookingId and newSlotStartIso are required." },
      { status: 400 }
    );
  }

  const record = getBooking(bookingId);
  if (!record) {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "Booking not found." },
      { status: 404 }
    );
  }

  const slotKey = `${newSlotStartIso}|${record.durationMin}`;
  if (!lockSlot(slotKey)) {
    return NextResponse.json(
      { ok: false, code: "BOOKING_IN_PROGRESS", message: "Please retry booking update." },
      { status: 409 }
    );
  }

  try {
    const updated = await rescheduleBookingEvent({
      eventId: record.eventId,
      newSlotStartIso,
      durationMin: record.durationMin,
    });

    upsertBooking({
      ...record,
      slotStartIso: updated.startIso,
      slotEndIso: updated.endIso,
      meetUrl: updated.meetUrl,
      calendarUrl: updated.calendarUrl,
      status: "confirmed",
    });

    return NextResponse.json({
      ok: true,
      bookingId,
      eventId: updated.eventId,
      meetUrl: updated.meetUrl,
      calendarUrl: updated.calendarUrl,
      slotStartIso: updated.startIso,
      slotEndIso: updated.endIso,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "RESCHEDULE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    unlockSlot(slotKey);
  }
}
