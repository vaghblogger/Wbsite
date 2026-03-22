"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Bot,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  Database,
  FileCheck,
  GitMerge,
  Inbox,
  Layers,
  Loader2,
  MessagesSquare,
  PenLine,
  PhoneCall,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Ticket,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NodeStatus } from "@/types";
import Link from "next/link";
import {
  WORKFLOW_SHOWCASE_VARIANTS,
  type WorkflowShowcaseVariant,
} from "@/data/workflow-showcase";

const STEP_RUNNING_MS = 850;
const STEP_GAP_MS = 180;

const ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  file_check: FileCheck,
  users: Users,
  messages_square: MessagesSquare,
  git_merge: GitMerge,
  sparkles: Sparkles,
  waypoints: Waypoints,
  calendar_clock: CalendarClock,
  calendar: Calendar,
  ticket: Ticket,
  bell: Bell,
  layers: Layers,
  pen_line: PenLine,
  phone_call: PhoneCall,
  send: Send,
  database: Database,
};

const TAB_ICON_MAP: Record<string, LucideIcon> = {
  "marketing-automation": Sparkles,
  "ai-receptionist": PhoneCall,
};

function emptyStates(): Record<string, NodeStatus> {
  return {};
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <ChevronDown className="h-7 w-7 text-violet-500/45" strokeWidth={1.75} />
    </div>
  );
}

function JourneyStepCard({
  stepId,
  status,
  variant,
}: {
  stepId: string;
  status: NodeStatus;
  variant: WorkflowShowcaseVariant;
}) {
  const label = variant.stepLabels[stepId] ?? stepId;
  const detail = variant.details[stepId];
  const iconKey = variant.nodeIcons[stepId];
  const Icon = iconKey ? ICONS[iconKey] : undefined;

  return (
    <article
      data-journey-step={stepId}
      className={cn(
        "relative w-full max-w-md rounded-2xl border px-5 py-4 text-center shadow-lg transition-all duration-300 sm:px-6 sm:py-5",
        "border-white/[0.09] bg-gradient-to-b from-zinc-800/80 to-zinc-950/90",
        "ring-1 ring-inset ring-white/[0.04]",
        status === "idle" && "hover:border-violet-500/25 hover:shadow-violet-950/20",
        status === "running" &&
          "border-violet-400/55 shadow-[0_0_0_1px_rgba(139,92,246,0.45),0_14px_44px_rgba(139,92,246,0.22)]",
        status === "completed" &&
          "border-emerald-500/45 bg-gradient-to-b from-emerald-900/35 to-zinc-950/95 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_14px_44px_rgba(16,185,129,0.16)]"
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          status === "idle" && "border-zinc-600/80 text-zinc-400",
          status === "running" && "border-violet-400/60 text-violet-300",
          status === "completed" && "border-emerald-500/60 text-emerald-300"
        )}
      >
        {status === "idle" ? "Pending" : status}
      </span>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-inner sm:h-16 sm:w-16",
            "from-violet-500/20 via-zinc-900 to-zinc-950",
            status === "idle" && "border-white/10",
            status === "running" && "border-violet-400/50 animate-pulse-glow",
            status === "completed" && "border-emerald-500/40"
          )}
        >
          {status === "running" && (
            <Loader2 className="h-7 w-7 animate-spin text-violet-400" aria-hidden />
          )}
          {status === "completed" && <Check className="h-7 w-7 text-emerald-400" aria-hidden />}
          {status === "idle" && Icon && (
            <Icon className="h-7 w-7 text-violet-100/90" strokeWidth={1.75} aria-hidden />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {label}
          </h3>
          {detail && (
            <p className="text-left text-sm leading-relaxed text-muted-foreground sm:text-center">
              {detail.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function MarketingWorkflowExplorer() {
  const [activeVariantId, setActiveVariantId] = useState(WORKFLOW_SHOWCASE_VARIANTS[0].id);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeStatus>>(emptyStates);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeVariant = useMemo(
    () =>
      WORKFLOW_SHOWCASE_VARIANTS.find((v) => v.id === activeVariantId) ??
      WORKFLOW_SHOWCASE_VARIANTS[0],
    [activeVariantId]
  );

  const completedCount = Object.values(nodeStates).filter((s) => s === "completed").length;
  const progressPct =
    (completedCount / Math.max(activeVariant.playbackOrder.length, 1)) * 100;

  const clearPlayTimer = useCallback(() => {
    if (playTimerRef.current != null) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    clearPlayTimer();
    setIsPlaying(false);
    setNodeStates(emptyStates());
  }, [clearPlayTimer]);

  useEffect(() => {
    handleReset();
  }, [activeVariantId, handleReset]);

  useEffect(() => {
    if (!isPlaying) return;

    const order = activeVariant.playbackOrder;
    let index = 0;
    let cancelled = false;

    setNodeStates(emptyStates());

    const tick = () => {
      if (cancelled) return;

      if (index >= order.length) {
        setIsPlaying(false);
        return;
      }

      const current = order[index];

      setNodeStates((prev) => ({
        ...prev,
        [current]: "running",
      }));

      requestAnimationFrame(() => {
        document
          .querySelector(`[data-journey-step="${current}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      playTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        setNodeStates((prev) => ({
          ...prev,
          [current]: "completed",
        }));
        index += 1;
        playTimerRef.current = setTimeout(tick, STEP_GAP_MS);
      }, STEP_RUNNING_MS);
    };

    tick();

    return () => {
      cancelled = true;
      clearPlayTimer();
    };
  }, [isPlaying, activeVariant, clearPlayTimer]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2 sm:mb-3">
          Try a workflow
        </p>
      </div>
      <div className="mb-5 flex sm:grid sm:grid-cols-2 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory touch-pan-x">
        {WORKFLOW_SHOWCASE_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            type="button"
            className={cn(
              "relative text-left focus:outline-none group min-w-[min(100%,190px)] sm:min-w-0 w-[190px] sm:w-auto shrink-0 snap-center touch-manipulation",
              activeVariantId === variant.id
                ? "text-violet-200"
                : "text-zinc-300"
            )}
            onClick={() => setActiveVariantId(variant.id)}
          >
            {activeVariantId === variant.id && (
              <div className="absolute inset-0 rounded-xl border border-violet-500/40 shadow-[0_0_24px_rgba(139,92,246,0.2)]" />
            )}
            <div
              className={cn(
                "relative rounded-xl px-3 py-3 sm:px-4 sm:py-4 transition-all duration-200",
                activeVariantId === variant.id
                  ? "bg-violet-500/10 border border-transparent"
                  : "bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeVariantId === variant.id && (
                    <div className="absolute inset-0 rounded-full blur-lg opacity-40 bg-violet-500/80" />
                  )}
                  {(() => {
                    const Icon = TAB_ICON_MAP[variant.id] ?? Bot;
                    return (
                      <Icon
                        className={cn(
                          "relative h-6 w-6 transition-colors duration-200",
                          activeVariantId === variant.id ? "text-violet-300" : "text-zinc-500"
                        )}
                        strokeWidth={1.7}
                      />
                    );
                  })()}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[11px] uppercase tracking-[0.14em] font-semibold",
                      activeVariantId === variant.id ? "text-violet-300/90" : "text-zinc-500"
                    )}
                  >
                    Workflow
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      activeVariantId === variant.id ? "text-foreground" : "text-zinc-300"
                    )}
                  >
                    {variant.tabLabel}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-violet-500/15 bg-violet-950/15 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{activeVariant.highLevel}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <Button
          type="button"
          size="default"
          variant="default"
          className="h-10 gap-2 rounded-xl border-0 bg-violet-600 px-5 shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:bg-violet-500"
          disabled={isPlaying}
          onClick={() => {
            handleReset();
            setIsPlaying(true);
          }}
          aria-label="Play simulated workflow demo"
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
          onClick={handleReset}
          aria-label="Reset workflow visualization"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </Button>
      </div>
      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Workflow progress</span>
          <span>
            {completedCount}/{activeVariant.playbackOrder.length} completed
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div
        className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 via-zinc-950/80 to-black/40 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.04] sm:p-8 md:p-10"
        role="region"
        aria-label={`Reference automation workflow: ${activeVariant.title}`}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-0">
          {activeVariant.journey.map((phase, pi) => (
            <Fragment key={pi}>
              {pi > 0 && <FlowArrow />}
              {phase.kind === "sequence" ? (
                <div className="flex w-full flex-col items-center gap-0">
                  {phase.stepIds.map((id, si) => (
                    <Fragment key={id}>
                      {si > 0 && <FlowArrow />}
                      <JourneyStepCard
                        stepId={id}
                        status={nodeStates[id] || "idle"}
                        variant={activeVariant}
                      />
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-violet-300/85">
                    {phase.title}
                  </p>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                    {phase.columns.map((col, ci) => (
                      <div
                        key={ci}
                        className="flex flex-col items-center rounded-xl border border-violet-500/20 bg-violet-950/20 px-3 py-5 sm:px-5"
                      >
                        <span className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {phase.laneLabels?.[ci] ?? `Path ${ci + 1}`}
                        </span>
                        <div className="flex w-full flex-col items-center gap-0">
                          {col.map((id, ri) => (
                            <Fragment key={id}>
                              {ri > 0 && <FlowArrow />}
                              <JourneyStepCard
                                stepId={id}
                                status={nodeStates[id] || "idle"}
                                variant={activeVariant}
                              />
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground sm:text-left">
        Illustrative demo. We adapt these patterns to your exact systems and policies.
      </p>
      <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-950/20 p-4">
        <p className="text-sm text-zinc-300 mb-3">
          Want this workflow tailored to your stack and SOPs?
        </p>
        <Link
          href="/book?source=workflow-explorer"
          className="inline-flex rounded-lg border border-violet-500/35 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
        >
          Book a demo call
        </Link>
      </div>
    </div>
  );
}
