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
    expect(mocks.ctor).toHaveBeenCalledWith(expect.objectContaining({ duration: 0.8 }));
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
