import { NextResponse } from "next/server";
import { buildSlotsForService } from "@/lib/booking-rules";
import { listBusyWindows } from "@/lib/google-calendar";

type AvailabilityRequest = {
  serviceSlug?: string;
  durationMin?: number;
  email?: string;
  timezone?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AvailabilityRequest;
    const durationMin = body.durationMin === 60 ? 60 : 30;
    const now = new Date();
    const max = new Date(now);
    max.setDate(max.getDate() + 21);

    const busyResult = await listBusyWindows(now.toISOString(), max.toISOString());
    if (busyResult.status === "unconfigured") {
      return NextResponse.json(
        {
          ok: false,
          slots: [],
          reason: "CALENDAR_NOT_CONFIGURED",
          message: "Live calendar is not connected. Please use Contact to book.",
        },
        { status: 503 }
      );
    }
    if (busyResult.status === "error") {
      return NextResponse.json(
        {
          ok: false,
          slots: [],
          reason: "CALENDAR_BUSY_LOOKUP_FAILED",
          message: "Could not verify calendar availability. Try again shortly or use Contact.",
        },
        { status: 503 }
      );
    }

    const slots = buildSlotsForService({
      serviceSlug: body.serviceSlug,
      durationMin,
      timezone: body.timezone || "Asia/Kolkata",
      busy: busyResult.windows.map((b) => ({ start: new Date(b.startIso), end: new Date(b.endIso) })),
      now,
      maxSlots: 24,
    });

    return NextResponse.json({
      ok: true,
      slots,
      reason: slots.length === 0 ? "NO_SLOTS" : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        slots: [],
        reason: "PROVIDER_ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
