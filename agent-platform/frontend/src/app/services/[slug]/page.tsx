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
import { N8nDemoEmbed } from "@/components/marketing/n8n-demo-embed";

const AI_CHATBOTS_SLUG = "ai-chatbots";
const AI_FRONT_DESK_PATH = "/agents/ai-front-desk";
const WORKFLOW_AUTOMATION_SLUG = "workflow-automation";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const service = getServiceDetail(slug);

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

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        <Link
          href="/#services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Core Services
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {description}
          </p>

          {bullets && bullets.length > 0 && (
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-10">
              {bullets.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Ready to get started?
            </p>
            <Link
              href={demoCtaHref}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "inline-flex"
              )}
            >
              {demoCtaLabel}
            </Link>
          </div>
        </motion.article>

        {slug === WORKFLOW_AUTOMATION_SLUG && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-12 w-full"
          >
            <h2 className="text-xl font-semibold mb-3 max-w-3xl">
              Example: WhatsApp chat agent + integrations
            </h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-3xl">
              Incoming WhatsApp → CRM lookup, conversation history, AI intent &amp; reply →
              routing to CRM updates, support tickets (Slack), or calendar + email.
              Pan and zoom to explore; no connection to any live backend.
            </p>
            <N8nDemoEmbed />
          </motion.section>
        )}
      </div>
    </PageTransition>
  );
}
