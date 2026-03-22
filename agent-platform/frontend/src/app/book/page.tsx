"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CTA_TEXT } from "@/lib/cta";
import { trackEvent } from "@/lib/analytics";

export default function BookPage() {
  const onOpenBookingAssistant = () => {
    trackEvent("booking_assistant_open_click", { source: "book-page" });
    window.dispatchEvent(new Event("open-booking-chatbot"));
  };

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-20 sm:px-6">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          <CalendarClock className="h-3.5 w-3.5" />
          Booking assistant
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold sm:text-4xl">{CTA_TEXT.primary}</h1>
        <p className="mb-6 text-muted-foreground">
          Tell us your goals, choose a 30 or 60 minute slot, and confirm instantly with Google Meet
          included. Best for teams ready to start implementation in the next 30 to 90 days.
        </p>
        <button
          type="button"
          onClick={onOpenBookingAssistant}
          className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
        >
          Open AI booking assistant
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>

      <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">
        Prefer email?{" "}
        <Link href="/contact" className="text-primary hover:text-primary/85">
          Send your requirement and we will respond.
        </Link>
      </div>
    </section>
  );
}
