// src/components/motion/SmoothScroll.tsx
import Lenis from "lenis";
import { type ReactNode, useEffect } from "react";
import "lenis/dist/lenis.css";
import { DURATIONS } from "@/lib/motion";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // matchMedia 实时监听：设置中途切换 reduce 立即停掉实例，切回再重建
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;
    let rafId = 0;

    const raf = (time: number) => {
      instance?.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    const start = () => {
      instance = new Lenis({ duration: DURATIONS.settle });
      rafId = requestAnimationFrame(raf);
    };
    const stop = () => {
      cancelAnimationFrame(rafId);
      instance?.destroy();
      instance = null;
    };

    if (!media.matches) start(); // reduce 生效时不创建任何实例

    const onPreferenceChange = () => {
      stop();
      if (!media.matches) start();
    };
    media.addEventListener("change", onPreferenceChange);

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("data-native-scroll")) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      let el: Element | null = null;
      try {
        el = document.querySelector(href);
      } catch {
        return; // 非法选择器：放弃劫持，放行浏览器默认行为
      }
      if (!(el instanceof HTMLElement)) return;
      // 无实例（reduce 生效或切换空窗）时不劫持：放行原生跳转——它会移动焦点
      // （skip link 的 WCAG 2.4.1 语义），而 CSS kill-switch 已把
      // scroll-behavior 压成 auto，跳转即时完成。
      if (!instance) return;
      event.preventDefault();
      // 锚点落点与 CSS scroll-margin-top 对齐（index.css 取 5rem）；
      // Lenis 不读 scroll-margin，这里按元素实际值取偏移，不再写死。
      const marginTop = Number.parseFloat(window.getComputedStyle(el).scrollMarginTop || "0");
      instance.scrollTo(el, {
        offset: Number.isNaN(marginTop) ? 0 : -marginTop,
      });
      // 原生锚点跳转的另一半语义：焦点交给目标，skip link 才算真正穿越了导航。
      if (el.tabIndex === -1 && !el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    return () => {
      media.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("click", onClick);
      stop();
    };
  }, []);

  return <>{children}</>;
}
