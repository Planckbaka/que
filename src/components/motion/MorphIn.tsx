import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATIONS, EASE_PRINT } from "@/lib/motion";

type MorphInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  tilt?: number;
  once?: boolean;
};

export function MorphIn({ children, className, delay = 0, tilt = 0, once = true }: MorphInProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`motion-reveal ${className ?? ""}`}
      initial={{ opacity: 0, scale: 0.85, rotate: tilt * 2 }}
      animate={reduced ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: reduced ? 0 : DURATIONS.settle,
        ease: EASE_PRINT,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
