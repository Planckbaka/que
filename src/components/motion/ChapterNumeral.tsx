import { motion, useScroll, useTransform } from "motion/react";
import { prefersReducedMotion } from "@/lib/motion";

// Scrub Chapter Numerals (spec §5 #5): a monumental outlined numeral behind
// the content, drifting gently against scroll. Positioning comes from the
// caller via className; the monument budget (≤2 per view) is the caller's duty.
// Reduced motion freezes the parallax — the numeral simply sits still.
export function ChapterNumeral({ numeral, className }: { numeral: string; className?: string }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const frozen = prefersReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      style={frozen ? undefined : { y }}
      className={`text-outline pointer-events-none absolute select-none font-display leading-none opacity-30 ${
        className ?? ""
      }`}
    >
      {numeral}
    </motion.span>
  );
}
