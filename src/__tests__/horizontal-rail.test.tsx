import { render, screen, waitFor } from "@testing-library/react";
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
    render(
      <HorizontalRail ariaLabel="rail-native">
        <span>plate-1</span>
        <span>plate-2</span>
      </HorizontalRail>,
    );
    const outer = screen.getByLabelText("rail-native");
    await waitFor(() => {
      expect(outer).toHaveAttribute("data-variant", "native");
    });
    expect(outer.querySelector(".sticky")).toBeNull();
  });

  it("default stub false: outer data-variant=pinned with sticky pinning", () => {
    render(
      <HorizontalRail ariaLabel="rail-pinned">
        <span>plate-1</span>
        <span>plate-2</span>
      </HorizontalRail>,
    );
    const outer = screen.getByLabelText("rail-pinned");
    expect(outer).toHaveAttribute("data-variant", "pinned");
    expect(outer.querySelector(".sticky")).not.toBeNull();
  });
});
