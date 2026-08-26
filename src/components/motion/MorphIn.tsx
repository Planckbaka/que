import { motion } from "motion/react";
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
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: DURATIONS.settle, ease: EASE_PRINT, delay }}
    >
      {children}
    </motion.div>
  );
}
