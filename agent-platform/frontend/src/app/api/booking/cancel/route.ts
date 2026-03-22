import { NextResponse } from "next/server";
import { cancelBookingEvent } from "@/lib/google-calendar";
import { getBooking, upsertBooking } from "@/lib/booking-store";

type CancelRequest = {
  bookingId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CancelRequest;
    const bookingId = body.bookingId || "";
    if (!bookingId) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", message: "bookingId is required." },
        { status: 400 }
      );
    }

    const booking = getBooking(bookingId);
    if (!booking) {
      return NextResponse.json(
        { ok: false, code: "NOT_FOUND", message: "Booking not found." },
        { status: 404 }
      );
    }

    await cancelBookingEvent(booking.eventId);
    upsertBooking({ ...booking, status: "cancelled" });

    return NextResponse.json({
      ok: true,
      bookingId,
      status: "cancelled",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "CANCEL_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
