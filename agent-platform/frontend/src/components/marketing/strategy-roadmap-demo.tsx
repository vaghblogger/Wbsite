"use client";

import { Map } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShowcaseShell } from "./showcase-shell";
import type { ServiceShowcaseConfig } from "@/data/service-showcases";
import type { NodeStatus } from "@/types";
import {
  runStrategyRoadmapShowcase,
  type StrategyRoadmapResponse,
} from "@/lib/showcase-ai-client";
import { trackShowcaseEvent } from "@/lib/showcase-telemetry";

const STEPS = ["discover", "pilot", "scale", "govern"] as const;
const STEP_RUNNING_MS = 820;
const STEP_GAP_MS = 170;

function emptyStates(): Record<string, NodeStatus> {
  return {};
}

const FALLBACK: StrategyRoadmapResponse = {
  phases: [
    { name: "Discover", summary: "Audit opportunities, constraints, and expected outcomes." },
    { name: "Pilot", summary: "Ship one high-impact workflow with measurable KPIs." },
    { name: "Scale", summary: "Expand proven workflows across teams and systems." },
    { name: "Govern", summary: "Add controls, monitoring, and operating model." },
  ],
  milestones: [
    "Week 2: Prioritized use-case backlog",
    "Week 5: Pilot in production with baseline metrics",
    "Week 10: Multi-team rollout plan finalized",
  ],
  estimatedOutcomes: ["15-25% process time reduction", "Lower escalation volume", "Faster decision cycles"],
  riskMatrix: ["Data readiness risk", "Adoption risk", "Integration dependency risk"],
  next90DaysPlan: ["Discovery workshop", "Pilot implementation", "Governance handoff"],
};

export function StrategyRoadmapDemo({ config }: { config: ServiceShowcaseConfig }) {
  const [activeScenarioId, setActiveScenarioId] = useState(config.defaultScenarioId);
  const [states, setStates] = useState<Record<string, NodeStatus>>(emptyStates);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<StrategyRoadmapResponse>(FALLBACK);
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

  useEffect(() => {
    if (!isPlaying) return;
    let idx = 0;
    let cancelled = false;

    (async () => {
      const live = await runStrategyRoadmapShowcase({
        profile: activeScenarioId,
        constraints: ["budget", "headcount"],
        priorities: ["automation", "governance"],
      });
      if (!cancelled && live) setResult(live);
    })();

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
  }, [activeScenarioId, clearTimer, config.slug, isPlaying]);

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
        "early-stage": Map,
        "mid-market": Map,
        enterprise: Map,
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium mb-2">Phased roadmap</p>
          <div className="space-y-2">
            {result.phases.map((phase) => {
              const key = phase.name.toLowerCase();
              const st = states[key] ?? "idle";
              return (
                <div key={phase.name} className="rounded-md border border-white/10 bg-zinc-900/60 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{phase.name}</span>
                    <span className="text-xs text-muted-foreground uppercase">{st}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{phase.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-medium mb-2">Milestones</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.milestones.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-medium mb-2">Expected outcomes</p>
            <ul className="space-y-1 text-sm text-emerald-200/90">
              {result.estimatedOutcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-medium mb-2">Risk matrix</p>
            <ul className="space-y-1 text-sm text-amber-200/90">
              {result.riskMatrix.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ShowcaseShell>
  );
}

