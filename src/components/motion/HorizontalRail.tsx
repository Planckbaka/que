import { motion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { railShift } from "@/lib/motion";

type RailProps = { children: ReactNode; ariaLabel?: string };

export function HorizontalRail({ children, ariaLabel }: RailProps) {
  const outerRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // 保存测量原值而非换算后的位移：px 换算唯一入口是 lib 的 railShift（此处不内联公式）。
  const [dims, setDims] = useState({ contentW: 0, viewW: 0, viewH: 0 });
  const [native, setNative] = useState(false);

  // reduced-motion 只在客户端 effect 里采样：prerender/SSR 渲染 pinned 形态（Node 无 window），
  // reduced 用户水合后由本 effect 切 native——与 SmoothScroll/Veil/WorldWipe 同一口径。
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setNative(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (native) return;
    const measure = () => {
      setDims({
        contentW: trackRef.current?.scrollWidth ?? 0,
        viewW: viewportRef.current?.clientWidth ?? 0,
        viewH: viewportRef.current?.offsetHeight ?? 0,
      });
    };
    measure();
    // Container width can change without a window resize; font/content changes
    // can also change the track's overflow after the first measurement.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (viewportRef.current) observer?.observe(viewportRef.current);
    if (trackRef.current) observer?.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [native]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, (p) => railShift(p, dims.contentW, dims.viewW));
  const overflow = Math.max(0, dims.contentW - dims.viewW);
  return (
    <section
      ref={outerRef}
      data-variant={native ? "native" : "pinned"}
      aria-label={ariaLabel}
      // The sticky viewport needs one vertical pixel per horizontal pixel of
      // travel. Equal outer/inner heights leave no scroll interval to scrub.
      style={native ? undefined : { height: dims.viewH + overflow || undefined }}
    >
      <div
        ref={viewportRef}
        tabIndex={native ? 0 : undefined}
        className={
          native
            ? "flex gap-10 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-4"
            : "sticky top-0 flex h-svh items-center overflow-hidden"
        }
      >
        <motion.div
          ref={trackRef}
          style={{ x: native ? 0 : x }}
          className="flex w-max shrink-0 items-center gap-10 px-[8vw]"
          data-testid="rail-track"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
