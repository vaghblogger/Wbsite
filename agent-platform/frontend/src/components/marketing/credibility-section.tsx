"use client";

import Image from "next/image";
import {
  STACK,
  AI_ECOSYSTEM,
  N8N_ROW,
  N8N_INTEGRATIONS,
  type Item,
} from "./tech-stack";

/*
 * Dark-theme color map for simple-icons that are invisible on dark backgrounds.
 *
 * Audit of every icon (hex → relative luminance):
 *
 * ── TECHNOLOGIES ──────────────────────────────────────────────
 * Next.js       #000000  lum=0.000  → white
 * React         #61DAFB  lum=0.596  ✓ brand color
 * TypeScript    #3178C6  lum=0.182  ✓ brand color (blue, readable)
 * Bun           #000000  lum=0.000  → white
 * Python        #3776AB  lum=0.167  ✓ brand color (blue, readable)
 * FastAPI       #009688  lum=0.236  ✓ brand color (teal, readable)
 * Tailwind CSS  #06B6D4  lum=0.382  ✓ brand color
 * Supabase      #3FCF8E  lum=0.476  ✓ brand color
 * LangChain     #1C3C3C  lum=0.038  → white
 * LangGraph     img      currentColor → use light SVG variant
 * Vercel        #000000  lum=0.000  → white
 * Anthropic     #191919  lum=0.010  → white
 * Google        #4285F4  lum=0.245  ✓ brand color (blue, readable)
 * Mistral AI    #FA520F  lum=0.264  ✓ brand color
 * Hugging Face  #FFD21E  lum=0.674  ✓ brand color
 * Replicate     #000000  lum=0.000  → white
 *
 * ── INTEGRATIONS ──────────────────────────────────────────────
 * (img logos)   img      brand color in SVG
 * Google Sheets #34A853  lum=0.294  ✓ brand color
 * Gmail         #EA4335  lum=0.218  ✓ brand color (red, readable)
 * Notion        #000000  lum=0.000  → white
 * HubSpot       #FF7A59  lum=0.359  ✓ brand color
 * Stripe        #635BFF  lum=0.174  ✓ brand color (purple, readable)
 * Airtable      #18BFFF  lum=0.447  ✓ brand color
 * Discord       #5865F2  lum=0.178  ✓ brand color (purple, readable)
 * Telegram      #26A5E4  lum=0.329  ✓ brand color
 * PostgreSQL    #4169E1  lum=0.167  ✓ brand color (blue, readable)
 * MySQL         #4479A1  lum=0.175  ✓ brand color (blue, readable)
 * MongoDB       #47A248  lum=0.276  ✓ brand color
 * Shopify       #7AB55C  lum=0.380  ✓ brand color
 * Zoom          #0B5CFF  lum=0.149  ✓ brand color (blue, readable)
 * Jira          #0052CC  lum=0.104  ✓ brand color (blue, readable)
 * Linear        #5E6AD2  lum=0.173  ✓ brand color (purple, readable)
 * GitHub        #181717  lum=0.009  → white
 * Supabase      (dupe)   ✓ deduped
 */
const DARK_THEME_OVERRIDES: Record<string, string> = {
  "Next.js":    "#FFFFFF",
  "Bun":        "#FFFFFF",
  "Vercel":     "#FFFFFF",
  "Replicate":  "#FFFFFF",
  "Notion":     "#FFFFFF",
  "GitHub":     "#FFFFFF",
  "Anthropic":  "#FFFFFF",
  "LangChain":  "#FFFFFF",
  "Signal":     "#FFFFFF",
  "Messenger":  "#0084FF",
  "LINE":       "#00B900",
};

function itemKey(item: Item): string {
  if (item.kind === "si") return item.icon.title;
  if (item.kind === "img") return item.src;
  return item.label;
}

function isLogoItem(item: Item): item is Extract<Item, { kind: "si" } | { kind: "img" }> {
  return item.kind === "si" || item.kind === "img";
}

function dedupeByKey<T>(items: T[], keyFn: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = keyFn(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type LogoItem = Extract<Item, { kind: "si" } | { kind: "img" }>;

function logoItemKey(item: LogoItem): string {
  return item.kind === "si" ? item.icon.title : item.src;
}

export function LogoGrid({
  items,
  className,
}: {
  items: LogoItem[];
  className?: string;
}) {
  return (
    <div
      className={
        typeof className === "string"
          ? className
          : "flex flex-wrap gap-2 sm:gap-3"
      }
    >
      {items.map((item) => (
        <ColorfulLogoBlock key={logoItemKey(item)} item={item} />
      ))}
    </div>
  );
}

const TECHNOLOGIES_ITEMS: LogoItem[] = dedupeByKey(
  ([...STACK, ...AI_ECOSYSTEM].filter(isLogoItem) as LogoItem[]),
  itemKey
);
const INTEGRATIONS_ITEMS: LogoItem[] = dedupeByKey(
  ([...N8N_ROW, ...N8N_INTEGRATIONS].filter(isLogoItem) as LogoItem[]),
  itemKey
);

const glassCardClass =
  "flex h-12 min-w-[100px] max-w-[140px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]";

const marqueeMask = {
  maskImage:
    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
};

function ColorfulLogoBlock({ item }: { item: LogoItem }) {
  if (item.kind === "img") {
    const logoSrc = item.src.endsWith("langgraph.svg")
      ? "/logos/langgraph-light.svg"
      : item.src;
    const inner = (
      <div className="flex min-h-8 items-center justify-center px-2 py-1.5">
        <Image
          src={logoSrc}
          alt={item.alt}
          width={item.width ?? 80}
          height={item.height ?? 20}
          className="h-5 w-auto max-w-[90px] object-contain"
        />
      </div>
    );
    return item.href ? (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={glassCardClass}
      >
        {inner}
      </a>
    ) : (
      <span className={glassCardClass}>{inner}</span>
    );
  }

  const { path, title, hex } = item.icon;
  const fill = DARK_THEME_OVERRIDES[title] ?? `#${hex}`;
  const inner = (
    <div className="flex h-8 w-8 items-center justify-center" title={title}>
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0"
        aria-hidden
        fill={fill}
      >
        <title>{title}</title>
        <path d={path} />
      </svg>
    </div>
  );
  return item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={glassCardClass}
    >
      {inner}
    </a>
  ) : (
    <span className={glassCardClass}>{inner}</span>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: LogoItem[];
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  const trackClass =
    direction === "right"
      ? "logo-marquee-track logo-marquee-track--right flex gap-4"
      : "logo-marquee-track flex gap-4";

  return (
    <div
      className="logo-marquee-wrap relative w-full overflow-hidden py-3"
      style={marqueeMask}
    >
      <div className={trackClass}>
        {doubled.map((item, i) => (
          <ColorfulLogoBlock
            key={`${i}-${item.kind}-${"src" in item ? item.src : item.icon.title}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

export function CredibilitySection() {
  return (
    <section
      className="border-t border-white/5 py-10 sm:py-12"
      aria-labelledby="credibility-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          id="credibility-heading"
          className="mb-10 text-center text-lg font-semibold tracking-tight text-muted-foreground sm:text-xl"
        >
          Powered by Industry Leading AI Tools
        </h2>

        <div className="flex flex-col gap-12">
          <div>
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
              Technologies
            </p>
            <MarqueeRow items={TECHNOLOGIES_ITEMS} direction="left" />
          </div>

          <div>
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
              Integrations
            </p>
            <MarqueeRow items={INTEGRATIONS_ITEMS} direction="right" />
          </div>
        </div>
      </div>
    </section>
  );
}
