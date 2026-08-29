# Magpie P1 动效库 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 spec §5 的四个艺术级动效原语（HorizontalRail / PressTape / CenterSeam Drag / HalftoneReveal），并一次性清偿 P0 审计与评审遗留的全部挂账。

**Architecture:** 四个原语全部构建于既有 Motion+Lenis+token 体系之上，作为纯展示组件进入 `src/components/motion/`，先以测试与 showcase 演示位落地、不新增路由；挂账清偿批次作为独立首个任务在前，保证后续原语从已加固的地面起跳。

**Tech Stack:** motion/react · lenis · Vitest + Testing Library (jsdom) · Tailwind v4 utilities

## Global Constraints

- 三色法则与运动预算同项目基线：禁渐变/模糊/圆角；入场 ≤800ms、交互 ≤240ms。
- 转场永远擦除禁止淡出。**Reduced-motion 裁决（本计划权威口径）**：`Veil.travel` 与 `WorldWipe.toggle` 在 prefers-reduced-motion 命中时跳过动画直接完成状态切换（无擦除也无淡出=两法则交集合规）；新原语各自声明退化形态。
- 节奏常量沿用 `src/lib/motion.ts`；新增常量一律入该文件（快讯周期等）。
- 运行时依赖零新增。
- Biome：2 空格、行宽 ≤100、`import type`；TS strict 全家桶 + erasableSyntaxOnly。
- 测试禁 test.skip/.only 与占位实现；matchMedia stub 后必须恢复。

---

## Task 总览

| # | 任务 | 性质 |
|---|------|------|
| T1 | 挂账清偿批次 | 六小项加固 + 两处语义决策落地 |
| T2 | HorizontalRail（横向滑行长廊） | sticky 钉住 + useScroll 进度映射 |
| T3 | PressTape 快讯滚动带 | 纯 CSS 无限循环 |
| T4 | CenterSeam Drag 中缝拖拽 | 指针驱动世界分界线 |
| T5 | HalftoneReveal 半调对焦 | CSS 变量网点插值 |
| T6 | 整备验收门 | 门禁五连 + 演示位接线 |

---

### Task 1: 挂账清偿批次

**Files:**
- Modify: `package.json` / `app/entry.server.tsx` / `tsconfig.node.json`
- Modify: `src/components/motion/SmoothScroll.tsx` / `src/components/motion/AnagramText.tsx`
- Modify: `src/__tests__/smoothscroll.test.tsx` / `src/__tests__/veil.test.tsx`

**Interfaces:**
- Produces: 无新增导出；全部为行为加固。验收=门禁五连全绿 + 新增断言生效。

**清单（每项独立小步提交可合并为一个提交，由实现者按步验证）：**

- [ ] **Step 1 (a1)** `package.json`: `"react-router": "^7.18.2"`（与 dev 对齐），`npm install` 刷新 lock。
- [ ] **Step 2 (a2)** entry.server 恢复超时守卫：
```tsx
const signal = AbortSignal.timeout(10_000);
// 传入 renderToReadableStream(children, { signal, onError, onAllReady })
// 并恢复 post-shell onError 的 console.error；超时触发 abort 时构建显式失败
```
- [ ] **Step 3 (a3)** tsconfig.node.json include 追加 `"app/**/*.ts"`（.tsx 已覆盖 root/entry.server）。
- [ ] **Step 4 (a4)** SmoothScroll 锚点拦截器：
```tsx
let el: Element | null = null;
try {
  el = document.querySelector(href);
} catch {
  return;
}
if (!el) return;
```
- [ ] **Step 5 (a5)** AnagramText 解析公式防负切片：`const resolved = Math.max(0, Math.floor((Date.now() - start) / beat));`（修复基线遗留的"半解→回乱"视觉怪象）。
- [ ] **Step 6 (a6)** 测试加固三件套：
  - smoothscroll 锚点用例追加 `expect(scrollTo).toHaveBeenCalledTimes(1)` 之外补 `preventDefault 被调用` 断言（spy 于事件对象或断言 anchor 默认行为未触发）；
  - 新增 unmount 清理用例（unmount() 后重渲染计数不变、无 rAF 泄漏声明）；
  - veil busy 守卫用例改为 navigate-spy 判别（第二次 travel 不产生第二次 navigate 调用）。
- [ ] **Step 7 (a7)** 两处 reduced-motion 语义决策落地：
```tsx
// Veil.travel 开头
if (prefersReducedMotion()) {
  navigate(to);
  return;
}
// WorldWipe.toggle 同口径：命中即直接 setWorld(翻转)，跳过 wipe 动画与两段 setTimeout
```

### Task 2: HorizontalRail 横向滑行长廊

**Files:**
- Modify: `src/lib/motion.ts`（新增纯函数 railShift）
- Create: `src/components/motion/HorizontalRail.tsx`
- Test: `src/__tests__/horizontal-rail.test.tsx`

**Interfaces:**
- Produces: `railShift(progress: number, contentW: number, viewW: number): number` —— 返回 translateX 像素值（≤0），进度被钳制到 [0,1]；
  `HorizontalRail({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string })` —— 钉住式横向滚动原语，挂载时采样 prefers-reduced-motion：命中则退化为原生 overflow-x 轮播（外层元素带 `data-variant="native"`），否则 sticky 钉住 + 进度驱动位移（`data-variant="pinned"`）。

- [ ] **Step 1: 写失败测试**
```tsx
import { describe, expect, it } from "vitest";
import { railShift } from "@/lib/motion";

describe("railShift", () => {
  it("maps progress to negative pixel shift", () => {
    expect(railShift(0.5, 1600, 800)).toBe(-400);
  });
  it("clamps out-of-range progress", () => {
    expect(railShift(-1, 1600, 800)).toBe(0);
    expect(railShift(2, 1600, 800)).toBe(-800);
  });
  it("handles non-scrollable content", () => {
    expect(railShift(0.7, 600, 800)).toBe(0);
  });
});
```

- [ ] **Step 2: 确认测试失败（红灯）**

Run: `npx vitest run src/__tests__/horizontal-rail.test.tsx`
Expected FAIL：`railShift` 导出不存在。

- [ ] **Step 3: HorizontalRail.tsx 完整实现**
```tsx
import { motion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { railShift } from "@/lib/motion";

type RailProps = { children: ReactNode; ariaLabel?: string };

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HorizontalRail({ children, ariaLabel }: RailProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [native, setNative] = useState(false);

  const reduced = prefersReducedMotion();
  useEffect(() => { setNative(reduced); }, [reduced]);

  useEffect(() => {
    if (native) return;
    const measure = () => {
      const c = trackRef.current?.scrollWidth ?? 0;
      setShift(Math.max(0, c - window.innerWidth));
    };
    const onResize = () => measure();
    measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [native]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, (p) => -Math.max(0, shift) * p);
  return (
    <div ref={outerRef} data-variant={native ? "native" : "pinned"} aria-label={ariaLabel}>
      <div className={native
        ? "flex gap-10 overflow-x-auto"
        : "sticky top-0 flex h-svh items-center overflow-hidden"}>
        <motion.div
          ref={trackRef}
          style={{ x: native ? undefined : x }}
          className="flex w-max items-center gap-10 px-[8vw]"
          data-testid="rail-track">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 验证**
  - `npx vitest run src/__tests__/horizontal-rail.test.tsx` 全绿；
  - 追加结构用例：stub matchMedia matches:true 渲染 → 断言外层 `data-variant="native"` 且轨道无 sticky 类；默认渲染 → `data-variant="pinned"`。
  - 门禁四连：build / typecheck / test / lint。单提交 `feat(motion): horizontal rail primitive (P1/T2)`。

### Task 3: PressTape 快讯滚动带

**Files:**
- Modify: `src/index.css`（追加 keyframes 与类）
- Create: `src/components/motion/PressTape.tsx`
- Test: `src/__tests__/presstape.test.tsx`

**Interfaces:**
- Produces: `PressTape({ items }: { items: string[] })` —— Courier 大写、字距加宽的无限横向快讯带；prefers-reduced-motion 命中时整条返回 null。
```css
/* index.css 追加 */
@keyframes tape-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.press-tape-track {
  animation: tape-scroll 24s linear infinite;
}
.press-tape:hover .press-tape-track { animation-play-state: paused; }
```
- [ ] **Step 2: 组件与测试**
```tsx
export function PressTape({ items }: { items: string[] }) {
  const reduced = typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || items.length === 0) return null;
  const row = items.map((t, i) => (
    <span key={i} className="font-machine text-xs font-bold uppercase tracking-[0.28em]">
      {t}
    </span>
  ));
  return (
    <div className="press-tape overflow-hidden border-y-2 border-ink py-3" role="marquee">
      <div className="press-tape-track flex w-max" aria-hidden="true">
        <div className="flex w-max shrink-0 gap-12">{row}</div>
        <div className="flex w-max shrink-0 gap-12">{row}</div>
      </div>
      <div className="flex w-max gap-12 sr-only">{items.map((t) => <span key={t}>{t}</span>)}</div>
    </div>
  );
}
```
测试：①渲染每条文本各两次（轨道+sr-only）；②matchMedia stub true → container empty；③无 .only/.skip。

### Task 4: CenterSeam Drag 中缝拖拽

**Files:**
- Modify: `src/lib/motion.ts`（新增纯函数 clampPct）
- Create: `src/components/motion/CenterSeam.tsx`
- Test: `src/__tests__/centerseam.test.tsx`

**Interfaces:**
- Produces: `clampPct(value: number): number` —— 钳制到 [5, 95]；`CenterSeam({ left, right }: { left: ReactNode; right: ReactNode })`
  —— 红黑双世界对分构图，中缝可拖拽（指针零延迟跟随，松手驻留），带键盘支持（handle 上 ←/→ 移动 5%）与 role="separator" aria-valuenow。
```tsx
export function clampPct(v: number): number {
  return Math.min(95, Math.max(5, v));
}
```
- [ ] **Step 1: 失败测试**
```tsx
import { describe, expect, it } from "vitest";
import { clampPct } from "@/lib/motion";

describe("clampPct", () => {
  it("clamps to seam bounds", () => {
    expect(clampPct(-20)).toBe(5);
    expect(clampPct(50)).toBe(50);
    expect(clampPct(150)).toBe(95);
  });
});
```

- [ ] **Step 2: CenterSeam.tsx 实现**
```tsx
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
      <div style={{ width: `${pct}%` }} className="bg-blood text-paper">{left}</div>
      <div className="flex-1 bg-ink text-paper">{right}</div>
      <div
        role="separator"
        aria-valuenow={Math.round(pct)}
        tabIndex={0}
        aria-label="Drag to resize the two worlds"
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={(e) => e.buttons > 0 && move(e.clientX)}
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
```
测试要点：pointer 拖拽用 firePointerEvent 移动到 30% 断言 left 面板 width=30%；键盘 ArrowRight 从 50→55；aria-valuenow 同步。
门禁四连后提交：`feat(motion): center seam drag primitive (P1/T4)`。

### Task 5: HalftoneReveal 半调对焦

**Files:**
- Create: `src/components/magpie/HalftoneReveal.tsx`
- Test: `src/__tests__/halftonereveal.test.tsx`

**Interfaces:**
- Produces: `HalftoneReveal({ src, alt }: { src: string; alt: string })` —— 图片覆盖层 hover 时网点从 7px 插值到 3px（对焦感）；底层复用 index.css 的 halftone 工具类；reduced-motion 由全局 CSS kill-switch 兜底（transition 被压到 0.01ms，效果即时化而非消失）。
```tsx
export function HalftoneReveal({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="group relative overflow-hidden border-2 border-line">
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
      <span
        aria-hidden="true"
        className="halftone pointer-events-none absolute inset-0 bg-paper opacity-45 transition-all duration-200 [background-size:7px] group-hover:opacity-20 group-hover:[background-size:3px]"
      />
    </figure>
  );
}
```
- [ ] **Step 2: 实现+验证**
测试：img 带 alt 且 lazy；覆盖层存在且含 halftone 类。门禁四连后提交 `feat(magpie): halftone reveal (P1/T5)`。

### Task 6: 整备验收门 + 演示位接线

**Files:**
- Modify: `src/pages/ShowcasePage.tsx`（新增 RailDemo section 与 tape 位）
- Test: 全量回归（无新测试文件）

**Interfaces:**
- Produces: 四原语在真实页面的最小消费者（无新路由）。

- [ ] **Step 1: ShowcasePage 接线**
```tsx
// WorldDivider 之后插入
<PressTape items={["ONE FOR SORROW", "SEVEN FOR A SECRET", "CASE 1954-PYE REOPENED"]} />
<HorizontalRail ariaLabel="Exhibit gallery">
  {EXHIBITS.map((ex) => (
    <figure key={ex.badge} className="w-[70vw] shrink-0 border-2 border-line bg-card p-8 shadow-print">
      <figcaption className="font-machine text-xs uppercase tracking-[0.25em]">{ex.badge}</figcaption>
    </figure>
  ))}
</HorizontalRail>
```
- [ ] **Step 2: 验收门（P1 DoD，失败即回对应任务修复重跑）**
```bash
npm run build
grep -q "The Case of" build/client/index.html && echo PRERENDER-OK
npm run typecheck && npm test && npm run lint
```
- [ ] **Step 3: 提交** `feat(motion): p1 rail demo wiring and gate (P1/T6)`。

---

## 附录 A：冻结接口契约（供 P2-P4 计划引用）

| 契约 | 值 |
|------|-----|
| `railShift(progress, contentW, viewW)` | 返回 ≤0 的位移像素；进度钳制 [0,1] |
| `HorizontalRail` | 挂载时采样 reduced-motion → data-variant native/pinned 双形态 |
| `PressTape({items})` | reduced 或空数组 → null；轨道 aria-hidden + sr-only 副本 |
| `clampPct(v)` | [5,95] 钳制 |
| `CenterSeam` | pointer 拖拽 + 键盘 ±5%，role=separator 带 aria-valuenow |
| `HalftoneReveal({src,alt})` | hover 网点 7px→3px，reduced 由全局 kill-switch 兜底 |
| Veil/WorldWipe reduced 口径 | 动画跳过、状态直接切换 |
