"use client";

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const event = {
    event: name,
    ...payload,
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(event);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }
}
