"use client";

import Link from "next/link";
import { Bot, Play, RotateCcw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShowcaseScenario } from "@/data/service-showcases";
import { trackShowcaseEvent } from "@/lib/showcase-telemetry";

type ShowcaseShellProps = {
  title: string;
  highLevelSummary: string;
  interactionHint: string;
  scenarios: ShowcaseScenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onPlay: () => void;
  onReset: () => void;
  isPlaying: boolean;
  completedCount: number;
  totalSteps: number;
  tabIconMap?: Record<string, LucideIcon>;
  slug: string;
  ctaLabel?: string;
  children: React.ReactNode;
};

export function ShowcaseShell({
  title,
  highLevelSummary,
  interactionHint,
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onPlay,
  onReset,
  isPlaying,
  completedCount,
  totalSteps,
  tabIconMap,
  slug,
  ctaLabel,
  children,
}: ShowcaseShellProps) {
  const progressPct = (completedCount / Math.max(totalSteps, 1)) * 100;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{interactionHint}</p>
      </div>

      <div className="mb-5 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory touch-pan-x">
        {scenarios.map((scenario) => {
          const isActive = activeScenarioId === scenario.id;
          const Icon = tabIconMap?.[scenario.id] ?? Bot;
          return (
            <button
              key={scenario.id}
              type="button"
              className={cn(
                "relative text-left focus:outline-none group min-w-[min(100%,220px)] sm:min-w-0 w-[220px] sm:w-auto shrink-0 snap-center touch-manipulation",
                isActive ? "text-violet-200" : "text-zinc-300"
              )}
              onClick={() => {
                trackShowcaseEvent("service_showcase_tab_selected", {
                  slug,
                  scenario_id: scenario.id,
                });
                onScenarioChange(scenario.id);
              }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl border border-violet-500/40 shadow-[0_0_24px_rgba(139,92,246,0.2)]" />
              )}
              <div
                className={cn(
                  "relative rounded-xl px-3 py-3 sm:px-4 sm:py-4 transition-all duration-200",
                  isActive
                    ? "bg-violet-500/10 border border-transparent"
                    : "bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5">
                    {isActive && (
                      <div className="absolute inset-0 rounded-full blur-lg opacity-40 bg-violet-500/80" />
                    )}
                    <Icon
                      className={cn(
                        "relative h-5 w-5 transition-colors duration-200",
                        isActive ? "text-violet-300" : "text-zinc-500"
                      )}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-foreground" : "text-zinc-300"
                      )}
                    >
                      {scenario.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl border border-violet-500/15 bg-violet-950/15 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{highLevelSummary}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <Button
          type="button"
          size="default"
          variant="default"
          className="h-10 gap-2 rounded-xl border-0 bg-violet-600 px-5 shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:bg-violet-500"
          disabled={isPlaying}
          onClick={onPlay}
          aria-label="Play simulated demo"
        >
          <Play className="h-4 w-4" aria-hidden />
          Play demo
        </Button>
        <Button
          type="button"
          size="default"
          variant="outline"
          className="h-10 gap-2 rounded-xl border-white/12 bg-zinc-950/40 px-5 backdrop-blur-sm hover:bg-zinc-900/60"
          disabled={isPlaying}
          onClick={onReset}
          aria-label="Reset simulation"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </Button>
      </div>

      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Workflow progress</span>
          <span>
            {completedCount}/{totalSteps} completed
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 via-zinc-950/80 to-black/40 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.04] sm:p-8 md:p-10">
        {children}
      </div>

      {ctaLabel && (
        <div className="mt-4 flex justify-start">
          <Link
            href="/#book-call"
            className="inline-flex rounded-lg border border-violet-500/35 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/20"
            onClick={() =>
              trackShowcaseEvent("service_showcase_cta_clicked", {
                slug,
                scenario_id: activeScenarioId,
              })
            }
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

