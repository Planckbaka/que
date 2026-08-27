// src/__tests__/smoothscroll.test.tsx
import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const mocks = vi.hoisted(() => ({
  ctor: vi.fn(),
  scrollTo: vi.fn(),
  // 每个 mock Lenis 客户端实例都被记录，供 unmount 清理用例断言实例级 raf/destroy
  instances: [] as unknown[],
}));

vi.mock("lenis", () => ({
  default: class MockLenis {
    raf = vi.fn();
    destroy = vi.fn();
    scrollTo = mocks.scrollTo;
    constructor(options: unknown) {
      mocks.ctor(options);
      mocks.instances.push(this);
    }
  },
}));

describe("SmoothScroll", () => {
  beforeEach(() => {
    mocks.ctor.mockClear();
    mocks.scrollTo.mockClear();
    mocks.instances.length = 0;
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根
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

  it("拦截站内锚点并 scrollTo(el, { offset: -72 })，同时阻止默认跳转", () => {
    render(
      <SmoothScroll>
        <a href="#target">go</a>
        <div id="target">destination</div>
      </SmoothScroll>,
    );
    const link = screen.getByText("go");
    const clickEvent = createEvent.click(link);
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");
    fireEvent(link, clickEvent);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
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

  it("unmount 清理：rAF 循环冻结且 destroy 恰好一次", async () => {
    const { unmount } = render(
      <SmoothScroll>
        <div>重渲染计数</div>
      </SmoothScroll>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(64);
    });
    const instance = mocks.instances[0] as { raf: Mock; destroy: Mock };
    const framesAtUnmount = instance.raf.mock.calls.length;
    expect(framesAtUnmount).toBeGreaterThan(0);
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    unmount();
    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(instance.raf.mock.calls.length).toBe(framesAtUnmount);
  });
});
