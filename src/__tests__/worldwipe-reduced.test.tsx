// src/__tests__/worldwipe-reduced.test.tsx
// a7 reduced-motion 语义决策回归：WorldWipe.toggle 命中即直接 setWorld 翻转，
// 跳过擦除动画与两段 setTimeout（无擦除也无淡出=合规）。
// 独立小文件：全程 matchMedia(matches:true) 存根（jsdom 无 matchMedia，
// 默认环境由 setup.ts 提供 matches:false，本文件用 stubGlobal 覆盖后恢复）。
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorld, WorldProvider } from "@/components/motion/WorldWipe";

function ToggleProbe() {
  const { toggle } = useWorld();
  return (
    <button type="button" onClick={toggle}>
      switch world
    </button>
  );
}

describe("WorldWipe under prefers-reduced-motion", () => {
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
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("toggle 命中 reduced：dataset.world 立即翻转，无定时器参与且不回摆", async () => {
    render(
      <WorldProvider>
        <ToggleProbe />
      </WorldProvider>,
    );
    expect(document.documentElement.dataset.world).toBe("red");

    await act(async () => {
      fireEvent.click(screen.getByText("switch world"));
      await vi.advanceTimersByTimeAsync(0);
    });
    // 立即翻转：非 reduced 路径要等 550ms 才 setWorld，0ms 即翻转只能来自跳过路径
    expect(document.documentElement.dataset.world).toBe("black");

    // 推进远超原 550/1100ms 两段定时器，世界不回摆（证明无定时器参与）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(document.documentElement.dataset.world).toBe("black");
  });
});
