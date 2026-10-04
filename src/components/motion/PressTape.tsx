// src/components/motion/PressTape.tsx
// P1/T3 快讯滚动带：Courier 大写 + 宽字距的无限横向 tape。
// CSS 动画（tape-scroll 24s linear infinite）挂在 .press-tape-track 上，hover 暂停；
// 轨道内含两份字面量半区（各 flex w-max shrink-0，track 自身无 gap）：
// -50% 位移恰为一个半区宽 → 无缝回卷（R1 修复：旧版单份轨道每 24s 周期边界跳切）。
// 无障碍文案由容器 aria-label 承载一份（轨道整体 aria-hidden；sr-only 重复行曾与
// w-max 冲突把文档撑出横向溢出，优化轮移除）。
// Keep the same markup during SSR and hydration. The reduced-motion media
// query hides the tape before paint and follows changes to the preference.
export function PressTape({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  const row = items.map((t) => (
    <span key={t} className="font-machine text-xs font-bold uppercase tracking-[0.28em]">
      {t}
    </span>
  ));
  return (
    <div
      className="press-tape overflow-hidden border-y-2 border-ink py-3"
      role="marquee"
      aria-label={items.join(" · ")}
    >
      <div className="press-tape-track flex w-max" aria-hidden="true">
        <div className="flex w-max shrink-0 gap-12">{row}</div>
        <div className="flex w-max shrink-0 gap-12">{row}</div>
      </div>
    </div>
  );
}
