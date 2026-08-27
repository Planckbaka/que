// src/components/motion/SmoothScroll.tsx
import Lenis from "lenis";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import "lenis/dist/lenis.css";

const SmoothScrollContext = createContext<Lenis | null>(null);

/** 读取 Lenis 实例；未挂载或 reduced-motion 降级时返回 null */
export function useSmoothScroll(): Lenis | null {
  return useContext(SmoothScrollContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // 原生滚动，完全不创建实例
    }
    const instance = new Lenis({ duration: 0.8 });
    setLenis(instance);

    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!(el instanceof HTMLElement)) return;
      event.preventDefault();
      instance.scrollTo(el, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <SmoothScrollContext.Provider value={lenis}>{children}</SmoothScrollContext.Provider>;
}
