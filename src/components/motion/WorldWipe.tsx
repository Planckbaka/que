import { motion } from "motion/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_PRINT, prefersReducedMotion } from "@/lib/motion";

export type World = "red" | "black";

const HALF_WIPE_MS = 550;

type WorldContextValue = {
  world: World;
  toggle: () => void;
};

const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorld(): WorldContextValue {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be used inside WorldProvider");
  return ctx;
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<World>("red");
  const [wiping, setWiping] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.world = world;
  }, [world]);

  const toggle = useCallback(() => {
    if (prefersReducedMotion()) {
      // reduced-motion：无动画即合规——跳过擦除动画与两段 setTimeout，世界状态直接翻转
      setWorld((w) => (w === "red" ? "black" : "red"));
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setWiping(true);
    window.setTimeout(() => {
      setWorld((w) => (w === "red" ? "black" : "red"));
    }, HALF_WIPE_MS);
    window.setTimeout(() => {
      setWiping(false);
      busy.current = false;
    }, HALF_WIPE_MS * 2);
  }, []);

  const value = useMemo(() => ({ world, toggle }), [world, toggle]);

  return (
    <WorldContext.Provider value={value}>
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 origin-center"
        initial={false}
        animate={{ scaleX: wiping ? 1 : 0 }}
        transition={{ duration: HALF_WIPE_MS / 1000, ease: EASE_PRINT }}
        style={{ background: world === "red" ? "#14100b" : "#c8281e" }}
      />
    </WorldContext.Provider>
  );
}
