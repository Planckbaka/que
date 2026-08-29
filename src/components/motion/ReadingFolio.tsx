import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { folioPage } from "@/lib/motion";

// Reading Folio (spec §5 #6): bottom-outer-margin page number driven by global
// scroll progress, plus a 2px ink hairline progress rule. Functional reading
// chrome — scrub-driven by the reader's own scrolling, so it stays live under
// prefers-reduced-motion (no autonomous animation involved).
export function ReadingFolio({ total, label = "Folio" }: { total: number; label?: string }) {
  const { scrollYProgress } = useScroll();
  const [page, setPage] = useState(() => folioPage(0, total));
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setPage(folioPage(value, total));
  });

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={1}
      aria-valuemax={Math.max(1, total)}
      aria-valuenow={page}
      className="fixed bottom-6 left-4 z-40 flex flex-col items-start gap-2 md:left-6"
    >
      <span className="font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/70">
        {label} {String(page).padStart(2, "0")} ∕ {String(total).padStart(2, "0")}
      </span>
      <div aria-hidden="true" className="h-0.5 w-16 overflow-hidden bg-foreground/20">
        <motion.div
          className="h-full w-full origin-left bg-foreground"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </div>
  );
}
