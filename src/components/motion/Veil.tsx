// src/components/motion/Veil.tsx
import { motion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { EASE_PRINT, prefersReducedMotion } from "@/lib/motion";

export const VEIL_HALF_MS = 550;
// 连续阅读（文章 → 文章）缩短仪式：阅读等待减半，保留同样的擦除语言
export const VEIL_READING_HALF_MS = 300;

const READING_PATH = /^\/files\/[\w-]+/;

type VeilState = {
  covering: boolean;
  halfMs: number;
  travel: (to: string) => void;
};

const VeilStateContext = createContext<VeilState | null>(null);

/** 路由擦除转场 API：travel("/path") = 盖下 → 导航 → 揭开；reduced-motion 命中时跳过动画直接导航 */
export function useVeil(): { travel: (to: string) => void } {
  const ctx = useContext(VeilStateContext);
  if (!ctx) throw new Error("useVeil must be used inside VeilProvider");
  return ctx;
}

export function VeilProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const busy = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const pendingFocus = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const [covering, setCovering] = useState(false);
  const [halfMs, setHalfMs] = useState(VEIL_HALF_MS);

  const travel = useCallback(
    (to: string) => {
      if (prefersReducedMotion()) {
        // reduced-motion：无动画即合规——跳过遮幅/揭开，直接导航（仍移交焦点）
        pendingFocus.current = true;
        navigate(to);
        return;
      }
      if (busy.current) return; // 防重入
      busy.current = true;
      // 文章 → 文章用短遮幅；其余（跨世界、进出阅读区）保留完整仪式
      const half =
        READING_PATH.test(to) && READING_PATH.test(location.pathname)
          ? VEIL_READING_HALF_MS
          : VEIL_HALF_MS;
      setHalfMs(half);
      setCovering(true);
      timer.current = window.setTimeout(() => {
        pendingFocus.current = true;
        navigate(to);
        timer.current = window.setTimeout(() => {
          setCovering(false);
          busy.current = false;
        }, half);
      }, half);
    },
    [navigate, location.pathname],
  );

  // Veil 导航后把焦点移到新页 h1：否则焦点随旧链接卸载掉到 body，
  // 读屏用户经历一次无声的黑场、落点失去上下文。
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname 变化本身就是触发器，effect 内无需读取
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const heading = document.querySelector<HTMLElement>("main h1");
    if (!heading || document.activeElement === heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }, [location.pathname]);

  const state = useMemo(() => ({ covering, halfMs, travel }), [covering, halfMs, travel]);

  return <VeilStateContext.Provider value={state}>{children}</VeilStateContext.Provider>;
}

/** 全屏遮幅层：ink 底色两世界可读，scaleX 擦除，禁止淡出 */
export function VeilOverlay() {
  const ctx = useContext(VeilStateContext);
  if (!ctx) throw new Error("VeilOverlay must be used inside VeilProvider");
  return (
    <motion.div
      data-veil
      data-covering={ctx.covering ? "true" : "false"}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] origin-center"
      initial={false}
      animate={{ scaleX: ctx.covering ? 1 : 0 }}
      transition={{ duration: ctx.halfMs / 1000, ease: EASE_PRINT }}
      style={{ background: "#17120c" }}
    />
  );
}

type LinkUnderVeilProps = Omit<ComponentPropsWithoutRef<typeof Link>, "to"> & {
  to: string;
};

/** 遮幅下的链接：拦截默认导航，改走 Veil 转场 */
export function LinkUnderVeil({ to, onClick, ...rest }: LinkUnderVeilProps) {
  const { travel } = useVeil();
  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          (rest.target && rest.target !== "_self") ||
          rest.download != null ||
          rest.reloadDocument ||
          /^[a-z][a-z\d+.-]*:|^\/\//i.test(to)
        )
          return;
        e.preventDefault();
        travel(to);
      }}
      {...rest}
    />
  );
}
