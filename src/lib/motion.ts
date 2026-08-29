import type { Transition } from "motion/react";

export const DURATIONS = {
  snap: 0.14,
  beat: 0.24,
  drift: 0.48,
  settle: 0.8,
  cinematic: 1.1,
} as const;

export const EASE_PRINT: [number, number, number, number] = [0.2, 0, 0, 1];
export const EASE_PLUMMET: [number, number, number, number] = [0.55, 0, 1, 0.45];

export const SPRING: Transition = { type: "spring", stiffness: 260, damping: 26 };

export const STAGGER_STEP = 0.06;

export function stagger(index: number, step: number = STAGGER_STEP): number {
  return index * step;
}

/**
 * 系统级 reduced-motion 统一读取入口，供 SmoothScroll / Veil / WorldWipe 三处复用。
 * 必须在「调用时」读取（而非模块加载时缓存），否则测试里的 matchMedia 存根不生效。
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 横向长廊（P1/T2 HorizontalRail）位移纯函数：把 [0,1] 进度映射为 ≤0 的
 * translateX 像素值。进度钳制到 [0,1]；内容不足一屏（无水平溢出）时恒为 0。
 * 返回值把 -0 归一为 +0——Vitest 的 toBe 走 Object.is，两个零严格不相等。
 */
export function railShift(progress: number, contentW: number, viewW: number): number {
  const overflow = Math.max(0, contentW - viewW);
  const clamped = Math.min(1, Math.max(0, progress));
  const shift = -overflow * clamped;
  return shift === 0 ? 0 : shift;
}

/**
 * 中缝（P1/T4 CenterSeam）位置纯函数：把任意百分比钳制到中缝可用区间 [5, 95]，
 * 保证左右两个世界各留一条可见纸边。
 */
export function clampPct(v: number): number {
  return Math.min(95, Math.max(5, v));
}

/**
 * 阅读 folio（P3/T2 ReadingFolio）页码纯函数：把全局滚动进度 [0,1] 映射到
 * 印刷页码 [1, total]（书的页数口径 = 阅读时长分钟数）。total 非正时退回第 1 页。
 */
export function folioPage(progress: number, total: number): number {
  if (total < 1) return 1;
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.min(total, Math.max(1, Math.floor(clamped * total) + 1));
}

/**
 * 章节罗马数字（P3/T2 ChapterNumeral）纯函数：标准减写规则；
 * 非正输入回退 "I"（内容永远有一章）。
 */
export function romanNumeral(n: number): string {
  if (n < 1) return "I";
  const table: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = Math.floor(n);
  let out = "";
  for (const [value, glyph] of table) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}
