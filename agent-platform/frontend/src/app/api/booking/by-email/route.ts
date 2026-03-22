import { NextResponse } from "next/server";
import { listUpcomingByEmail } from "@/lib/google-calendar";

type LookupRequest = {
  email?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupRequest;
    const email = (body.email || "").trim().toLowerCase();
    if (!isEmail(email)) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", message: "Valid email is required." },
        { status: 400 }
      );
    }

    const { bookings, status } = await listUpcomingByEmail(email);
    if (status === "unconfigured") {
      return NextResponse.json(
        {
          ok: false,
          code: "LOOKUP_UNAVAILABLE",
          bookings: [],
          message: "Booking lookup is not available right now. Please use Contact.",
        },
        { status: 503 }
      );
    }
    if (status === "error") {
      return NextResponse.json(
        {
          ok: false,
          code: "LOOKUP_FAILED",
          bookings: [],
          message: "Could not look up bookings. Try again shortly.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, bookings });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "LOOKUP_FAILED",
        bookings: [],
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
