// src/__tests__/presstape.test.tsx
// P1/T3 PressTape 回归（R1 后）：默认环境（setup.ts 存根 matches:false）下动画轨道内含
// 两份字面量半区（无缝 -50% 回卷），判别断言限定 .press-tape-track 内每条文本 = 2 次；
// 无障碍文案由容器 aria-label 承载一份（优化轮：sr-only 重复行与 w-max 冲突曾把文档
// 撑出 536px 横向溢出，移除）。空 items 返回 null；reduced-motion 由 CSS 隐藏，保持水合结构一致。
// stub 收尾统一 unstubAllGlobals 回到 setup 默认值。
import { act, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PressTape } from "@/components/motion/PressTape";

describe("PressTape", () => {
  afterEach(() => {
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根（matches:false）
  });

  it("renders two identical track halves; accessible copy lives on aria-label", () => {
    const items = ["BODY FOUND IN RIVER", "DID YOU SEE THE MAGPIE"];
    const { container } = render(<PressTape items={items} />);

    const tape = container.querySelector(".press-tape");
    expect(tape?.getAttribute("aria-label")).toBe(items.join(" · "));
    expect(tape?.getAttribute("role")).toBe("marquee");

    const track = container.querySelector(".press-tape-track");
    expect(track).not.toBeNull();
    // 判别断言：限定动画轨道内查询，每条文本恰出现 2 次（两份半区）
    for (const t of items) {
      const inTrack = Array.from(track?.querySelectorAll("span") ?? []).filter(
        (s) => s.textContent === t,
      );
      expect(inTrack).toHaveLength(2);
      // 全组件可见文案 = 轨道 2 份（aria-hidden），容器 aria-label 承载无障碍副本
      expect(screen.getAllByText(t)).toHaveLength(2);
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

  it("hydrates the same server markup when the client prefers reduced motion", async () => {
    const tree = <PressTape items={["HOT OFF THE PRESS"]} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const serverTape = container.firstElementChild;
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
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, { onRecoverableError });
      });
      expect(serverTape).not.toBeNull();
      expect(container.firstElementChild).toBe(serverTape);
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
