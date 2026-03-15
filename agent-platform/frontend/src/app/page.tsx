"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CredibilitySection } from "@/components/marketing/credibility-section";
import { CoreServiceCard } from "@/components/marketing/core-service-card";
import { CORE_SERVICE_CARDS } from "@/data/core-services";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-violet-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8"
            >
              <span className="animate-gradient-text bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-[length:200%_auto] bg-clip-text text-transparent">
                Let AI Handle the Busywork.
              </span>
              <br />
              <span className="text-foreground">You Run the Strategy.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              We help ambitious companies like yours leverage AI to work
              smarter, not harder—delivering tailored solutions that
              automate repetitive tasks, surface actionable insights, and
              drive revenue growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="#book-call"
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex")}
              >
                Book Free AI Strategy Call
              </Link>
              <Link
                href="/agents/ai-front-desk"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}
              >
                See AI Agents in Action
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
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Core Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            What we offer—from conversational AI and automation to strategy and
            custom builds.
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

    </PageTransition>
  );
}
