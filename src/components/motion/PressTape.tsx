// src/components/motion/PressTape.tsx
// P1/T3 快讯滚动带：Courier 大写 + 宽字距的无限横向 tape。
// CSS 动画（tape-scroll 24s linear infinite）挂在 .press-tape-track 上，
// hover 暂停；prefers-reduced-motion 命中时整条返回 null（无 DOM、无动画）。
// window 守卫必须保留：构建期 prerender 在 Node 中执行渲染，此时 window 未定义。
export function PressTape({ items }: { items: string[] }) {
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || items.length === 0) return null;

  const row = items.map((t) => (
    <span key={t} className="font-machine text-xs font-bold uppercase tracking-[0.28em]">
      {t}
    </span>
  ));
  return (
    <div className="press-tape overflow-hidden border-y-2 border-ink py-3" role="marquee">
      <div className="press-tape-track flex w-max gap-12" aria-hidden="true">
        {row}
      </div>
      <div className="flex w-max gap-12 sr-only">
        {items.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
