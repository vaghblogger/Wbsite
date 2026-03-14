"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  List,
  MapPin,
  Info,
  XCircle,
  AlertTriangle,
  Shield,
  User,
  LogIn,
  Package,
  Briefcase,
  BedDouble,
  Utensils,
  Sparkles,
  Plane,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import type { QuickAction } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  clock: Clock,
  list: List,
  "map-pin": MapPin,
  info: Info,
  "x-circle": XCircle,
  "alert-triangle": AlertTriangle,
  shield: Shield,
  user: User,
  "log-in": LogIn,
  package: Package,
  briefcase: Briefcase,
  "bed-double": BedDouble,
  utensils: Utensils,
  sparkles: Sparkles,
  plane: Plane,
};

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (message: string) => void;
  disabled?: boolean;
  accentText?: string;
  /** Initial empty state: compact grid */
  variant?: "grid" | "row";
}

export function QuickActions({
  actions,
  onAction,
  disabled,
  accentText = "text-violet-400",
  variant = "grid",
}: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  if (!actions.length) return null;

  const chipBase =
    "h-full min-h-[2.75rem] w-full rounded-lg border border-white/[0.08] bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700/90 active:scale-[0.98] disabled:opacity-40 touch-manipulation";

  /** Fixed 3×3 grid: up to 9 actions; empty cells keep layout stable. */
  const gridCells: (QuickAction | null)[] = [...actions.slice(0, 9)];
  while (gridCells.length < 9) gridCells.push(null);

  const renderGrid = (motionDelay: boolean) => (
    <div
      className="grid grid-cols-3 grid-rows-3 gap-1.5"
      style={{ gridTemplateRows: "repeat(3, minmax(2.75rem, auto))" }}
    >
      {gridCells.map((action, i) => {
        if (!action) {
          return (
            <div
              key={`empty-${i}`}
              className="min-h-[2.75rem] rounded-lg border border-transparent bg-transparent"
              aria-hidden
            />
          );
        }
        const Icon = iconMap[action.icon || ""] || HelpCircle;
        const btn = (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction(action.message)}
            className={`group flex h-full min-h-[2.75rem] w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center text-[10px] font-medium leading-tight sm:text-[11px] ${chipBase}`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 ${accentText} group-hover:scale-105`} />
            <span className="line-clamp-2 w-full break-words px-0.5">{action.label}</span>
          </button>
        );
        if (!motionDelay) return <div key={action.label}>{btn}</div>;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.12) }}
            className="min-h-0"
          >
            {btn}
          </motion.div>
        );
      })}
    </div>
  );

  const collapsedBar = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(true)}
      className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900/70 px-2.5 py-2 text-left transition-colors hover:bg-zinc-800/80 disabled:pointer-events-none disabled:opacity-40"
    >
      <Zap className={`h-3.5 w-3.5 shrink-0 ${accentText}`} />
      <span className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-400">
        <span className="text-zinc-200 font-medium">Quick actions</span>
        {" — "}
        tap to open shortcuts ({actions.length}) for booking, hours, and more.
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
    </button>
  );

  if (variant === "row") {
    return (
      <div className="w-full max-w-full min-w-0 shrink-0 border-t border-white/[0.06] bg-zinc-900/40 px-3 py-1.5 sm:px-4">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.div
              key="collapsed-row"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.9 }}
            >
              {collapsedBar}
            </motion.div>
          ) : (
            <motion.div
              key="expanded-row"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              className="overflow-hidden pt-1"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Quick actions
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  Hide
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
              <div className="pb-1 pt-0.5">{renderGrid(false)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="border-t border-white/[0.06] bg-zinc-900/35 px-3 py-1.5 sm:px-4">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="collapsed-grid"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.9 }}
          >
            {collapsedBar}
          </motion.div>
        ) : (
          <motion.div
            key="expanded-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Quick actions
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Hide
                <ChevronUp className="h-3 w-3" />
              </button>
            </div>
            {renderGrid(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
