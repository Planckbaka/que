import { motion } from "motion/react";
import { Children, type Key, type ReactNode } from "react";
import { DURATIONS, EASE_PRINT, stagger } from "@/lib/motion";

type StaggerListProps = {
  children: ReactNode[];
  className?: string;
  step?: number;
};

export function StaggerList({ children, className, step }: StaggerListProps) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={(child as { key?: Key } | null)?.key ?? `item-${i}`}
          initial={{ opacity: 0, scale: 0.85, rotate: i % 2 === 0 ? -2 : 2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: DURATIONS.settle, ease: EASE_PRINT, delay: stagger(i, step) }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
