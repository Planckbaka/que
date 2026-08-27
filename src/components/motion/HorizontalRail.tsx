import { motion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { prefersReducedMotion, railShift } from "@/lib/motion";

type RailProps = { children: ReactNode; ariaLabel?: string };

export function HorizontalRail({ children, ariaLabel }: RailProps) {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // 保存测量原值而非换算后的位移：px 换算唯一入口是 lib 的 railShift（此处不内联公式）。
  const [dims, setDims] = useState({ contentW: 0, viewW: 0 });
  const [native, setNative] = useState(false);

  // reduced-motion 只在客户端 effect 里采样：prerender/SSR 渲染 pinned 形态（Node 无 window），
  // reduced 用户水合后由本 effect 切 native——与 SmoothScroll/Veil/WorldWipe 同一口径。
  useEffect(() => {
    setNative(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (native) return;
    const measure = () => {
      setDims({
        contentW: trackRef.current?.scrollWidth ?? 0,
        viewW: window.innerWidth,
      });
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
  const x = useTransform(scrollYProgress, (p) => railShift(p, dims.contentW, dims.viewW));
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
