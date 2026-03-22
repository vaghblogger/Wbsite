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
        className="group block h-full cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative flex h-full min-h-[20rem] flex-col rounded-2xl border border-border/70 bg-card/70 p-8 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/20">
          {/* Top accent bar */}
          <div className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary to-accent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex flex-1 flex-col pt-2">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/25 group-hover:text-primary group-hover:ring-primary/35">
              <IconComponent className="h-7 w-7" strokeWidth={1.75} />
            </div>

            <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mb-6 flex-1 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-primary/85">
              View service
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
