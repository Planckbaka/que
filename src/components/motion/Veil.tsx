// src/components/motion/Veil.tsx
import { motion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router";
import { EASE_PRINT, prefersReducedMotion } from "@/lib/motion";

export const VEIL_HALF_MS = 550;

type VeilState = {
  covering: boolean;
  travel: (to: string) => void;
};

const VeilStateContext = createContext<VeilState | null>(null);

/** 路由擦除转场 API：travel("/path") = 盖下 550ms → 导航 → 揭开 550ms；reduced-motion 命中时跳过动画直接导航 */
export function useVeil(): { travel: (to: string) => void } {
  const ctx = useContext(VeilStateContext);
  if (!ctx) throw new Error("useVeil must be used inside VeilProvider");
  return ctx;
}

export function VeilProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const busy = useRef(false);
  const [covering, setCovering] = useState(false);

  const travel = useCallback(
    (to: string) => {
      if (prefersReducedMotion()) {
        // reduced-motion：无动画即合规——跳过遮幅/揭开，直接导航
        navigate(to);
        return;
      }
      if (busy.current) return; // 防重入
      busy.current = true;
      setCovering(true);
      window.setTimeout(() => {
        navigate(to);
        window.setTimeout(() => {
          setCovering(false);
          busy.current = false;
        }, VEIL_HALF_MS);
      }, VEIL_HALF_MS);
    },
    [navigate],
  );

  const state = useMemo(() => ({ covering, travel }), [covering, travel]);

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
      transition={{ duration: VEIL_HALF_MS / 1000, ease: EASE_PRINT }}
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
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onClick?.(e);
        travel(to);
      }}
      {...rest}
    />
  );
}
