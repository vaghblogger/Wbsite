import type { Transition, Variants } from "framer-motion";

export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.4,
  ease: "easeOut",
};

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};
