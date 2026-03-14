"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Zap, Shield } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { AgentGrid } from "@/components/agents/agent-grid";
import { TechStack } from "@/components/marketing/tech-stack";
import { useAgents } from "@/hooks/use-agents";

export default function HomePage() {
  const { agents, loading } = useAgents();

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400 text-sm dark:bg-violet-500/5 dark:border-violet-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Powered by LangGraph
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 px-1"
            >
              <span className="animate-gradient-text bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-[length:200%_auto] bg-clip-text text-transparent">
                AI Agents
              </span>
              <br />
              <span className="text-foreground">You Can See Think</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Explore a library of intelligent agents. Chat in real time on
              any device—booking, support, and front-desk flows built in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: Zap, text: "Real-time streaming" },
                { icon: Shield, text: "Production ready" },
                { icon: Sparkles, text: "Mobile friendly" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-violet-400" />
                  {text}
                </div>
              ))}
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
              href="#agents"
              className="flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              <span className="text-xs uppercase tracking-widest">
                Explore agents
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

      {/* Agent Grid Section */}
      <section id="agents" className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Agent Library
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose an agent to explore its capabilities and watch it work.
          </p>
        </motion.div>

        <AgentGrid agents={agents} loading={loading} />
      </section>

      <TechStack />
    </PageTransition>
  );
}
