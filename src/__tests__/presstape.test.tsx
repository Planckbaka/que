// src/__tests__/presstape.test.tsx
// P1/T3 PressTape 回归：默认环境（setup.ts 存根 matches:false）下每条文本出现两次
// （aria-hidden 动画轨道 + sr-only 阅读层）；reduced-motion 存根命中时整条返回 null
// （container empty）。stub 收尾统一 unstubAllGlobals 回到 setup 默认值。
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PressTape } from "@/components/motion/PressTape";

describe("PressTape", () => {
  afterEach(() => {
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根（matches:false）
  });

  it("renders each item twice: animated track (aria-hidden) + sr-only row", () => {
    const items = ["BODY FOUND IN RIVER", "DID YOU SEE THE MAGPIE"];
    render(<PressTape items={items} />);

    for (const t of items) {
      expect(screen.getAllByText(t)).toHaveLength(2);
    }
    expect(screen.getAllByRole("marquee")).toHaveLength(1);
  });

  it("reduced-motion stub true: returns null, container empty", () => {
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
    const { container } = render(<PressTape items={["HOT OFF THE PRESS"]} />);
    expect(container.childElementCount).toBe(0);
    expect(container.innerHTML).toBe("");
  });
});
