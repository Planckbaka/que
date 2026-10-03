import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HorizontalRail } from "@/components/motion/HorizontalRail";
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

describe("HorizontalRail", () => {
  afterEach(() => {
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根（matches:false）
  });

  function stubReducedMotion() {
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
  }

  it("reduced-motion stub true: outer data-variant=native, track has no sticky", async () => {
    stubReducedMotion();
    const { container } = render(
      <HorizontalRail ariaLabel="rail-native">
        <span>plate-1</span>
        <span>plate-2</span>
      </HorizontalRail>,
    );
    const outer = container.firstElementChild as HTMLElement;
    await waitFor(() => {
      expect(outer).toHaveAttribute("data-variant", "native");
    });
    expect(outer.querySelector(".sticky")).toBeNull();
    // native 视口（语义 section）自带命名 region：键盘聚焦的滚动区可被辅助技术发现
    const region = within(outer).getByRole("region", { name: "rail-native" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("default stub false: outer data-variant=pinned with sticky pinning", () => {
    const { container } = render(
      <HorizontalRail ariaLabel="rail-pinned">
        <span>plate-1</span>
        <span>plate-2</span>
      </HorizontalRail>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveAttribute("data-variant", "pinned");
    expect(outer.querySelector(".sticky")).not.toBeNull();
  });

  it("reserves vertical travel from the actual clipping width and updates on resize", () => {
    const { container } = render(
      <HorizontalRail ariaLabel="sized-rail">
        <span>plate</span>
      </HorizontalRail>,
    );
    const outer = container.firstElementChild as HTMLElement;
    const viewport = outer.firstElementChild as HTMLDivElement;
    const track = screen.getByTestId("rail-track");
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 1600 });
    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 800 });
    Object.defineProperty(viewport, "offsetHeight", { configurable: true, value: 600 });

    act(() => window.dispatchEvent(new Event("resize")));
    expect(outer).toHaveStyle({ height: "1400px" });

    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 1000 });
    act(() => window.dispatchEvent(new Event("resize")));
    expect(outer).toHaveStyle({ height: "1200px" });

    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 1800 });
    act(() => window.dispatchEvent(new Event("resize")));
    expect(outer).toHaveStyle({ height: "600px" });
  });

  it("removes the pinned travel when reduced motion is enabled after mounting", () => {
    let preferenceChanged: (() => void) | undefined;
    const media = {
      matches: false,
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        preferenceChanged = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => media),
    );
    const { container } = render(
      <HorizontalRail ariaLabel="adaptive-rail">
        <span>plate</span>
      </HorizontalRail>,
    );
    const outer = container.firstElementChild as HTMLElement;
    const viewport = outer.firstElementChild as HTMLDivElement;
    Object.defineProperty(screen.getByTestId("rail-track"), "scrollWidth", { value: 1600 });
    Object.defineProperty(viewport, "clientWidth", { value: 800 });
    Object.defineProperty(viewport, "offsetHeight", { value: 600 });
    act(() => window.dispatchEvent(new Event("resize")));
    expect(outer.style.height).toBe("1400px");

    act(() => {
      media.matches = true;
      preferenceChanged?.();
    });
    expect(outer).toHaveAttribute("data-variant", "native");
    expect(outer.style.height).toBe("");
    // 翻转替换了整个视口元素（div -> section），重新查询
    const nativeViewport = outer.firstElementChild as HTMLElement;
    expect(nativeViewport).toHaveClass("overflow-x-auto");
    expect(nativeViewport).not.toHaveClass("sticky");
  });
});
