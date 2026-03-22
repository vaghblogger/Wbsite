"use client";

import { useCallback, useMemo, useState } from "react";
import { getBookingRule } from "@/data/service-booking-rules";

export type ChatbotStep =
  | "welcome"
  | "service"
  | "duration"
  | "identity"
  | "existing"
  | "slots"
  | "confirm"
  | "success"
  | "fallback";

export type BookingSlot = {
  startIso: string;
  endIso: string;
  label: string;
};

export function useBookingChatbot(initialService = "generic") {
  const [step, setStep] = useState<ChatbotStep>("welcome");
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [durationMin, setDurationMin] = useState<number>(30);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [meetUrl, setMeetUrl] = useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedDurations = useMemo(
    () => getBookingRule(serviceSlug).allowedDurations,
    [serviceSlug]
  );

  const resetWizard = useCallback(() => {
    setStep("welcome");
    setServiceSlug(initialService);
    setDurationMin(30);
    setEmail("");
    setName("");
    setSlots([]);
    setSelectedSlot(null);
    setBookingsCount(0);
    setMeetUrl(null);
    setCalendarUrl(null);
    setLoading(false);
    setError(null);
  }, [initialService]);

  return {
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
  };
}
