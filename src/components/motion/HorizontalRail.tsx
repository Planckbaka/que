import { motion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

type RailProps = { children: ReactNode; ariaLabel?: string };

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function HorizontalRail({ children, ariaLabel }: RailProps) {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [native, setNative] = useState(false);

  const reduced = prefersReducedMotion();
  useEffect(() => {
    setNative(reduced);
  }, [reduced]);

  useEffect(() => {
    if (native) return;
    const measure = () => {
      const c = trackRef.current?.scrollWidth ?? 0;
      setShift(Math.max(0, c - window.innerWidth));
    };
    const onResize = () => measure();
    measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [native]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, (p) => -Math.max(0, shift) * p);
  return (
    <section ref={outerRef} data-variant={native ? "native" : "pinned"} aria-label={ariaLabel}>
      <div
        className={
          native
            ? "flex gap-10 overflow-x-auto"
            : "sticky top-0 flex h-svh items-center overflow-hidden"
        }
      >
        <motion.div
          ref={trackRef}
          style={{ x: native ? undefined : x }}
          className="flex w-max items-center gap-10 px-[8vw]"
          data-testid="rail-track"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
