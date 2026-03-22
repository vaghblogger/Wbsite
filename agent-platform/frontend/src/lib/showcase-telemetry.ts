export type ShowcaseTelemetryEvent =
  | "service_showcase_tab_selected"
  | "service_showcase_play_clicked"
  | "service_showcase_reset_clicked"
  | "service_showcase_scenario_changed"
  | "service_showcase_step_completed"
  | "service_showcase_cta_clicked";

export type ShowcaseTelemetryPayload = {
  slug: string;
  variant_id?: string;
  scenario_id?: string;
  device_type?: "mobile" | "tablet" | "desktop";
  [key: string]: unknown;
};

function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function trackShowcaseEvent(
  event: ShowcaseTelemetryEvent,
  payload: ShowcaseTelemetryPayload
) {
  const enriched = {
    ...payload,
    device_type: payload.device_type ?? detectDeviceType(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("showcase:telemetry", {
        detail: { event, payload: enriched },
      })
    );
  }

  // Keep this lightweight; replace with your analytics SDK when ready.
  console.log("[showcase-event]", event, enriched);
}

