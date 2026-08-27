// src/__tests__/anagram-reduced.test.tsx
// Fix-A 水合契约回归测试：reduced-motion 用户的首帧必须恒等于确定性乱序（与预渲染 HTML 一致），
// 明文由挂载 effect 置入。约束说明：motion 的 useReducedMotion 走模块级单例（initPrefersReducedMotion
// 仅在首次渲染时读取一次 matchMedia），因此"reduced 场景"必须独占测试文件——本文件所有用例都在
// matchMedia(matches:true) 存根下渲染；收尾统一通过 vi.unstubAllGlobals() 恢复 matchMedia 原实现。
import { render } from "@testing-library/react";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnagramText } from "@/components/motion/AnagramText";

describe("AnagramText under prefers-reduced-motion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    // motion 的 initPrefersReducedMotion 会向 MediaQueryList 注册 change 监听器，
    // 所以存根对象需带 addEventListener/removeEventListener（平滑滚动用例只读 matches，无此需求）。
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("首帧（预渲染视角，无副作用阶段）为确定性乱序而非明文，且两次输出逐字节一致", () => {
    // SSR 不执行 effect，可采样到 effect 冲刷之前的真实首帧；
    // 旧实现（reduced ? text : seededScramble）在此场景会直接输出明文而使断言失败。
    const htmlA = renderToString(<AnagramText text="PYE HALL" />);
    const htmlB = renderToString(<AnagramText text="PYE HALL" />);
    expect(htmlA).toBe(htmlB);

    const match = /aria-hidden="true">([^<]*)<\/span>/.exec(htmlA);
    expect(match).toBeTruthy();
    const visible = match ? match[1] : "";
    expect(visible).toMatch(/^[A-Z&#%? ]+$/);
    expect(visible).not.toBe("PYE HALL");
  });

  it("客户端挂载并冲刷副作用后，可见层被置为明文（水合后修正）", async () => {
    const { container } = render(<AnagramText text="PYE HALL" />);
    const visible = container.querySelector('[aria-hidden="true"]');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(visible?.textContent).toBe("PYE HALL");
  });
});
