// src/__tests__/veil.test.tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LinkUnderVeil, VeilOverlay, VeilProvider } from "@/components/motion/Veil";

const navigateSpy = vi.hoisted(() => vi.fn());

// 部分模拟：只拦截 useNavigate，其余导出（MemoryRouter/Route/Routes/Link）保持 react-router 原样。
// spy 包装真实 navigate——导航仍真实发生（/away 真的切换），同时以调用次数判别 busy 守卫与
// reduced-motion 短路（旧口径用"目标页挂载次数"间接推断，无法区分 navigate 从未被调用）。
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => {
      const navigate = actual.useNavigate();
      return (...args: Parameters<typeof navigate>) => {
        navigateSpy(...args);
        navigate(...args);
      };
    },
  };
});

function Home() {
  return (
    <main>
      <h1>Home</h1>
      <LinkUnderVeil to="/away">Go away</LinkUnderVeil>
    </main>
  );
}

function Away() {
  return (
    <main>
      <h1>Away</h1>
    </main>
  );
}

function Article() {
  return (
    <main>
      <h1>Article</h1>
      <LinkUnderVeil to="/files/two">Next article</LinkUnderVeil>
    </main>
  );
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <VeilProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/away" element={<Away />} />
        </Routes>
        <VeilOverlay />
      </VeilProvider>
    </MemoryRouter>,
  );
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("Veil", () => {
  beforeEach(() => {
    navigateSpy.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根
  });

  it("respects navigation cancelled by the caller", async () => {
    render(
      <MemoryRouter>
        <VeilProvider>
          <LinkUnderVeil to="/away" onClick={(event) => event.preventDefault()}>
            Cancel
          </LinkUnderVeil>
        </VeilProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Cancel"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("preserves new-window link behavior", async () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <VeilProvider>
          <LinkUnderVeil to="/away" target="_blank" onClick={onClick}>
            New window
          </LinkUnderVeil>
        </VeilProvider>
      </MemoryRouter>,
    );
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      screen.getByText("New window").dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("cancels pending navigation when the provider unmounts", async () => {
    const view = renderApp();
    fireEvent.click(screen.getByText("Go away"));
    view.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("点击后盖下并完成导航，随后揭开，焦点移交新页标题", async () => {
    renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Go away"));
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(screen.getByText("Away")).toBeInTheDocument();
    expect(document.querySelector('[data-veil][data-covering="true"]')).not.toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(document.querySelector('[data-veil][data-covering="false"]')).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Away" }));
  });

  it("文章→文章走短遮幅（300ms 内完成导航），焦点同样移交", async () => {
    render(
      <MemoryRouter initialEntries={["/files/one"]}>
        <VeilProvider>
          <Routes>
            <Route path="/files/:slug" element={<Article />} />
            <Route path="/away" element={<Away />} />
          </Routes>
          <VeilOverlay />
        </VeilProvider>
      </MemoryRouter>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Next article"));
      // 350ms：300ms 阅读遮幅已盖下并导航（550ms 口径此时还没盖完），尚未揭完
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByRole("heading", { name: "Article" })).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith("/files/two");
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Article" }));
  });

  it("双击防重入：busy 窗口内的第二次 travel 不产生第二次 navigate", async () => {
    renderApp();
    const link = screen.getByText("Go away");
    await act(async () => {
      fireEvent.click(link);
      fireEvent.click(link); // busy 窗口内的第二次点击被丢弃
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(screen.getByText("Away")).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith("/away");
  });

  it("修饰键点击不劫持：页面停留在 Home", async () => {
    renderApp();
    const link = screen.getByText("Go away");
    await act(async () => {
      fireEvent.click(link, { metaKey: true });
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Away")).toBeNull();
    expect(document.querySelector('[data-veil][data-covering="true"]')).toBeNull();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("reduced-motion：travel 跳过遮幅直接导航，无 covering 阶段", async () => {
    stubMatchMedia(true);
    renderApp();
    await act(async () => {
      fireEvent.click(screen.getByText("Go away"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("Away")).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith("/away");
    expect(document.querySelector('[data-veil][data-covering="true"]')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Away" }));
  });
});
