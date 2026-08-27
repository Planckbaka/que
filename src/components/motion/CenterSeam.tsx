import { type ReactNode, useRef, useState } from "react";
import { clampPct } from "@/lib/motion";

type SeamProps = { left: ReactNode; right: ReactNode };

export function CenterSeam({ left, right }: SeamProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const move = (clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (r && r.width > 0) setPct(clampPct(((clientX - r.left) / r.width) * 100));
  };
  return (
    <div ref={boxRef} className="relative flex h-[70svh] border-y-2 border-ink">
      <div style={{ width: `${pct}%` }} className="bg-blood text-paper">
        {left}
      </div>
      <div className="flex-1 bg-ink text-paper">{right}</div>
      {/* biome-ignore lint/a11y/useSemanticElements: 可聚焦中缝手柄需 tabIndex 与指针键盘事件，hr 元素无法承载 */}
      <div
        role="separator"
        aria-valuenow={Math.round(pct)}
        tabIndex={0}
        aria-label="Drag to resize the two worlds"
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={(e) => {
          if (e.buttons > 0) move(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPct((p) => clampPct(p - 5));
          if (e.key === "ArrowRight") setPct((p) => clampPct(p + 5));
        }}
        className="absolute inset-y-0 w-1.5 -translate-x-1/2 cursor-ew-resize bg-paper"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
