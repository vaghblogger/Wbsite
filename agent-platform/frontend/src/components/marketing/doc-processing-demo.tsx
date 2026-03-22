"use client";

import { FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShowcaseShell } from "./showcase-shell";
import type { NodeStatus } from "@/types";
import type { ServiceShowcaseConfig } from "@/data/service-showcases";
import {
  runDocProcessingShowcase,
  type DocProcessingResponse,
} from "@/lib/showcase-ai-client";
import { trackShowcaseEvent } from "@/lib/showcase-telemetry";

const STEP_RUNNING_MS = 850;
const STEP_GAP_MS = 180;

const SCENARIO_STEPS: Record<string, string[]> = {
  invoice: ["ingest", "ocr", "classify", "extract", "validate", "sync"],
  "kyc-form": ["ingest", "ocr", "classify", "extract", "verify", "sync"],
  contract: ["ingest", "ocr", "classify", "extract", "risk-check", "sync"],
};

const STEP_LABELS: Record<string, string> = {
  ingest: "Ingest file",
  ocr: "OCR & parse",
  classify: "Classify type",
  extract: "Extract fields",
  validate: "Validate totals",
  verify: "Verify identity",
  "risk-check": "Risk check clauses",
  sync: "Sync output",
};

function emptyStates(): Record<string, NodeStatus> {
  return {};
}

function fallbackPayload(scenarioId: string): DocProcessingResponse {
  if (scenarioId === "kyc-form") {
    return {
      steps: SCENARIO_STEPS["kyc-form"],
      extractedFields: [
        { key: "Full Name", value: "Aanya Kapoor" },
        { key: "Document Type", value: "Passport" },
        { key: "DOB", value: "1992-08-14" },
        { key: "Address Match", value: "Verified" },
      ],
      confidence: 0.96,
      validationIssues: [],
      finalPayloadPreview: "KYC profile prepared for onboarding queue.",
    };
  }
  if (scenarioId === "contract") {
    return {
      steps: SCENARIO_STEPS.contract,
      extractedFields: [
        { key: "Party A", value: "Acme Logistics" },
        { key: "Party B", value: "Northstar Retail" },
        { key: "Effective Date", value: "2026-02-01" },
        { key: "Renewal Clause", value: "Auto-renew (12 months)" },
      ],
      confidence: 0.91,
      validationIssues: ["Liability cap clause requires legal review."],
      finalPayloadPreview: "Contract summary sent to legal workflow.",
    };
  }
  return {
    steps: SCENARIO_STEPS.invoice,
    extractedFields: [
      { key: "Invoice #", value: "INV-2048" },
      { key: "Vendor", value: "BluePeak Supplies" },
      { key: "Total", value: "$12,480.00" },
      { key: "Due Date", value: "2026-04-08" },
    ],
    confidence: 0.94,
    validationIssues: [],
    finalPayloadPreview: "Invoice exported to AP queue + ERP sync.",
  };
}

export function DocProcessingDemo({ config }: { config: ServiceShowcaseConfig }) {
  const [activeScenarioId, setActiveScenarioId] = useState(config.defaultScenarioId);
  const [states, setStates] = useState<Record<string, NodeStatus>>(emptyStates);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<DocProcessingResponse>(fallbackPayload(config.defaultScenarioId));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = useMemo(() => SCENARIO_STEPS[activeScenarioId] ?? SCENARIO_STEPS.invoice, [activeScenarioId]);
  const completedCount = Object.values(states).filter((s) => s === "completed").length;

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
    setResult(fallbackPayload(activeScenarioId));
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
      const live = await runDocProcessingShowcase({
        scenarioId: activeScenarioId,
        sampleId: activeScenarioId,
        mode: "simulated",
      });
      if (!cancelled && live) setResult(live);
    })();

    const tick = () => {
      if (cancelled) return;
      if (idx >= steps.length) {
        setIsPlaying(false);
        return;
      }
      const current = steps[idx];
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
  }, [activeScenarioId, clearTimer, config.slug, isPlaying, steps]);

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
      totalSteps={steps.length}
      slug={config.slug}
      ctaLabel={config.ctaLabel}
      tabIconMap={{
        invoice: FileText,
        "kyc-form": FileText,
        contract: FileText,
      }}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sample input</p>
          <div className="rounded-lg border border-dashed border-violet-500/30 bg-zinc-900/60 px-4 py-6 text-sm text-zinc-300">
            {activeScenarioId === "invoice" && "Invoice PDF: vendor, line items, tax, totals"}
            {activeScenarioId === "kyc-form" && "KYC Form: identity fields + supporting document"}
            {activeScenarioId === "contract" && "Contract PDF: clauses, terms, obligations"}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{result.finalPayloadPreview}</p>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((step) => {
              const st = states[step] ?? "idle";
              return (
                <div
                  key={step}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    st === "completed"
                      ? "border-emerald-500/40 bg-emerald-900/20"
                      : st === "running"
                      ? "border-violet-500/50 bg-violet-900/20"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <span className="font-medium">{STEP_LABELS[step] ?? step}</span>
                  <span className="ml-2 text-xs text-muted-foreground uppercase">{st}</span>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Extracted fields</p>
              <p className="text-xs text-muted-foreground">Confidence {(result.confidence * 100).toFixed(0)}%</p>
            </div>
            <div className="space-y-2">
              {result.extractedFields.map((f) => (
                <div key={f.key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.key}</span>
                  <span>{f.value}</span>
                </div>
              ))}
            </div>
            {result.validationIssues.length > 0 && (
              <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-950/20 p-2 text-xs text-amber-200">
                {result.validationIssues[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShowcaseShell>
  );
}

