"use client";

import Image from "next/image";
import {
  siNextdotjs,
  siReact,
  siTypescript,
  siBun,
  siPython,
  siTailwindcss,
  siSupabase,
  siLangchain,
  siAnthropic,
  siGoogle,
  siHuggingface,
  siReplicate,
  siGooglesheets,
  siGmail,
  siNotion,
  siHubspot,
  siStripe,
  siAirtable,
  siDiscord,
  siTelegram,
  siPostgresql,
  siMysql,
  siMongodb,
  siShopify,
  siZoom,
  siJira,
  siLinear,
  siGithub,
  siMistralai,
  siVercel,
  siFastapi,
} from "simple-icons";

type SiIcon = { path: string; title: string; hex: string };

type Item =
  | { kind: "si"; icon: SiIcon; href?: string }
  | { kind: "text"; label: string; href?: string }
  | { kind: "img"; src: string; alt: string; href?: string; width?: number; height?: number };

const STACK: Item[] = [
  { kind: "si", icon: siNextdotjs, href: "https://nextjs.org" },
  { kind: "si", icon: siReact, href: "https://react.dev" },
  { kind: "si", icon: siTypescript, href: "https://www.typescriptlang.org" },
  { kind: "si", icon: siBun, href: "https://bun.sh" },
  { kind: "si", icon: siPython, href: "https://python.org" },
  { kind: "si", icon: siFastapi, href: "https://fastapi.tiangolo.com" },
  { kind: "si", icon: siTailwindcss, href: "https://tailwindcss.com" },
  { kind: "si", icon: siSupabase, href: "https://supabase.com" },
  { kind: "text", label: "OpenAI", href: "https://openai.com" },
  { kind: "si", icon: siLangchain, href: "https://langchain.com" },
  {
    kind: "img",
    src: "/logos/langgraph.svg",
    alt: "LangGraph",
    href: "https://langchain.com/langgraph",
    width: 100,
    height: 24,
  },
  { kind: "si", icon: siVercel, href: "https://vercel.com" },
];

const AI_ECOSYSTEM: Item[] = [
  { kind: "si", icon: siAnthropic, href: "https://anthropic.com" },
  { kind: "si", icon: siGoogle, href: "https://ai.google" },
  { kind: "si", icon: siMistralai, href: "https://mistral.ai" },
  { kind: "text", label: "Cohere", href: "https://cohere.com" },
  { kind: "si", icon: siHuggingface, href: "https://huggingface.co" },
  { kind: "text", label: "Pinecone", href: "https://pinecone.io" },
  { kind: "text", label: "Weaviate", href: "https://weaviate.io" },
  { kind: "si", icon: siReplicate, href: "https://replicate.com" },
  { kind: "text", label: "LlamaIndex", href: "https://llamaindex.ai" },
  { kind: "text", label: "OpenAI", href: "https://platform.openai.com" },
];

const N8N_ROW: Item[] = [
  {
    kind: "img",
    src: "/logos/n8n.svg",
    alt: "n8n",
    href: "https://n8n.io",
    width: 88,
    height: 24,
  },
  {
    kind: "text",
    label: "Workflow automation",
    href: "https://n8n.io",
  },
];

const N8N_INTEGRATIONS: Item[] = [
  {
    kind: "img",
    src: "/logos/n8n.svg",
    alt: "n8n",
    href: "https://n8n.io/integrations/",
    width: 88,
    height: 24,
  },
  { kind: "text", label: "Slack", href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siGooglesheets, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siGmail, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siNotion, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siHubspot, href: "https://n8n.io/integrations/" },
  { kind: "text", label: "Salesforce", href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siStripe, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siAirtable, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siDiscord, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siTelegram, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siPostgresql, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siMysql, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siMongodb, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siShopify, href: "https://n8n.io/integrations/" },
  { kind: "text", label: "Twilio", href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siZoom, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siJira, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siLinear, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siGithub, href: "https://n8n.io/integrations/" },
  { kind: "si", icon: siSupabase, href: "https://n8n.io/integrations/" },
];

/** Light tile + white logo well so brand SVGs read in dark and light theme. */
const tileClass =
  "flex h-14 min-w-[112px] max-w-[200px] shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800/90 dark:shadow-zinc-950/30";

function LogoBlock({ item }: { item: Item }) {
  if (item.kind === "text") {
    const inner = (
      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-zinc-800 dark:text-zinc-100">
        {item.label}
      </span>
    );
    return item.href ? (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        {inner}
      </a>
    ) : (
      <span className={tileClass}>{inner}</span>
    );
  }

  if (item.kind === "img") {
    const inner = (
      <div className="flex min-h-9 items-center justify-center rounded-md bg-white px-2 py-1 dark:bg-white">
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width ?? 96}
          height={item.height ?? 24}
          className="h-6 w-auto max-w-[120px] object-contain object-left"
        />
      </div>
    );
    return item.href ? (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        {inner}
      </a>
    ) : (
      <span className={tileClass}>{inner}</span>
    );
  }

  const { path, title, hex } = item.icon;
  const inner = (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-white"
      title={title}
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="h-7 w-7"
        aria-hidden
        fill={`#${hex}`}
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
      className={tileClass}
    >
      {inner}
    </a>
  ) : (
    <span className={tileClass}>{inner}</span>
  );
}

function LogoMarquee({
  items,
  direction,
  durationClass,
}: {
  items: Item[];
  direction: "left" | "right";
  durationClass?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className="logo-marquee-wrap relative w-full overflow-hidden py-3"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className={`logo-marquee-track flex gap-6 ${
          direction === "right" ? "logo-marquee-track--right" : ""
        } ${durationClass ?? ""}`}
      >
        {doubled.map((item, i) => (
          <LogoBlock key={`${i}-${item.kind}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  const row1 = [...STACK, ...AI_ECOSYSTEM];
  const row2 = [...N8N_INTEGRATIONS, ...N8N_ROW];

  return (
    <section
      className="border-t border-zinc-800 bg-zinc-950/80 py-14 sm:py-16"
      aria-labelledby="tech-stack-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          id="tech-stack-heading"
          className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Technologies &amp; integrations
        </h2>
        <p className="mx-auto mb-2 max-w-2xl text-center text-sm text-muted-foreground">
          Built with a modern stack — AI APIs, automation, and apps you already use.
        </p>

        <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Stack &amp; AI ecosystem
        </p>
        <LogoMarquee items={row1} direction="left" />

        <p className="mb-4 mt-10 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          n8n &amp; popular integrations
        </p>
        <LogoMarquee items={row2} direction="right" />

        <p className="mt-8 text-center">
          <a
            href="https://n8n.io/integrations/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/15"
          >
            500+ n8n integrations — browse full directory
          </a>
        </p>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/80 leading-relaxed px-2">
          All logos and names are trademarks of their respective owners. No
          endorsement implied. n8n is a trademark of n8n GmbH.
        </p>
      </div>
    </section>
  );
}
