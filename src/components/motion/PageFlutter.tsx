import { motion, useReducedMotion } from "motion/react";

type PageSpec = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
};

const PAGES: PageSpec[] = [
  { left: "4%", top: "-12%", size: 44, duration: 15, delay: 0, rotate: -14 },
  { left: "16%", top: "-18%", size: 30, duration: 19, delay: 3, rotate: 9 },
  { left: "38%", top: "-10%", size: 52, duration: 17, delay: 7, rotate: 21 },
  { left: "57%", top: "-20%", size: 26, duration: 21, delay: 1.5, rotate: -8 },
  { left: "72%", top: "-14%", size: 40, duration: 14, delay: 9, rotate: 13 },
  { left: "88%", top: "-16%", size: 34, duration: 18, delay: 5, rotate: -19 },
];

export function PageFlutter({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {PAGES.map((p) => (
        <motion.span
          key={p.left + p.top}
          className="absolute block border border-ink/25 bg-paper/85"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.32,
            top: reduced ? "30%" : p.top,
            opacity: reduced ? 0.35 : undefined,
          }}
          animate={reduced ? undefined : { y: ["0vh", "125vh"], rotate: [p.rotate, p.rotate + 28] }}
          transition={
            reduced
              ? undefined
              : {
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: "linear",
                }
          }
        >
          <span className="absolute inset-x-[18%] top-[22%] h-px bg-ink/15" />
          <span className="absolute inset-x-[18%] top-[46%] h-px bg-ink/15" />
          <span className="absolute inset-x-[18%] top-[70%] h-px bg-ink/15" />
        </motion.span>
      ))}
    </div>
  );
}
