"use client";

import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShowcaseShell } from "./showcase-shell";
import type { ServiceShowcaseConfig } from "@/data/service-showcases";
import type { NodeStatus } from "@/types";
import {
  runAnalyticsInsightsShowcase,
  type AnalyticsInsightsResponse,
} from "@/lib/showcase-ai-client";
import { trackShowcaseEvent } from "@/lib/showcase-telemetry";

const STEPS = ["ingest", "detect", "explain", "recommend", "publish"] as const;
const STEP_LABELS: Record<string, string> = {
  ingest: "Aggregate metrics",
  detect: "Detect anomalies",
  explain: "Generate insight",
  recommend: "Recommend actions",
  publish: "Publish summary",
};
const STEP_RUNNING_MS = 820;
const STEP_GAP_MS = 170;

function emptyStates(): Record<string, NodeStatus> {
  return {};
}

const FALLBACK: AnalyticsInsightsResponse = {
  kpis: [
    { label: "Revenue", value: "$412k", delta: "+5.2%" },
    { label: "Churn Risk", value: "8.4%", delta: "-1.1%" },
    { label: "Resolution Time", value: "5.2h", delta: "-9.0%" },
  ],
  signals: ["Checkout conversion dipped in APAC", "Support backlog rising in enterprise queue"],
  insights: [
    "Revenue softening is concentrated in a single high-volume segment.",
    "Most delayed tickets map to two unresolved integration issues.",
  ],
  recommendedActions: [
    "Prioritize enterprise queue with routing override for top-tier accounts.",
    "Launch checkout recovery flow for APAC campaign traffic.",
  ],
  riskFlags: ["If unresolved for 2 weeks, churn risk may increase by 1.8%."],
};

export function AnalyticsInsightsDemo({ config }: { config: ServiceShowcaseConfig }) {
  const [activeScenarioId, setActiveScenarioId] = useState(config.defaultScenarioId);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [simulateDrop, setSimulateDrop] = useState(false);
  const [states, setStates] = useState<Record<string, NodeStatus>>(emptyStates);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<AnalyticsInsightsResponse>(FALLBACK);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = useMemo(
    () => Object.values(states).filter((s) => s === "completed").length,
    [states]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setStates(emptyStates());
    trackShowcaseEvent("service_showcase_reset_clicked", {
      slug: config.slug,
      scenario_id: activeScenarioId,
    });
  }, [activeScenarioId, clearTimer, config.slug]);

  useEffect(() => {
    handleReset();
    trackShowcaseEvent("service_showcase_scenario_changed", {
      slug: config.slug,
      scenario_id: activeScenarioId,
    });
  }, [activeScenarioId, config.slug, handleReset]);

  const runLive = useCallback(async () => {
    const live = await runAnalyticsInsightsShowcase({
      scenarioId: activeScenarioId,
      timeframe,
      perturbation: simulateDrop ? "demand-drop" : "none",
    });
    setResult(live ?? FALLBACK);
  }, [activeScenarioId, simulateDrop, timeframe]);

  useEffect(() => {
    if (!isPlaying) return;
    let idx = 0;
    let cancelled = false;

    runLive();

    const tick = () => {
      if (cancelled) return;
      if (idx >= STEPS.length) {
        setIsPlaying(false);
        return;
      }
      const current = STEPS[idx];
      setStates((prev) => ({ ...prev, [current]: "running" }));
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        setStates((prev) => ({ ...prev, [current]: "completed" }));
        trackShowcaseEvent("service_showcase_step_completed", {
          slug: config.slug,
          scenario_id: activeScenarioId,
          variant_id: current,
        });
        idx += 1;
        timerRef.current = setTimeout(tick, STEP_GAP_MS);
      }, STEP_RUNNING_MS);
    };

    tick();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [activeScenarioId, clearTimer, config.slug, isPlaying, runLive]);

  return (
    <ShowcaseShell
      title={config.title}
      highLevelSummary={config.highLevelSummary}
      interactionHint={config.interactionHint}
      scenarios={config.scenarios}
      activeScenarioId={activeScenarioId}
      onScenarioChange={setActiveScenarioId}
      onPlay={() => {
        handleReset();
        setIsPlaying(true);
        trackShowcaseEvent("service_showcase_play_clicked", {
          slug: config.slug,
          scenario_id: activeScenarioId,
        });
      }}
      onReset={handleReset}
      isPlaying={isPlaying}
      completedCount={completedCount}
      totalSteps={STEPS.length}
      slug={config.slug}
      ctaLabel={config.ctaLabel}
      tabIconMap={{
        "revenue-pulse": BarChart3,
        "support-health": BarChart3,
        "funnel-conversion": BarChart3,
      }}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(["7d", "30d", "90d"] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            className={`rounded-md border px-3 py-1 text-xs ${
              timeframe === tf
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-white/15 text-zinc-300"
            }`}
            onClick={() => setTimeframe(tf)}
          >
            {tf.toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          className={`rounded-md border px-3 py-1 text-xs ${
            simulateDrop
              ? "border-amber-500/40 bg-amber-900/20 text-amber-200"
              : "border-white/15 text-zinc-300"
          }`}
          onClick={() => setSimulateDrop((v) => !v)}
        >
          Simulate demand drop
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {result.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
            <p className="text-xs text-emerald-300 mt-1">{kpi.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium mb-2">Signals & Insights</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[...result.signals, ...result.insights].slice(0, 4).map((item) => (
              <li key={item} className="rounded-md bg-zinc-900/60 px-3 py-2 border border-white/5">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium mb-2">Recommended actions</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {result.recommendedActions.map((item) => (
              <li key={item} className="rounded-md bg-zinc-900/60 px-3 py-2 border border-white/5">
                {item}
              </li>
            ))}
          </ul>
          {result.riskFlags[0] && (
            <p className="text-xs text-amber-200 mt-3 border border-amber-500/20 rounded-md p-2 bg-amber-950/20">
              {result.riskFlags[0]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {STEPS.map((step) => (
          <div key={step} className="rounded-md border border-white/10 px-2 py-1 text-xs">
            <span>{STEP_LABELS[step]}</span>
            <span className="ml-2 uppercase text-muted-foreground">{states[step] ?? "idle"}</span>
          </div>
        ))}
      </div>
    </ShowcaseShell>
  );
}

