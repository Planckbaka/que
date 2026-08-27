import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CenterSeam } from "@/components/motion/CenterSeam";
import { clampPct } from "@/lib/motion";

describe("clampPct", () => {
  it("clamps to seam bounds", () => {
    expect(clampPct(-20)).toBe(5);
    expect(clampPct(50)).toBe(50);
    expect(clampPct(150)).toBe(95);
  });
});

describe("CenterSeam", () => {
  afterEach(() => {
    vi.restoreAllMocks(); // 恢复 getBoundingClientRect spy
  });

  function setup() {
    render(<CenterSeam left={<span>left-world</span>} right={<span>right-world</span>} />);
    const handle = screen.getByRole("separator", {
      name: "Drag to resize the two worlds",
    });
    const box = handle.parentElement as HTMLElement;
    return { handle, box };
  }

  it("pointer drag to 30%: left panel width 30%", () => {
    const { handle, box } = setup();
    vi.spyOn(box, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 1000,
    } as DOMRect);
    // jsdom 26 没有 PointerEvent：缺了它 RTL 的 fireEvent.pointerDown 会退化成裸
    // Event，clientX/buttons 全被丢掉。挂一个基于 MouseEvent 的最小桩。
    vi.stubGlobal("PointerEvent", class PE extends MouseEvent {});
    // jsdom 也没有 Element.setPointerCapture，给 handle 挂实例级空实现。
    handle.setPointerCapture = vi.fn();

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 500, buttons: 1 });
    fireEvent.pointerMove(handle, { clientX: 300, buttons: 1 });

    vi.unstubAllGlobals();
    const leftPanel = box.firstElementChild as HTMLElement;
    expect(leftPanel.style.width).toBe("30%");
    expect(handle.style.left).toBe("30%");
  });

  it("ArrowRight steps seam 50 to 55", () => {
    const { handle, box } = setup();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    const leftPanel = box.firstElementChild as HTMLElement;
    expect(leftPanel.style.width).toBe("55%");
    expect(handle.style.left).toBe("55%");
  });

  it("aria-valuenow stays in sync with the seam", () => {
    const { handle, box } = setup();
    expect(handle).toHaveAttribute("aria-valuenow", "50");

    vi.spyOn(box, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 1000,
    } as DOMRect);
    vi.stubGlobal("PointerEvent", class PE extends MouseEvent {});
    handle.setPointerCapture = vi.fn();
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 500, buttons: 1 });
    fireEvent.pointerMove(handle, { clientX: 250, buttons: 1 });
    vi.unstubAllGlobals();
    expect(handle).toHaveAttribute("aria-valuenow", "25");

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(handle).toHaveAttribute("aria-valuenow", "20");
  });
});
