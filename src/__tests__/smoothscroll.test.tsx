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
  let reduce = false;
  let mediaListeners: Array<() => void> = [];

  beforeEach(() => {
    mocks.ctor.mockClear();
    mocks.scrollTo.mockClear();
    mocks.instances.length = 0;
    vi.useFakeTimers();
    reduce = false;
    mediaListeners = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        // getter：组件持有的是 matchMedia 返回的对象，matches 必须实时读取
        get matches() {
          return reduce;
        },
        media: query,
        addEventListener: (_type: string, listener: () => void) => {
          mediaListeners.push(listener);
        },
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根
  });

  const setPreference = (next: boolean) => {
    reduce = next;
    for (const listener of mediaListeners) listener();
  };

  it("挂载后恰好构造一次 Lenis({ duration: 0.8 })", () => {
    render(
      <SmoothScroll>
        <div>content</div>
      </SmoothScroll>,
    );
    expect(mocks.ctor).toHaveBeenCalledTimes(1);
    expect(mocks.ctor).toHaveBeenCalledWith(expect.objectContaining({ duration: 0.8 }));
  });

  it("拦截站内锚点，按 scroll-margin-top 对齐落点并阻止默认跳转", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      scrollMarginTop: "80px",
    } as unknown as CSSStyleDeclaration);
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
    expect(options).toEqual(expect.objectContaining({ offset: -80 }));
  });

  it("prefers-reduced-motion 时不创建任何实例", () => {
    reduce = true;
    render(
      <SmoothScroll>
        <div>content</div>
      </SmoothScroll>,
    );
    expect(mocks.ctor).not.toHaveBeenCalled();
  });

  it("reduced-motion 下不劫持锚点：放行原生跳转（焦点原生移动）", () => {
    reduce = true;
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
    // skip link 的语义依赖原生行为移动焦点，因此绝不能 preventDefault
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(mocks.scrollTo).not.toHaveBeenCalled();
  });

  it("劫持跳转的同时把焦点交给目标元素（skip link 穿越语义）", () => {
    render(
      <SmoothScroll>
        <a href="#target">go</a>
        <div id="target">destination</div>
      </SmoothScroll>,
    );
    const link = screen.getByText("go");
    fireEvent.click(link);
    const target = document.getElementById("target");
    expect(document.activeElement).toBe(target);
    expect(target?.getAttribute("tabindex")).toBe("-1");
  });

  it("中途切换 reduce：实例立即销毁；切回后重建", () => {
    render(
      <SmoothScroll>
        <div>content</div>
      </SmoothScroll>,
    );
    expect(mocks.ctor).toHaveBeenCalledTimes(1);
    const instance = mocks.instances[0] as { destroy: Mock };
    act(() => {
      setPreference(true);
    });
    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(mocks.ctor).toHaveBeenCalledTimes(1);
    act(() => {
      setPreference(false);
    });
    expect(mocks.ctor).toHaveBeenCalledTimes(2);
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
