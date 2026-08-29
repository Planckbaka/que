// src/__tests__/typewriter-reduced.test.tsx
// Reduced-motion 形态回归：TypewriterText 必须跳过打字直接呈现全文（无 caret）。
// 与 anagram-reduced 同理：motion 的 useReducedMotion 是模块级单例（首次渲染读取一次
// matchMedia），reduced 场景必须独占测试文件；收尾 unstubAllGlobals 恢复。

import { render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TypewriterText } from "@/components/motion/TypewriterText";

describe("TypewriterText under prefers-reduced-motion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the full text instantly with no caret and never types", () => {
    const { container } = render(
      <TypewriterText text="EXHIBIT A-113" speed={20} startDelay={50} />,
    );
    const live = container.querySelector('[aria-hidden="true"]');
    expect(live?.textContent).toBe("EXHIBIT A-113");
    expect(container.querySelector(".caret-blink")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(live?.textContent).toBe("EXHIBIT A-113");
  });
});
