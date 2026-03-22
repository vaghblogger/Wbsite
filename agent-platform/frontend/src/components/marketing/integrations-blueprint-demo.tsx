"use client";

import { PlugZap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShowcaseShell } from "./showcase-shell";
import type { ServiceShowcaseConfig } from "@/data/service-showcases";
import type { NodeStatus } from "@/types";
import {
  runIntegrationsBlueprintShowcase,
  type IntegrationsBlueprintResponse,
} from "@/lib/showcase-ai-client";
import { trackShowcaseEvent } from "@/lib/showcase-telemetry";

const PHASES = ["discover", "map", "connect", "validate", "deploy"] as const;
const STEP_RUNNING_MS = 800;
const STEP_GAP_MS = 160;

function emptyStates(): Record<string, NodeStatus> {
  return {};
}

const FALLBACK: IntegrationsBlueprintResponse = {
  systems: [
    { name: "CRM", role: "Customer context source" },
    { name: "Helpdesk", role: "Ticket lifecycle + SLA routing" },
    { name: "LLM Layer", role: "Intent, summarization, and action generation" },
    { name: "Automation", role: "Workflow execution and orchestration" },
  ],
  connections: [
    { from: "CRM", to: "LLM Layer", protocol: "API" },
    { from: "Helpdesk", to: "Automation", protocol: "Webhook" },
    { from: "LLM Layer", to: "Automation", protocol: "Event Bus" },
  ],
  implementationPhases: [
    "Discovery and system inventory",
    "Connector setup and auth hardening",
    "Workflow testing in staging",
    "Production rollout and monitoring",
  ],
  riskNotes: ["Legacy API rate limits require queue buffering."],
  effortBand: "4-6 weeks",
};

export function IntegrationsBlueprintDemo({ config }: { config: ServiceShowcaseConfig }) {
  const [activeScenarioId, setActiveScenarioId] = useState(config.defaultScenarioId);
  const [states, setStates] = useState<Record<string, NodeStatus>>(emptyStates);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<IntegrationsBlueprintResponse>(FALLBACK);
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
      const live = await runIntegrationsBlueprintShowcase({
        scenarioId: activeScenarioId,
        stackInputs: ["crm", "helpdesk", "warehouse"],
        complianceMode: "standard",
      });
      if (!cancelled && live) setResult(live);
    })();

    const tick = () => {
      if (cancelled) return;
      if (idx >= PHASES.length) {
        setIsPlaying(false);
        return;
      }
      const current = PHASES[idx];
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
      totalSteps={PHASES.length}
      slug={config.slug}
      ctaLabel={config.ctaLabel}
      tabIconMap={{
        "support-ops": PlugZap,
        "sales-ops": PlugZap,
        "internal-copilot": PlugZap,
      }}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium mb-3">Integrated systems</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {result.systems.map((sys) => (
              <div key={sys.name} className="rounded-md border border-white/10 bg-zinc-900/60 p-3">
                <p className="font-medium text-sm">{sys.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{sys.role}</p>
              </div>
            ))}
          </div>
          <p className="text-sm font-medium mt-4 mb-2">Connection map</p>
          <div className="space-y-2">
            {result.connections.map((c) => (
              <div key={`${c.from}-${c.to}`} className="text-xs rounded-md border border-white/10 px-3 py-2">
                {c.from} {"->"} {c.to} ({c.protocol})
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium">Delivery plan</p>
          <p className="text-xs text-muted-foreground mb-3">Estimated effort: {result.effortBand}</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {result.implementationPhases.map((p) => (
              <li key={p} className="rounded-md border border-white/10 bg-zinc-900/60 px-2 py-1.5">
                {p}
              </li>
            ))}
          </ul>
          {result.riskNotes[0] && (
            <p className="mt-3 text-xs rounded-md border border-amber-500/20 bg-amber-950/20 p-2 text-amber-200">
              {result.riskNotes[0]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2">
        {PHASES.map((phase) => (
          <div key={phase} className="rounded-md border border-white/10 px-2 py-1 text-xs">
            <span className="capitalize">{phase}</span>
            <span className="ml-2 uppercase text-muted-foreground">{states[phase] ?? "idle"}</span>
          </div>
        ))}
      </div>
    </ShowcaseShell>
  );
}

