"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { getServiceDetail } from "@/data/core-services";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServiceShowcaseConfig } from "@/data/service-showcases";
import { ServiceShowcaseRenderer } from "@/components/marketing/service-showcase-renderer";

const AI_CHATBOTS_SLUG = "ai-chatbots";
const AI_FRONT_DESK_PATH = "/agents/ai-front-desk";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const service = getServiceDetail(slug);
  const showcaseConfig = getServiceShowcaseConfig(slug);

  useEffect(() => {
    if (slug === AI_CHATBOTS_SLUG) {
      router.replace(AI_FRONT_DESK_PATH);
    }
  }, [slug, router]);

  if (slug === AI_CHATBOTS_SLUG) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-24 flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Redirecting to AI Chatbots and Conversational AI…</p>
        </div>
      </PageTransition>
    );
  }

  if (!service) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-24 text-center">
          <h1 className="text-2xl font-bold mb-2">Service not found</h1>
          <p className="text-muted-foreground mb-6">
            The service you’re looking for doesn’t exist or has been moved.
          </p>
          <Link
            href="/#services"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Back to Core Services
          </Link>
        </div>
      </PageTransition>
    );
  }

  const { title, description, bullets, demoCtaLabel, demoCtaHref } = service;
  const hasInteractiveShowcase = Boolean(showcaseConfig);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <Link
          href="/#services"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Core Services
        </Link>

        <div className={hasInteractiveShowcase ? "grid gap-7 lg:grid-cols-5 lg:items-start" : ""}>
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("max-w-3xl", hasInteractiveShowcase && "lg:col-span-2 lg:sticky lg:top-24")}
          >
            <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">{title}</h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>

            {bullets && bullets.length > 0 && (
              <ul className="mb-10 list-inside list-disc space-y-2 text-muted-foreground">
                {bullets.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="glass-card rounded-xl p-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Ready to get started?
              </p>
              <Link href={demoCtaHref} className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex")}>
                {demoCtaLabel}
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "ml-3 mt-3 inline-flex sm:ml-4 sm:mt-0"
                )}
              >
                Email your use case
              </Link>
            </div>
          </motion.article>

          {showcaseConfig && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card mt-4 w-full rounded-2xl p-5 sm:p-7 lg:col-span-3 lg:mt-0"
              aria-label={showcaseConfig.title}
            >
              <ServiceShowcaseRenderer config={showcaseConfig} />
            </motion.section>
          )}
        </div>

        {showcaseConfig && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card mt-8 max-w-3xl rounded-xl p-6"
          >
            <p className="text-sm font-medium text-muted-foreground mb-4">Ready to apply this to your business?</p>
            <Link href={demoCtaHref} className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex")}>
              {demoCtaLabel}
            </Link>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
