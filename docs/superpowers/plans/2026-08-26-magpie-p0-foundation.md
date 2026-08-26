# Magpie P0 底座迁移 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 xique-react 从 RRv7 library 模式迁移到 framework 模式（SPA + 构建期 prerender），并交付平滑滚动底座、路由擦除转场组件与 SSG 安全的 AnagramText。

**Architecture:** React Router v7 framework 模式提供构建期预渲染的静态 HTML；Lenis 提供惯性平滑滚动并把全站锚点收敛到 `scrollTo`；新组件 `Veil` 承担路由遮幅擦除转场；`AnagramText` 改用确定性种子随机消除水合错位。四个交付物相互独立、逐任务验证。

**Tech Stack:** @react-router/dev ^7 · lenis · motion/react · Vitest + Testing Library (jsdom)

## Global Constraints（源自 spec，各任务隐含遵守）

- 三色法则：vermillion `#C8281E` / warm ink `#17120C` / aged paper `#F3EEE3`；禁止第四色、渐变、模糊、圆角。
- 运动预算：入场 ≤800ms，交互 ≤240ms；转场永远擦除（wipe），禁止淡出。
- 转场时长常量：cover/reveal 各 550ms（`VEIL_HALF_MS`）。
- 字体仅 @fontsource 自托管三款（Anton / Crimson Pro / Courier Prime）；内容语言英文为主（spec 决策 D3）。
- Biome 2：2 空格缩进、行宽 100、`useImportType` 为 error——类型导入必须 `import type`。
- TS strict 全开 + `verbatimModuleSyntax` + `erasableSyntaxOnly`（禁 enum）。
- 测试：Vitest jsdom + RTL，setup 已 mock IntersectionObserver；禁止 `test.skip` / `.only` / 占位实现。

> ⚠️ **本仓库当前不是 git 仓库。** 建议执行前先 `git init && git add -A && git commit -m "baseline"` 获得检查点能力；在 git 成立前，各任务的 "Commit" 步骤以运行验证命令替代并如实报告结果。

---

### Task 1: Seeded AnagramText（SSG 水合安全）

**Files:**
- Modify: `src/components/motion/AnagramText.tsx`
- Test: `src/__tests__/anagram.test.tsx`（新建）

**Interfaces:**
- Consumes: 无外部依赖变更
- Produces: `AnagramText({text, className?, delay?, beat?})` 对外签名不变；内部 `seededScramble(text)`（FNV-1a 种子 + mulberry32）为确定性函数：同输入同输出序列。

- [ ] **Step 1: 写失败测试**

```tsx
// src/__tests__/anagram.test.tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnagramText } from "@/components/motion/AnagramText";

describe("AnagramText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
  });

  it("initial scramble is identical across two mounts of the same text", () => {
    const a = render(<AnagramText text="PYE HALL" />);
    const b = render(<AnagramText text="PYE HALL" />);
    const ta = a.container.textContent ?? "";
    const tb = b.container.textContent ?? "";
    expect(ta).toBe(tb);
    expect(ta).toMatch(/^[A-Z&#%? ]+$/);
    // sr-only 的真实文本始终可访问
    expect(a.getByText("PYE HALL")).toBeInTheDocument();
  });

  it("推进假时钟后，可见层完整解析出真实文本", async () => {
    const { container } = render(<AnagramText text="PYE HALL" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800);
    });
    const visible = container.querySelector('[aria-hidden="true"]');
    expect(visible?.textContent).toBe("PYE HALL");
  });

  it("不同文本挂载的两个实例互不串扰", () => {
    const a = render(<AnagramText text="PYE HALL" />);
    const b = render(<AnagramText text="MAGPIE" />);
    const ta = a.container.textContent ?? "";
    const tb = b.container.textContent ?? "";
    expect(ta).not.toBe(tb);
  });
});
```

- [ ] **Step 2: 确认测试失败（红灯）**

  ```bash
  npx vitest run src/__tests__/anagram.test.tsx
  ```

  预期 FAIL：现实现 `scramble` 依赖 `Math.random`，同文本两次挂载的乱序序列不确定，第一条用例的等值断言必然失败。

- [ ] **Step 3: 实现确定性 seededScramble**

  用以下内容完整替换 `src/components/motion/AnagramText.tsx`：组件签名、`GLYPHS` 常量、`useReducedMotion` 分支、`sr-only` 结构全部保留；`scramble` 改名 `seededScramble(text)`——先以 FNV-1a（偏移 `0x811c9dc5`、质数 `0x01000193`）哈希 text 得种子，再由 mulberry32 生成随机流替代 `Math.random`；interval 解析逻辑不变。

  ```tsx
  // src/components/motion/AnagramText.tsx
  import { useReducedMotion } from "motion/react";
  import { useEffect, useState } from "react";

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&#%?";

  /** FNV-1a：把任意字符串折叠为 32 位确定性种子 */
  function fnv1a(text: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /** mulberry32：由 32 位种子生成确定性的 [0, 1) 随机流 */
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** 确定性乱序：同 text 同输出序列，预渲染 HTML 与客户端一致 */
  function seededScramble(text: string): string {
    const random = mulberry32(fnv1a(text));
    let out = "";
    for (const ch of text) {
      out += ch === " " ? " " : GLYPHS[Math.floor(random() * GLYPHS.length)];
    }
    return out;
  }

  type AnagramTextProps = {
    text: string;
    className?: string;
    delay?: number;
    beat?: number;
  };

  export function AnagramText({
    text,
    className,
    delay = 350,
    beat = 110,
  }: AnagramTextProps) {
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState(() => (reduced ? text : seededScramble(text)));

    useEffect(() => {
      if (reduced) {
        setDisplay(text);
        return;
      }
      setDisplay(seededScramble(text));
      const start = Date.now() + delay;
      const id = window.setInterval(() => {
        const resolved = Math.floor((Date.now() - start) / beat);
        if (resolved >= text.length) {
          setDisplay(text);
          window.clearInterval(id);
          return;
        }
        setDisplay(text.slice(0, resolved) + seededScramble(text.slice(resolved)));
      }, 55);
      return () => window.clearInterval(id);
    }, [text, reduced, delay, beat]);

    return (
      <span className={className}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{display}</span>
      </span>
    );
  }
  ```

- [ ] **Step 4: 验证绿灯与全量回归**

  ```bash
  npx vitest run src/__tests__/anagram.test.tsx   # 预期 PASS：3 个用例全绿
  npm test                                        # 全量回归预期 PASS
  ```

  `src/__tests__/motion.test.tsx` 已覆盖 AnagramText 既有行为，本步同时确认其未被本次改动破坏。

---

### Task 2: RRv7 framework 模式迁移（原子任务）

> 本任务结束时仓库必须可编译、可测试：中途不留可提交的中间态。

**Files:**
- Modify: `package.json`、`vite.config.ts`、`tsconfig.app.json`、`tsconfig.node.json`
- Create: `react-router.config.ts`、`src/routes.ts`、`src/root.tsx`、`src/pages/NotFoundRedirect.tsx`
- Delete: `src/main.tsx`、`src/App.tsx`、`index.html`

**Interfaces:**
- Consumes: `ShowcasePage`（`src/pages/ShowcasePage.tsx` 默认导出）与 `WorldProvider`（`src/components/motion/WorldWipe.tsx`）零改动复用；现有两个测试文件均直接 import 组件、不依赖 `App.tsx`/`main.tsx`，删除旧入口不影响测试。
- Produces: framework 入口 `src/root.tsx`（导出 `Layout({ children }: { children: ReactNode })` 与默认导出 `App()`）；路由映射 `src/routes.ts`（默认导出满足 `RouteConfig`）；`src/pages/NotFoundRedirect.tsx` 默认导出，仅渲染 `<Navigate to="/" replace />`。

- [ ] **Step 1: 依赖切换**

  ```bash
  npm install -D @react-router/dev@^7.8
  npm uninstall @vitejs/plugin-react
  ```

  运行时包 `react-router@^7.8.0` 已在 dependencies，无需改动。

- [ ] **Step 2: 新建根级 `react-router.config.ts`**

  ```ts
  // react-router.config.ts
  import type { Config } from "@react-router/dev/config";

  export default {
    ssr: false,
    prerender: ["/"],
  } satisfies Config;
  ```

  `ssr: false` + prerender 即 spec 决策 D2 的「SPA + 构建期预渲染」形态。

- [ ] **Step 3: 重写 `vite.config.ts`**

  plugins 换成 `[reactRouter(), tailwindcss()]`（`reactRouter` 自 `"@react-router/dev/vite"` 导入），alias 与整个 test 块逐字保留：

  ```ts
  // vite.config.ts
  import { fileURLToPath, URL } from "node:url";
  import { reactRouter } from "@react-router/dev/vite";
  import tailwindcss from "@tailwindcss/vite";
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    plugins: [reactRouter(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  });
  ```

- [ ] **Step 4: 调整 tsconfig**

  `tsconfig.app.json` 在 compilerOptions 增加 `"rootDirs": [".", "./.react-router/types"]`，include 追加类型目录；`tsconfig.node.json` 的 include 改为两个 config 目标：

  ```jsonc
  // tsconfig.app.json —— 仅列出新增/变更键，其余 compilerOptions 原样保留
  {
    "compilerOptions": {
      "rootDirs": [".", "./.react-router/types"]
    },
    "include": ["src", ".react-router/types/**/*"]
  }
  ```

  ```jsonc
  // tsconfig.node.json —— 仅列出变更键
  {
    "include": ["vite.config.ts", "react-router.config.ts"]
  }
  ```

- [ ] **Step 5: 新建 `src/routes.ts`**

  ```ts
  // src/routes.ts
  import { index, route, type RouteConfig } from "@react-router/dev/routes";

  export default [
    index("pages/ShowcasePage"),
    route("*", "pages/NotFoundRedirect"),
  ] satisfies RouteConfig;
  ```

  模块路径相对 `src/` 解析（appDirectory 保持默认，见 Step 9 应急注记）。

- [ ] **Step 6: 新建 `src/pages/NotFoundRedirect.tsx`**

  ```tsx
  // src/pages/NotFoundRedirect.tsx
  import { Navigate } from "react-router";

  export default function NotFoundRedirect() {
    return <Navigate to="/" replace />;
  }
  ```

- [ ] **Step 7: 新建 `src/root.tsx`**

  Layout 承接原 `index.html` 的完整 head（charset / viewport / theme-color `#C8281E` / title），description 更新为提及 Orion Arch 的博客文案；`<html lang="en" data-world="red">`；`Meta` / `Links` / `Scripts` / `ScrollRestoration` 就位。默认导出 App 本任务只包 `WorldProvider`（SmoothScroll / Veil 由 Task 3/4 依序包入）。`src/main.tsx` 的全部 @fontsource 导入（7 条）与 `./index.css` 原样迁入：

  ```tsx
  // src/root.tsx
  import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
  import type { ReactNode } from "react";
  import "@fontsource/anton";
  import "@fontsource/crimson-pro/400.css";
  import "@fontsource/crimson-pro/400-italic.css";
  import "@fontsource/crimson-pro/600.css";
  import "@fontsource/crimson-pro/700.css";
  import "@fontsource/courier-prime/400.css";
  import "@fontsource/courier-prime/700.css";
  import "./index.css";
  import { WorldProvider } from "@/components/motion/WorldWipe";

  export function Layout({ children }: { children: ReactNode }) {
    return (
      <html lang="en" data-world="red">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#C8281E" />
          <meta
            name="description"
            content="The Magpie Files — engineering notes and algorithm case files by Orion Arch."
          />
          <title>The Magpie Files · 喜鹊档案</title>
          <Meta />
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }

  export default function App() {
    return (
      <WorldProvider>
        <Outlet />
      </WorldProvider>
    );
  }
  ```

- [ ] **Step 8: 删除旧入口并清理产物**

  ```bash
  rm src/main.tsx src/App.tsx index.html
  rm -rf dist
  ```

  HTML 生成职责移交 reactRouter 插件，`src/root.tsx` 成为唯一 HTML 源。若已 `git init`，把 `.react-router/` 与 `build/` 加进 `.gitignore`。

- [ ] **Step 9: 更新 `package.json` scripts**

  ```jsonc
  {
    "scripts": {
      "dev": "react-router dev",
      "build": "tsc -b && react-router build",
      "preview": "vite preview --outDir build/client",
      "lint": "biome check .",
      "lint:fix": "biome check --write .",
      "typecheck": "tsc -b --noEmit",
      "test": "vitest run"
    }
  }
  ```

  **应急注记（版本兼容）**
  - 若当前 `@react-router/dev` 版本不识别插件选项，不要使用 `appDirectory` 参数（默认即 app 目录）。
  - 本仓库用 `routes.ts` 显式映射；若与 app 目录约定冲突（例如插件强制要求 `app/routes.ts`），第二方案：在根建 `app/routes.ts` 转引 `../src` 内模块，`src/routes.ts` 改为从该文件 re-export。

- [ ] **Step 10: 验证（原子性收口）**

  ```bash
  npm run build      # 首次运行生成 .react-router/types 与 build/client 预渲染产物
  npm run typecheck  # 依赖上一步生成的类型声明，必须后跑
  npm test           # 全量回归预期 PASS（现有用例不依赖已删入口）
  ```

  三项全绿即 Task 2 完成；任一失败在本任务内修复至全绿，不留中间态。

---

### Task 3: SmoothScroll（Lenis 底座）

**Files:**
- Modify: `src/root.tsx`
- Create: `src/components/motion/SmoothScroll.tsx`、`src/__tests__/smoothscroll.test.tsx`

**Interfaces:**
- Consumes: `lenis`（Step 1 新增到 dependencies）。
- Produces: `SmoothScroll({ children }: { children: ReactNode })` provider；`useSmoothScroll(): Lenis | null`（未挂载或 reduced-motion 降级时为 null）。

- [ ] **Step 1: 安装 Lenis**

  ```bash
  npm install lenis
  ```

- [ ] **Step 2: 实现 `src/components/motion/SmoothScroll.tsx`**

  行为契约：挂载时 `prefers-reduced-motion` 命中则完全不创建实例（原生滚动）；否则 `new Lenis({ duration: 0.8 })` 并用 rAF 循环驱动 `lenis.raf`；卸载时 `cancelAnimationFrame` + `lenis.destroy()`；document 级 click 监听拦截 `a[href^="#"]`，目标元素存在时 `preventDefault` 并 `lenis.scrollTo(el, { offset: -72 })`。

  ```tsx
  // src/components/motion/SmoothScroll.tsx
  import Lenis from "lenis";
  import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
  } from "react";
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

    return (
      <SmoothScrollContext.Provider value={lenis}>
        {children}
      </SmoothScrollContext.Provider>
    );
  }
  ```

- [ ] **Step 3: 编辑 `src/root.tsx` 包入 SmoothScroll**

  import 区新增 `import { SmoothScroll } from "@/components/motion/SmoothScroll";`，默认导出改为：

  ```tsx
  export default function App() {
    return (
      <WorldProvider>
        <SmoothScroll>
          <Outlet />
        </SmoothScroll>
      </WorldProvider>
    );
  }
  ```

- [ ] **Step 4: 新建 `src/__tests__/smoothscroll.test.tsx`**

  ```tsx
  // src/__tests__/smoothscroll.test.tsx
  import { fireEvent, render, screen } from "@testing-library/react";
  import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
  import { SmoothScroll } from "@/components/motion/SmoothScroll";

  const mocks = vi.hoisted(() => ({
    ctor: vi.fn(),
    scrollTo: vi.fn(),
  }));

  vi.mock("lenis", () => ({
    default: class MockLenis {
      raf = vi.fn();
      destroy = vi.fn();
      scrollTo = mocks.scrollTo;
      constructor(options: unknown) {
        mocks.ctor(options);
      }
    },
  }));

  describe("SmoothScroll", () => {
    beforeEach(() => {
      mocks.ctor.mockClear();
      mocks.scrollTo.mockClear();
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("挂载后恰好构造一次 Lenis({ duration: 0.8 })", () => {
      render(
        <SmoothScroll>
          <div>content</div>
        </SmoothScroll>,
      );
      expect(mocks.ctor).toHaveBeenCalledTimes(1);
      expect(mocks.ctor).toHaveBeenCalledWith(
        expect.objectContaining({ duration: 0.8 }),
      );
    });

    it("拦截站内锚点并 scrollTo(el, { offset: -72 })", () => {
      render(
        <SmoothScroll>
          <a href="#target">go</a>
          <div id="target">destination</div>
        </SmoothScroll>,
      );
      fireEvent.click(screen.getByText("go"));
      expect(mocks.scrollTo).toHaveBeenCalledTimes(1);
      const [el, options] = mocks.scrollTo.mock.calls[0];
      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.id).toBe("target");
      expect(options).toEqual(expect.objectContaining({ offset: -72 }));
    });

    it("prefers-reduced-motion 时不创建任何实例", () => {
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
      render(
        <SmoothScroll>
          <div>content</div>
        </SmoothScroll>,
      );
      expect(mocks.ctor).not.toHaveBeenCalled();
    });
  });
  ```

  说明：jsdom 未实现 `window.matchMedia`，三个用例统一以 `vi.stubGlobal` 提供（用例 ③ 覆写为 `matches: true`），`afterEach` 的 `vi.unstubAllGlobals()` 负责恢复原值。

- [ ] **Step 5: 验证**

  ```bash
  npx vitest run src/__tests__/smoothscroll.test.tsx    # 预期 PASS：3 用例
  npm run build && npm run typecheck && npm test         # 全绿
  ```

---

### Task 4: Veil（路由擦除转场）

**Files:**
- Modify: `src/root.tsx`
- Create: `src/components/motion/Veil.tsx`、`src/__tests__/veil.test.tsx`

**Interfaces:**
- Consumes: `react-router` 的 `Link` 与 `useNavigate`；`motion/react` 的 `motion`；`EASE_PRINT`（`@/lib/motion`）。
- Produces: `VEIL_HALF_MS = 550`；`VeilProvider({ children }: { children: ReactNode })`；`useVeil(): { travel(to: string): void }`；`VeilOverlay()`；`LinkUnderVeil`（props：`Omit<ComponentPropsWithoutRef<typeof Link>, "to"> & { to: string }`）。

- [ ] **Step 1: 实现 `src/components/motion/Veil.tsx`**

  状态机：`travel(to)` 以 busy ref 防重入——盖下 550ms → `navigate(to)` → 再 550ms 后揭开。overlay 为 `motion.div fixed inset-0 z-[60] origin-center pointer-events-none`，背景恒为 ink `#17120c`（两种世界下都可读），`animate scaleX: covering ? 1 : 0`，时长 `VEIL_HALF_MS / 1000`、ease `EASE_PRINT`；`data-veil` 与 `data-covering` 属性供测试断言。

  ```tsx
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
  import { EASE_PRINT } from "@/lib/motion";

  export const VEIL_HALF_MS = 550;

  type VeilState = {
    covering: boolean;
    travel: (to: string) => void;
  };

  const VeilStateContext = createContext<VeilState | null>(null);

  /** 路由擦除转场 API：travel("/path") = 盖下 550ms → 导航 → 揭开 550ms */
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

    return (
      <VeilStateContext.Provider value={state}>{children}</VeilStateContext.Provider>
    );
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
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
          travel(to);
        }}
        {...rest}
      />
    );
  }
  ```

- [ ] **Step 2: 编辑 `src/root.tsx` 挂入 Veil**

  import 区新增 `import { VeilOverlay, VeilProvider } from "@/components/motion/Veil";`，默认导出改为（WorldProvider 保持最外层）：

  ```tsx
  export default function App() {
    return (
      <WorldProvider>
        <SmoothScroll>
          <VeilProvider>
            <Outlet />
            <VeilOverlay />
          </VeilProvider>
        </SmoothScroll>
      </WorldProvider>
    );
  }
  ```

- [ ] **Step 3: 新建 `src/__tests__/veil.test.tsx`**

  MemoryRouter + 两个探针页；"/away" 探针页以模块级计数 effect 记录导航次数：

  ```tsx
  // src/__tests__/veil.test.tsx
  import { act, fireEvent, render, screen } from "@testing-library/react";
  import { useEffect } from "react";
  import { MemoryRouter, Route, Routes } from "react-router";
  import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
  import { LinkUnderVeil, VeilOverlay, VeilProvider } from "@/components/motion/Veil";

  let awayMounts = 0;

  function Home() {
    return (
      <main>
        <h1>Home</h1>
        <LinkUnderVeil to="/away">Go away</LinkUnderVeil>
      </main>
    );
  }

  function Away() {
    useEffect(() => {
      awayMounts += 1;
    }, []);
    return <h1>Away</h1>;
  }

  function renderApp() {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <VeilProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/away" element={<Away />} />
          </Routes>
          <VeilOverlay />
        </VeilProvider>
      </MemoryRouter>,
    );
  }

  describe("Veil", () => {
    beforeEach(() => {
      awayMounts = 0;
      vi.useFakeTimers();
    });

    afterEach(() => {
      act(() => vi.runOnlyPendingTimers());
      vi.useRealTimers();
    });

    it("点击后盖下并完成导航，随后揭开", async () => {
      renderApp();
      await act(async () => {
        fireEvent.click(screen.getByText("Go away"));
        await vi.advanceTimersByTimeAsync(600);
      });
      expect(screen.getByText("Away")).toBeInTheDocument();
      expect(
        document.querySelector('[data-veil][data-covering="true"]'),
      ).not.toBeNull();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });
      expect(
        document.querySelector('[data-veil][data-covering="false"]'),
      ).not.toBeNull();
    });

    it("双击防重入：目标页只挂载一次", async () => {
      renderApp();
      const link = screen.getByText("Go away");
      await act(async () => {
        fireEvent.click(link);
        fireEvent.click(link); // busy 窗口内的第二次点击被丢弃
        await vi.advanceTimersByTimeAsync(600);
      });
      expect(screen.getByText("Away")).toBeInTheDocument();
      expect(awayMounts).toBe(1);
    });
  });
  ```

- [ ] **Step 4: 验证**

  ```bash
  npx vitest run src/__tests__/veil.test.tsx      # 预期 PASS：2 用例
  npm run build && npm run typecheck && npm test  # 全绿
  ```

---

### Task 5: 发布验收门（P0 Definition of Done）

**Files:** 无代码改动（只读验收）。

**Interfaces:**
- Consumes: Task 1–4 全部产出。
- Produces: P0 完成判定记录（下列五项命令的输出）。

- [ ] **Step 1: 按序执行并逐条记录结果**

  ```bash
  npm run build
  grep -q "The Case of" build/client/index.html && echo PRERENDER-OK
  npm run typecheck
  npm test
  npm run lint
  ```

  ① build 成功且产出 `build/client`；② 首页 HTML 为构建期预渲染（"The Case of" 是 `src/pages/ShowcasePage.tsx:62` 的既有首屏文案，grep 命中即证明内容已内联进静态 HTML）；③ 类型全绿；④ 测试全绿；⑤ Biome 全绿。五项全过 → **P0 底座迁移完成**；任一失败回到对应 Task 修复后重跑全序列。

---

## 附录 A：冻结接口契约（P1–P4 计划引用）

以下契约在 P0 落地后冻结；后续阶段只能消费、不得擅改，如需变更必须在对应阶段计划中显式声明并说明理由。

| 契约 | 冻结内容 |
|------|----------|
| `LinkUnderVeil` | props：`Omit<ComponentPropsWithoutRef<typeof Link>, "to"> & { to: string }`；onClick 内 `preventDefault` 后调用 `travel(to)` |
| `useVeil().travel` | `(to: string) => void`；busy ref 防重入；盖下 550ms → `navigate(to)` → 揭开 550ms |
| `useSmoothScroll` | `(): Lenis \| null`；reduced-motion 或未挂载时为 null；实例参数 `{ duration: 0.8 }` |
| 锚点滚动偏移 | 全站锚点统一 `lenis.scrollTo(el, { offset: -72 })`（预留固定眉线高度） |
| `seededScramble` 确定性 | FNV-1a（offset `0x811c9dc5`、prime `0x01000193`）种子 + mulberry32 随机流；同输入同输出序列 |
| `VEIL_HALF_MS` | `550`（cover 与 reveal 各半），与 Global Constraints 转场常量一致 |
| 标准验收门 | `npm run build` → `grep -q "The Case of" build/client/index.html && echo PRERENDER-OK` → `npm run typecheck` → `npm test` → `npm run lint` |

## 附录 B：后续计划路线

| 阶段 | 交付物 | 计划文件 |
|------|--------|----------|
| P1 动效库 | HorizontalRail · Center-Seam Drag · Press Tape · Halftone Reveal | `docs/superpowers/plans/YYYY-MM-DD-magpie-p1-*.md` |
| P2 内容管线 | MDX + Shiki 双主题 + OG/RSS + frontmatter 校验 | `docs/superpowers/plans/YYYY-MM-DD-magpie-p2-*.md` |
| P3 页面层 | 档案墙 / 正文模板（Folio 进度）/ Lab / Colophon | `docs/superpowers/plans/YYYY-MM-DD-magpie-p3-*.md` |
| P4 发布打磨 | giscus 重肤 + pagefind UI + Lighthouse 达标 + 上线 | `docs/superpowers/plans/YYYY-MM-DD-magpie-p4-*.md` |

各阶段在前一阶段落地并通过验收门后，另立对应计划文件；本文件自 P0 验收门通过即封版，后续阶段不再回写。
