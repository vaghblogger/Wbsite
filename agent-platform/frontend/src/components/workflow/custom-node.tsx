"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  CalendarClock,
  Check,
  Database,
  GitMerge,
  Inbox,
  Layers,
  Loader2,
  MessagesSquare,
  PenLine,
  Send,
  Sparkles,
  Ticket,
  Users,
  FileCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeStatus } from "@/types";
import { WorkflowNodeHint } from "./workflow-node-hint";

const NODE_ICON_MAP: Record<string, LucideIcon> = {
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
  send: Send,
  database: Database,
};

export interface CustomNodeData {
  label: string;
  status: NodeStatus;
  /** When set, render icon-forward card (marketing workflow). */
  iconId?: string;
  /** Handle positions: horizontal = L→R pipeline. */
  flowDirection?: "vertical" | "horizontal";
  hintTitle?: string;
  hintDescription?: string;
  [key: string]: unknown;
}

function CustomNodeComponent({ data }: NodeProps) {
  const { label, status, iconId, flowDirection = "vertical", hintTitle, hintDescription } =
    data as CustomNodeData;
  const Icon = iconId ? NODE_ICON_MAP[iconId] : undefined;
  const iconMode = Boolean(Icon);
  const horizontal = flowDirection === "horizontal";

  const targetPos = horizontal ? Position.Left : Position.Top;
  const sourcePos = horizontal ? Position.Right : Position.Bottom;

  const symbol = (() => {
    if (status === "running") {
      return <Loader2 className="h-[1.125rem] w-[1.125rem] animate-spin text-violet-400" aria-hidden />;
    }
    if (status === "completed") {
      return (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Check className="h-[1.125rem] w-[1.125rem] text-emerald-400" aria-hidden />
        </motion.div>
      );
    }
    if (Icon) {
      return <Icon className="h-[1.125rem] w-[1.125rem] text-violet-100/90" strokeWidth={1.85} aria-hidden />;
    }
    return null;
  })();

  const a11yLabel =
    iconMode && hintTitle && hintDescription
      ? `${hintTitle}. ${hintDescription}`
      : undefined;

  const card = (
    <motion.div
      layout
      aria-label={a11yLabel}
      animate={
        status === "running"
          ? { scale: [1, 1.03, 1] }
          : status === "completed"
          ? { scale: [1.04, 1] }
          : {}
      }
      transition={
        status === "running"
          ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          : { duration: 0.35, type: "spring", stiffness: 320 }
      }
      className={cn(
        "group/card relative rounded-2xl border text-center transition-[box-shadow,border-color,background-color] duration-300",
        iconMode
          ? horizontal
            ? "px-3 py-2.5 min-w-[118px] max-w-[140px]"
            : "px-3 py-3 min-w-[132px] max-w-[168px]"
          : "px-5 py-3 min-w-[160px]",
        "border-white/[0.08] bg-gradient-to-b from-zinc-800/75 to-zinc-900/85 shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
        "hover:border-violet-500/25 hover:shadow-[0_8px_36px_rgba(139,92,246,0.12)]",
        status === "idle" && "text-zinc-200",
        status === "running" &&
          "border-violet-400/45 from-violet-950/40 to-zinc-900/90 text-violet-100 shadow-[0_0_28px_rgba(139,92,246,0.2)]",
        status === "completed" &&
          "border-emerald-500/35 from-emerald-950/25 to-zinc-900/90 text-emerald-100/95 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
      )}
    >
      {status === "running" && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-violet-400/35 ring-offset-0 animate-pulse-glow" />
      )}

      <Handle
        type="target"
        position={targetPos}
        className="!h-2 !w-2 !border !border-zinc-500/80 !bg-zinc-700"
      />

      {iconMode ? (
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-inner",
              "from-violet-500/15 via-zinc-900/90 to-zinc-950/90",
              status === "idle" && "border-white/10 group-hover/card:border-violet-400/25",
              status === "running" && "border-violet-400/40",
              status === "completed" && "border-emerald-400/35"
            )}
          >
            {symbol}
          </div>
          <span
            className={cn(
              "px-0.5 font-semibold leading-tight text-balance text-zinc-100/95",
              horizontal ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs"
            )}
          >
            {label}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {status === "running" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" aria-hidden />
          )}
          {status === "completed" && !Icon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            </motion.div>
          )}
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}

      <Handle
        type="source"
        position={sourcePos}
        className="!h-2 !w-2 !border !border-zinc-500/80 !bg-zinc-700"
      />
    </motion.div>
  );

  if (iconMode && hintTitle && hintDescription) {
    return (
      <WorkflowNodeHint title={hintTitle} description={hintDescription}>
        {card}
      </WorkflowNodeHint>
    );
  }

  return card;
}

export const CustomNode = memo(CustomNodeComponent);
