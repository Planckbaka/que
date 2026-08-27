// src/__tests__/presstape.test.tsx
// P1/T3 PressTape 回归（R1 后）：默认环境（setup.ts 存根 matches:false）下动画轨道内含
// 两份字面量半区（无缝 -50% 回卷），判别断言限定 .press-tape-track 内每条文本 = 2 次
// （sr-only 层不计），全组件合计 3 次；reduced-motion 存根命中或 items 为空 → 整条返回
// null（container empty）。stub 收尾统一 unstubAllGlobals 回到 setup 默认值。
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PressTape } from "@/components/motion/PressTape";

describe("PressTape", () => {
  afterEach(() => {
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根（matches:false）
  });

  it("renders two identical track halves: in-track text count = 2 per item, sr-only adds 1", () => {
    const items = ["BODY FOUND IN RIVER", "DID YOU SEE THE MAGPIE"];
    const { container } = render(<PressTape items={items} />);

    const track = container.querySelector(".press-tape-track");
    expect(track).not.toBeNull();
    // 判别断言：限定动画轨道内查询，每条文本恰出现 2 × 1 次（两份半区）；sr-only 不计入
    for (const t of items) {
      const inTrack = Array.from(track?.querySelectorAll("span") ?? []).filter(
        (s) => s.textContent === t,
      );
      expect(inTrack).toHaveLength(2);
      // 全组件合计 = 轨道 2 + sr-only 1
      expect(screen.getAllByText(t)).toHaveLength(3);
    }
    // 轨道 = 两个字面量半区兄弟；track 自身无 gap（-50% 恰为一个半区宽 → 无缝）
    expect(track?.children).toHaveLength(2);
    expect(track?.className).not.toContain("gap");
  });

  it("items=[]: returns null, container empty (default stub matches:false)", () => {
    const { container } = render(<PressTape items={[]} />);
    expect(container.childElementCount).toBe(0);
    expect(container.innerHTML).toBe("");
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
