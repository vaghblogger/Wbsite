"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Calendar, ChevronLeft, MessageCircle, RotateCcw, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { CTA_TEXT, ctaBookHref } from "@/lib/cta";
import { CORE_SERVICE_CARDS } from "@/data/core-services";
import { BookingPanel } from "@/components/chat/booking-panel";
import { useBookingChatbot, type BookingSlot } from "@/hooks/use-booking-chatbot";

type AvailabilityResponse = {
  ok: boolean;
  slots: BookingSlot[];
  reason?: string;
  message?: string;
};

type BookingResponse = {
  ok: boolean;
  meetUrl?: string;
  calendarUrl?: string;
  code?: string;
  message?: string;
  alternatives?: BookingSlot[];
};

type LookupResponse = {
  ok: boolean;
  bookings: Array<{ eventId: string }>;
  message?: string;
  code?: string;
};

type LastFailed = "availability" | "lookup" | "book" | null;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function BookingChatbot() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [fallbackKind, setFallbackKind] = useState<"generic" | "booking-unavailable">("generic");
  const [lastFailed, setLastFailed] = useState<LastFailed>(null);
  const [lookupSkipped, setLookupSkipped] = useState(false);
  const {
    step,
    setStep,
    serviceSlug,
    setServiceSlug,
    durationMin,
    setDurationMin,
    email,
    setEmail,
    name,
    setName,
    slots,
    setSlots,
    selectedSlot,
    setSelectedSlot,
    bookingsCount,
    setBookingsCount,
    meetUrl,
    setMeetUrl,
    calendarUrl,
    setCalendarUrl,
    loading,
    setLoading,
    error,
    setError,
    allowedDurations,
    resetWizard,
  } = useBookingChatbot();

  const resetPanelUi = useCallback(() => {
    resetWizard();
    setNote("");
    setFallbackKind("generic");
    setLastFailed(null);
    setLookupSkipped(false);
  }, [resetWizard]);

  const serviceChoices = useMemo(
    () =>
      CORE_SERVICE_CARDS.map((item) => ({
        slug: item.href.split("/").pop() ?? "generic",
        title: item.title,
      })),
    []
  );

  const showIntroBlurb = step === "welcome" || step === "service" || step === "duration";

  useEffect(() => {
    if (params.get("openChat") === "1") {
      setOpen(true);
      resetPanelUi();
    }
  }, [params, resetPanelUi]);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      resetPanelUi();
    };
    window.addEventListener("open-booking-chatbot", handler);
    return () => window.removeEventListener("open-booking-chatbot", handler);
  }, [resetPanelUi]);

  async function fetchAvailabilitySlots(): Promise<BookingSlot[]> {
    const res = await fetch("/api/booking/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ serviceSlug, durationMin, email }),
    });
    const data = (await res.json()) as AvailabilityResponse;
    if (!res.ok || !data.ok) {
      throw new Error(data.message || data.reason || "Could not fetch slots.");
    }
    return data.slots || [];
  }

  async function runAvailability() {
    setLoading(true);
    setError(null);
    setFallbackKind("generic");
    setLastFailed(null);
    trackEvent("booking_chatbot_slot_fetch", { serviceSlug, durationMin });
    try {
      const nextSlots = await fetchAvailabilitySlots();
      setSlots(nextSlots);
      setStep("slots");
    } catch (e) {
      setLastFailed("availability");
      setError(e instanceof Error ? e.message : "Could not load slots.");
      setStep("fallback");
    } finally {
      setLoading(false);
    }
  }

  async function runLookup() {
    if (!isEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    setError(null);
    setFallbackKind("generic");
    setLastFailed(null);
    try {
      const res = await fetch("/api/booking/by-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as LookupResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Could not look up bookings.");
      }
      setLookupSkipped(false);
      setBookingsCount(data.bookings.length);
      setStep("existing");
    } catch (e) {
      setLastFailed("lookup");
      setError(e instanceof Error ? e.message : "Lookup failed.");
      setStep("fallback");
    } finally {
      setLoading(false);
    }
  }

  async function runBook() {
    if (!selectedSlot || !isEmail(email) || !name.trim()) {
      setError("Please complete all details before booking.");
      return;
    }
    setLoading(true);
    setError(null);
    setFallbackKind("generic");
    trackEvent("booking_chatbot_create_start", { serviceSlug, durationMin });
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          durationMin,
          email,
          name,
          slotStartIso: selectedSlot.startIso,
          notes: note,
        }),
      });
      const data = (await res.json()) as BookingResponse;
      if (!res.ok || !data.ok) {
        if (data.code === "BOOKING_IN_PROGRESS") {
          setError(data.message || "Another booking is in progress. Please try again in a moment.");
          return;
        }
        if (data.code === "SLOT_TAKEN") {
          if (data.alternatives?.length) {
            setSlots(data.alternatives);
            setStep("slots");
            setError("That slot was just taken. Please pick another.");
            return;
          }
          try {
            const nextSlots = await fetchAvailabilitySlots();
            setSlots(nextSlots);
            setStep("slots");
            setError("That slot was taken. Here are the latest open times.");
          } catch (e) {
            setLastFailed("book");
            setError(e instanceof Error ? e.message : "Could not refresh slots.");
            setStep("fallback");
          }
          return;
        }
        if (data.code === "BOOKING_UNAVAILABLE") {
          setFallbackKind("booking-unavailable");
          setError(null);
          setLastFailed("book");
          setStep("fallback");
          return;
        }
        if (data.code === "MEET_OR_INVITE_FAILED") {
          setFallbackKind("generic");
          setError(data.message || "Could not add Google Meet or send the invite.");
          setLastFailed("book");
          setStep("fallback");
          return;
        }
        throw new Error(data.message || "Booking failed");
      }
      setMeetUrl(data.meetUrl ?? null);
      setCalendarUrl(data.calendarUrl ?? null);
      setLastFailed(null);
      setStep("success");
      trackEvent("booking_chatbot_create_success", { serviceSlug, durationMin });
    } catch (e) {
      setLastFailed("book");
      setError(e instanceof Error ? e.message : "Booking failed.");
      setStep("fallback");
    } finally {
      setLoading(false);
    }
  }

  function retryFallback() {
    if (lastFailed === "lookup") void runLookup();
    else if (lastFailed === "book") void runBook();
    else void runAvailability();
  }

  function skipLookupToSlots() {
    setLookupSkipped(true);
    setBookingsCount(0);
    setError(null);
    setStep("existing");
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            resetPanelUi();
            setOpen(true);
            trackEvent("booking_chatbot_open_click", { source: "launcher" });
          }}
          className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-600 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-violet-900/40 transition hover:bg-violet-500"
          aria-label="Open booking assistant"
        >
          <MessageCircle className="h-4 w-4" />
          Book with AI
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-[70] flex h-[min(82vh,720px)] w-[min(94vw,440px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Bot className="h-4 w-4 shrink-0 text-violet-400" />
              <p className="truncate text-sm font-medium">AI Booking Assistant</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {step !== "welcome" && (
                <button
                  type="button"
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  onClick={resetPanelUi}
                  aria-label="Start over"
                  title="Start over"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                onClick={() => setOpen(false)}
                aria-label="Close booking assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {showIntroBlurb ? (
              <p className="rounded-lg bg-zinc-900 p-3 text-zinc-300">
                {CTA_TEXT.primary}. I can check live availability and schedule a Google Meet in under a
                minute. All slots are shown in IST.
              </p>
            ) : null}

            {step === "welcome" && (
              <div className="space-y-2">
                <Button className="w-full justify-start" onClick={() => setStep("service")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Start booking
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setServiceSlug("strategy-roadmapping");
                      setDurationMin(60);
                      setStep("identity");
                    }}
                  >
                    60 min strategy call
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDurationMin(30);
                      setStep("identity");
                    }}
                  >
                    Check my bookings
                  </Button>
                </div>
                <Link
                  href="/agents/ai-front-desk"
                  className="block rounded-lg border border-violet-500/25 bg-violet-500/10 p-3 text-sm text-violet-200 hover:bg-violet-500/15"
                >
                  Try the full AI receptionist demo →
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-lg border border-white/10 p-3 text-zinc-300 hover:bg-zinc-900"
                >
                  I prefer email instead
                </Link>
              </div>
            )}

            {step === "service" && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="mb-1 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => setStep("welcome")}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
                <p className="text-xs text-zinc-400">Select your primary interest:</p>
                {serviceChoices.slice(0, 6).map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => {
                      setServiceSlug(service.slug);
                      setStep("duration");
                    }}
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-left hover:bg-zinc-800"
                  >
                    {service.title}
                  </button>
                ))}
              </div>
            )}

            {step === "duration" && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="mb-1 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => setStep("service")}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
                <p className="text-xs text-zinc-400">Choose a duration:</p>
                <div className="flex gap-2">
                  {allowedDurations.map((duration) => (
                    <Button
                      key={duration}
                      type="button"
                      variant={durationMin === duration ? "default" : "outline"}
                      onClick={() => setDurationMin(duration)}
                    >
                      {duration} min
                    </Button>
                  ))}
                </div>
                <Button type="button" className="w-full" onClick={() => setStep("identity")}>
                  Continue
                </Button>
              </div>
            )}

            {(step === "identity" || step === "existing" || step === "slots" || step === "confirm") && (
              <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-900 p-3">
                <input
                  className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {step === "identity" && (
                  <div className="space-y-2">
                    <Button type="button" className="w-full" onClick={runLookup} disabled={loading}>
                      {loading ? "Checking..." : "Check existing bookings"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={skipLookupToSlots}
                      disabled={loading}
                    >
                      Skip — show available slots
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === "existing" && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="mb-1 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => setStep("identity")}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
                <p className="text-zinc-300">
                  {lookupSkipped
                    ? "Skipped email lookup. You can still book a new time below."
                    : bookingsCount > 0
                      ? `I found ${bookingsCount} upcoming booking(s) for this email.`
                      : "No upcoming booking found for this email."}
                </p>
                <Button type="button" className="w-full" onClick={runAvailability} disabled={loading}>
                  {loading ? "Loading slots..." : "Show available slots"}
                </Button>
              </div>
            )}

            {step === "slots" && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="mb-1 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    setSelectedSlot(null);
                    setStep("existing");
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
                <BookingPanel
                  slots={slots}
                  loading={loading}
                  onSelectSlot={(slot) => {
                    setSelectedSlot(slot);
                    setStep("confirm");
                  }}
                />
              </div>
            )}

            {step === "confirm" && selectedSlot && (
              <div className="space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
                <button
                  type="button"
                  className="mb-1 flex items-center gap-1 text-xs text-violet-200/80 hover:text-violet-100"
                  onClick={() => {
                    setSelectedSlot(null);
                    setStep("slots");
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Change time
                </button>
                <p className="text-sm text-violet-100">
                  Confirm {durationMin} min on{" "}
                  {new Date(selectedSlot.startIso).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST.
                </p>
                <textarea
                  className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  placeholder="Optional note for the call"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button type="button" className="w-full" onClick={runBook} disabled={loading}>
                  {loading ? "Booking..." : "Confirm booking"}
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                <p className="text-emerald-100">Booked. Your appointment is now in the calendar.</p>
                {meetUrl ? (
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-emerald-100 hover:bg-emerald-500/20"
                  >
                    Open Google Meet
                  </a>
                ) : null}
                {calendarUrl ? (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md border border-white/20 bg-white/5 px-3 py-2 text-zinc-200 hover:bg-white/10"
                  >
                    Open calendar event
                  </a>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-emerald-500/40 text-emerald-100"
                  onClick={resetPanelUi}
                >
                  Book another
                </Button>
              </div>
            )}

            {step === "fallback" && (
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                {error ? (
                  <p className="text-amber-100 text-xs leading-relaxed">{error}</p>
                ) : null}
                <p className="text-amber-100">
                  {fallbackKind === "booking-unavailable"
                    ? "Live booking is temporarily unavailable. Please use Contact and we will confirm your slot manually."
                    : error
                      ? "If this keeps happening, use Contact and we will confirm your slot manually."
                      : "I could not complete that right now. Try again or send your request via Contact."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {fallbackKind !== "booking-unavailable" && (
                    <Button type="button" variant="outline" onClick={retryFallback} disabled={loading}>
                      {loading ? "Retrying..." : "Retry"}
                    </Button>
                  )}
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-lg border border-white/15 px-3 py-2 text-zinc-200 hover:bg-zinc-900"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            )}

            {error && step !== "fallback" ? <p className="text-xs text-amber-300">{error}</p> : null}
          </div>

          <div className="border-t border-white/10 p-3 text-xs text-zinc-500">
            Availability is shown in real time via calendar.
            <Link className="ml-2 text-violet-300 hover:text-violet-200" href={ctaBookHref("chatbot")}>
              Open booking page
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
