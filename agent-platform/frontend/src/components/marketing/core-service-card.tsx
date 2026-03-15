"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Workflow,
  FileText,
  BarChart3,
  Plug,
  Map,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "message-circle": MessageCircle,
  workflow: Workflow,
  "file-text": FileText,
  "bar-chart-3": BarChart3,
  plug: Plug,
  map: Map,
};

type CoreServiceCardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  index?: number;
};

export function CoreServiceCard({
  title,
  description,
  href,
  icon,
  index = 0,
}: CoreServiceCardProps) {
  const IconComponent = iconMap[icon] ?? Plug;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={href}
        className="group block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-2xl"
      >
        <div className="relative flex h-full min-h-[20rem] flex-col rounded-2xl border-2 border-white/[0.08] bg-zinc-900/60 p-8 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900/90 hover:shadow-lg hover:shadow-violet-950/20">
          {/* Top accent bar */}
          <div className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-violet-500 to-purple-500 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex flex-1 flex-col pt-2">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20 transition-all duration-300 group-hover:bg-violet-500/25 group-hover:text-violet-300 group-hover:ring-violet-500/30">
              <IconComponent className="h-7 w-7" strokeWidth={1.75} />
            </div>

            <h3 className="mb-3 text-xl font-semibold tracking-tight text-white">
              {title}
            </h3>
            <p className="mb-6 flex-1 text-base leading-relaxed text-zinc-400">
              {description}
            </p>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
              View service
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
