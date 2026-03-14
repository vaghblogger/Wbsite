"use client";

import { motion } from "framer-motion";
import { AgentCard } from "./agent-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent } from "@/types";

const SKELETON_MIN_H = "min-h-[19rem] sm:min-h-[20.5rem]";

function AgentCardSkeleton() {
  return (
    <div
      className={`flex ${SKELETON_MIN_H} flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]`}
    >
      <Skeleton className="h-1 w-full shrink-0" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="min-h-[2.5rem] flex-1" />
        <div className="mt-auto flex justify-between border-t border-white/[0.04] pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

const GRID =
  "grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4";

export function AgentGrid({
  agents,
  loading,
}: {
  agents: Agent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 4 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className={GRID}
    >
      {agents.map((agent, i) => (
        <AgentCard key={agent.id} agent={agent} index={i} />
      ))}
    </motion.div>
  );
}
