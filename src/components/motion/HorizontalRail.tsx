import { motion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { railShift } from "@/lib/motion";
import { useLivePrefersReducedMotion } from "@/lib/motion-hooks";

type RailProps = { children: ReactNode; ariaLabel?: string };

export function HorizontalRail({ children, ariaLabel }: RailProps) {
  const outerRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // 保存测量原值而非换算后的位移：px 换算唯一入口是 lib 的 railShift（此处不内联公式）。
  const [dims, setDims] = useState({ contentW: 0, viewW: 0, viewH: 0 });
  // reduced-motion 只在客户端采样：prerender/SSR 渲染 pinned 形态（Node 无 window），
  // reduced 用户水合后切 native——与 SmoothScroll/Veil/WorldWipe 同一口径。
  const native = useLivePrefersReducedMotion();

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
  // 条件 JSX 而非条件 role：native 视口是键盘可聚焦的滚动区，自带命名 region
  // （WCAG 2.4.3 焦点顺序 / 4.1.2 名称与角色）；pinned 视口由页面滚动驱动，
  // 不是独立滚动容器，不抢占 landmark。外层 section 保持无名，避免同名嵌套 region。
  const track = (
    <motion.div
      ref={trackRef}
      style={{ x: native ? 0 : x }}
      className="flex w-max shrink-0 items-center gap-10 px-[8vw]"
      data-testid="rail-track"
    >
      {children}
    </motion.div>
  );
  return (
    <section
      ref={outerRef}
      data-variant={native ? "native" : "pinned"}
      // The sticky viewport needs one vertical pixel per horizontal pixel of
      // travel. Equal outer/inner heights leave no scroll interval to scrub.
      style={native ? undefined : { height: dims.viewH + overflow || undefined }}
    >
      {native ? (
        /* 语义 section = 隐式命名 region；tabindex 让键盘用户抵达滚动区（与
           article 内 pre 滚动区同一先例；noNoninteractiveTabindex 的豁免在
           biome.json overrides —— JSX 注释在这里无法附着到三元分支的元素）。 */
        <section
          ref={viewportRef}
          tabIndex={0}
          aria-label={ariaLabel}
          className="flex gap-10 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {track}
        </section>
      ) : (
        <div
          ref={viewportRef as React.RefObject<HTMLDivElement>}
          className="sticky top-0 flex h-svh items-center overflow-hidden"
        >
          {track}
        </div>
      )}
    </section>
  );
}
