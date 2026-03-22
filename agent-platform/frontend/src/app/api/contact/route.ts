import { NextResponse } from "next/server";

type ContactRequest = {
  name?: string;
  email?: string;
  company?: string;
  timeline?: string;
  useCase?: string;
  stack?: string;
  message?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequest;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    const company = (body.company || "").trim();
    const timeline = (body.timeline || "").trim();
    const useCase = (body.useCase || "").trim();
    const stack = (body.stack || "").trim();

    if (!name || !isEmail(email) || message.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Please fill in a valid name, email, and message." },
        { status: 400 }
      );
    }

    // Placeholder until SMTP/helpdesk integration is connected.
    console.info("CONTACT_FORM_SUBMISSION", {
      name,
      email,
      company,
      timeline,
      useCase,
      stack,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to submit right now.",
      },
      { status: 500 }
    );
  }
}
