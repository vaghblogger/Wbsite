"use client";

import { motion, useReducedMotion } from "framer-motion";
import { pageTransitionConfig, pageTransitionVariants } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : pageTransitionVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "enter"}
      exit={shouldReduceMotion ? undefined : "exit"}
      transition={pageTransitionConfig}
    >
      {children}
    </motion.div>
  );
}
