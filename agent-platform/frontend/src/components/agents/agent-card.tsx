"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Headset,
  LifeBuoy,
  Target,
  Search,
  Bot,
  ArrowRight,
  Eye,
  SmilePlus,
  Building2,
  BedDouble,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAccentColor } from "@/lib/utils";
import type { Agent } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  headset: Headset,
  "life-buoy": LifeBuoy,
  target: Target,
  search: Search,
  bot: Bot,
  eye: Eye,
  "smile-plus": SmilePlus,
  "building-2": Building2,
  "bed-double": BedDouble,
};

/** Uniform card height across grid; front desk uses 2×2 role grid inside same footprint */
const CARD_MIN_H = "min-h-[19rem] sm:min-h-[20.5rem]";

const AI_CHATBOTS_DISPLAY_NAME = "AI Chatbots and Conversational AI";

export function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const accent = getAccentColor(agent.accent_color);
  const IconComponent = iconMap[agent.icon] || Bot;
  const hasRoles = agent.preset_roles && agent.preset_roles.length > 0;
  const displayName =
    agent.slug === "ai-front-desk" ? AI_CHATBOTS_DISPLAY_NAME : agent.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={`h-full ${CARD_MIN_H}`}
    >
      <Link href={`/agents/${agent.slug}`} className="block h-full group">
        <div
          className={`relative flex h-full ${CARD_MIN_H} flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.05]`}
        >
          {/* Accent gradient strip */}
          <div
            className={`h-1 w-full shrink-0 bg-gradient-to-r ${accent.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          />

          <div className="flex flex-1 flex-col p-6">
            {/* Header: icon + badge */}
            <div className="mb-4 flex shrink-0 items-start justify-between">
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity bg-gradient-to-br ${accent.gradient}`}
                />
                <div
                  className={`relative ${accent.bg} border ${accent.border} rounded-xl p-3`}
                >
                  <IconComponent className={`h-6 w-6 ${accent.text}`} />
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase tracking-wider ${
                  agent.status === "active"
                    ? "border-emerald-500/30 text-emerald-400"
                    : "border-amber-500/30 text-amber-400"
                }`}
              >
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                    agent.status === "active"
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-amber-400 animate-pulse"
                  }`}
                />
                {agent.status}
              </Badge>
            </div>

            {/* Title & description */}
            <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-white">
              {displayName}
            </h3>
            <p className="mb-4 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {agent.description}
            </p>

            {hasRoles ? (
              <div className="mb-4 grid flex-1 grid-cols-2 content-start gap-2">
                {agent.preset_roles!.map((role) => {
                  const RoleIcon = iconMap[role.icon] || Bot;
                  const roleAccent = getAccentColor(role.accent);
                  return (
                    <div
                      key={role.id}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2"
                    >
                      <RoleIcon
                        className={`h-3.5 w-3.5 shrink-0 ${roleAccent.text}`}
                      />
                      <span className="truncate text-[11px] text-muted-foreground">
                        {role.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="min-h-[2.5rem] flex-1" aria-hidden />
            )}

            {/* Category + CTA — bottom aligned */}
            <div className="mt-auto flex shrink-0 items-center justify-between border-t border-white/[0.04] pt-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                {agent.category}
              </span>
              <div
                className={`flex items-center gap-1.5 text-sm font-medium ${accent.text} transition-all duration-300 group-hover:gap-2.5`}
              >
                {hasRoles ? "Try Roles" : "Try Demo"}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Hover glow */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div
              className={`absolute -right-24 -top-24 h-48 w-48 rounded-full bg-gradient-to-br ${accent.gradient} opacity-[0.07] blur-3xl`}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
