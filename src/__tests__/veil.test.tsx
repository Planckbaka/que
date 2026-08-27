// src/__tests__/veil.test.tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LinkUnderVeil, VeilOverlay, VeilProvider } from "@/components/motion/Veil";

let awayMounts = 0;

function Home() {
  return (
    <main>
      <h1>Home</h1>
      <LinkUnderVeil to="/away">Go away</LinkUnderVeil>
    </main>
  );
}

function Away() {
  useEffect(() => {
    awayMounts += 1;
  }, []);
  return <h1>Away</h1>;
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

describe("Veil", () => {
  beforeEach(() => {
    awayMounts = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
  });

  it("点击后盖下并完成导航，随后揭开", async () => {
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
  });

  it("双击防重入：目标页只挂载一次", async () => {
    renderApp();
    const link = screen.getByText("Go away");
    await act(async () => {
      fireEvent.click(link);
      fireEvent.click(link); // busy 窗口内的第二次点击被丢弃
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(screen.getByText("Away")).toBeInTheDocument();
    expect(awayMounts).toBe(1);
  });
});
