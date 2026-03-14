"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeStatus } from "@/types";

interface CustomNodeData {
  label: string;
  status: NodeStatus;
  [key: string]: unknown;
}

function CustomNodeComponent({ data }: NodeProps) {
  const { label, status } = data as CustomNodeData;

  return (
    <motion.div
      layout
      animate={
        status === "running"
          ? { scale: [1, 1.04, 1] }
          : status === "completed"
          ? { scale: [1.06, 1] }
          : {}
      }
      transition={
        status === "running"
          ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          : { duration: 0.3, type: "spring", stiffness: 300 }
      }
      className={cn(
        "relative px-5 py-3 rounded-xl border min-w-[160px] text-center transition-all duration-300",
        status === "idle" &&
          "bg-zinc-800/60 border-zinc-700/50 text-zinc-300",
        status === "running" &&
          "bg-violet-500/10 border-violet-500/40 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.25)]",
        status === "completed" &&
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
      )}
    >
      {/* Pulsing ring for running state */}
      {status === "running" && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-violet-500/50 animate-pulse-glow" />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2"
      />

      <div className="flex items-center justify-center gap-2">
        {status === "running" && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
        )}
        {status === "completed" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          </motion.div>
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2"
      />
    </motion.div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
