import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ACCENT_COLORS: Record<string, { gradient: string; ring: string; bg: string; text: string; border: string }> = {
  violet: {
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-500/50",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
  },
  cyan: {
    gradient: "from-cyan-500 to-blue-600",
    ring: "ring-cyan-500/50",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    ring: "ring-amber-500/50",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  emerald: {
    gradient: "from-emerald-500 to-green-600",
    ring: "ring-emerald-500/50",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
};

export function getAccentColor(color: string) {
  return ACCENT_COLORS[color] || ACCENT_COLORS.violet;
}
