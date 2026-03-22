"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CredibilitySection } from "@/components/marketing/credibility-section";
import { CoreServiceCard } from "@/components/marketing/core-service-card";
import { CORE_SERVICE_CARDS } from "@/data/core-services";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CTA_TEXT, ctaBookHref } from "@/lib/cta";
import { trackEvent } from "@/lib/analytics";
import { useCtaVariant } from "@/hooks/use-cta-variant";

const MarketingWorkflowExplorer = dynamic(
  () => import("@/components/marketing/marketing-workflow-explorer").then((mod) => mod.MarketingWorkflowExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="surface-subtle rounded-2xl p-6 text-sm text-muted-foreground">
        Loading interactive workflow demo...
      </div>
    ),
  }
);

export default function HomePage() {
  const variant = useCtaVariant();
  const primaryLabel = variant === "demo" ? "Book a demo" : CTA_TEXT.primary;

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[128px]" />
          <div className="absolute right-1/4 top-20 h-72 w-72 rounded-full bg-accent/10 blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 text-balance font-display text-4xl font-bold tracking-tight sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="animate-gradient-text bg-gradient-to-r from-foreground via-primary to-accent bg-[length:200%_auto] bg-clip-text text-transparent">
                AI systems that answer, automate, and convert.
              </span>
              <br />
              <span className="text-foreground">Without adding headcount.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mb-10 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              We build AI chatbots, workflow automations, and data systems that reduce
              response time, capture more qualified leads, and keep operations running 24/7.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href={ctaBookHref("hero", { variant })}
                onClick={() => trackEvent("cta_click", { placement: "hero_primary", variant })}
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex")}
              >
                {primaryLabel}
              </Link>
              <Link
                href="/agents/ai-front-desk"
                onClick={() => trackEvent("cta_click", { placement: "hero_secondary" })}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}
              >
                {CTA_TEXT.secondary}
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex justify-center mt-16"
          >
            <a
              href="#services"
              className="flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              <span className="text-xs uppercase tracking-widest">
                Core Services
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="h-4 w-4" />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </section>

      <CredibilitySection />

      {/* Core Services Section */}
      <section id="services" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 font-display text-3xl font-bold md:text-4xl">
            Core Services
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Pick the fastest path to impact: conversational AI, workflow automation,
            analytics, or custom integrations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_SERVICE_CARDS.map((card, index) => (
            <CoreServiceCard
              key={card.href}
              title={card.title}
              description={card.description}
              href={card.href}
              icon={card.icon}
              index={index}
            />
          ))}
        </div>
      </section>

      <section id="workflow-visualization" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-primary">Workflow visualization</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            See the automation before we build it.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Interact with a guided, step-by-step workflow simulation to understand how AI
            handles your processes from intake to action.
          </p>
          <div className="mt-6">
            <MarketingWorkflowExplorer />
          </div>
        </div>
      </section>

      <section id="case-studies-preview" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Healthcare front desk",
              result: "42% faster appointment booking",
            },
            {
              title: "B2B services ops",
              result: "31% lower manual follow-up load",
            },
            {
              title: "Growth team reporting",
              result: "Weekly analytics prepared in minutes",
            },
          ].map((study) => (
            <article key={study.title} className="surface-elevated rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-primary">Case study</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{study.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{study.result}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="book-call" className="mx-auto mb-24 w-full max-w-7xl px-4 sm:px-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-primary">Next step</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{CTA_TEXT.primary}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Get a practical 30 or 60 minute roadmap tailored to your workflows, stack, and goals.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={ctaBookHref("book-section", { variant })}
              onClick={() => trackEvent("cta_click", { placement: "book_section_primary", variant })}
              className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
            >
              {primaryLabel}
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}
            >
              Prefer email
            </Link>
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
