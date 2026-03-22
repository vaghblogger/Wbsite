"use client";

import { motion } from "framer-motion";
import {
  Eye,
  SmilePlus,
  Building2,
  BedDouble,
  Bot,
  Stethoscope,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import { getAccentColor } from "@/lib/utils";
import type { AgentPresetRole } from "@/types";

const roleIconMap: Record<string, React.ElementType> = {
  eye: Eye,
  "smile-plus": SmilePlus,
  "building-2": Building2,
  "bed-double": BedDouble,
  stethoscope: Stethoscope,
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  bot: Bot,
};

interface RolePickerProps {
  roles: AgentPresetRole[];
  activeRoleId: string;
  onRoleChange: (role: AgentPresetRole) => void;
}

export function RolePicker({ roles, activeRoleId, onRoleChange }: RolePickerProps) {
  return (
    <div className="mb-0">
      <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2 sm:mb-3">
        Try a role
      </p>
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory touch-pan-x">
        {roles.map((role) => {
          const isActive = role.id === activeRoleId;
          const accent = getAccentColor(role.accent);
          const Icon = roleIconMap[role.icon] || Bot;
          const assistantName = role.prompt_config?.assistant_name || role.label;
          const businessName = role.prompt_config?.business_name || "";

          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role)}
              className="relative text-left focus:outline-none group min-w-[min(100%,148px)] sm:min-w-0 w-[148px] sm:w-auto shrink-0 snap-center touch-manipulation"
            >
              {/* Active background indicator */}
              {isActive && (
                <motion.div
                  layoutId="role-active-bg"
                  className={`absolute inset-0 rounded-xl border ${accent.border} shadow-[0_0_20px_rgba(139,92,246,0.15)]`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 24px ${accent.text.includes("violet") ? "rgba(139,92,246,0.2)" : accent.text.includes("cyan") ? "rgba(6,182,212,0.2)" : accent.text.includes("amber") ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`
                      : undefined,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <div
                className={`relative rounded-xl px-3 py-4 sm:px-4 sm:py-5 transition-all duration-200 ${
                  isActive
                    ? `${accent.bg} border border-transparent`
                    : "bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
                }`}
              >
                {/* Large icon with glow */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    {isActive && (
                      <div
                        className={`absolute inset-0 rounded-full blur-xl opacity-40 bg-gradient-to-br ${accent.gradient}`}
                      />
                    )}
                    <Icon
                      className={`relative h-10 w-10 ${
                        isActive ? accent.text : "text-zinc-500"
                      } transition-colors duration-200`}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Business type label */}
                <p
                  className={`text-center text-[11px] uppercase tracking-[0.15em] font-semibold mb-2 ${
                    isActive ? accent.text : "text-zinc-500"
                  } transition-colors`}
                >
                  {role.label}
                </p>

                {/* Separator */}
                <div
                  className={`mx-auto w-8 h-px mb-2 ${
                    isActive ? accent.border.replace("border-", "bg-") : "bg-zinc-700"
                  }`}
                />

                {/* Agent persona name */}
                <p
                  className={`text-center text-sm font-medium ${
                    isActive ? "text-foreground" : "text-zinc-400"
                  } transition-colors`}
                >
                  &ldquo;{assistantName}&rdquo;
                </p>

                {/* Business name */}
                {businessName && (
                  <p className="text-center text-[11px] text-muted-foreground/50 mt-1 truncate">
                    {businessName}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
