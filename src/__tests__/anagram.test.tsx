import { render, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnagramText } from "@/components/motion/AnagramText";

describe("AnagramText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
  });

  it("initial scramble is identical across two mounts of the same text", () => {
    const a = render(<AnagramText text="PYE HALL" />);
    const b = render(<AnagramText text="PYE HALL" />);
    const ta = a.container.textContent ?? "";
    const tb = b.container.textContent ?? "";
    expect(ta).toBe(tb);
    expect(ta).toMatch(/^[A-Z&#%? ]+$/);
    // sr-only 的真实文本始终可访问（限定在实例 a 的容器内查询，避免跨实例多匹配）
    expect(within(a.container).getByText("PYE HALL")).toBeInTheDocument();
  });

  it("推进假时钟后，可见层完整解析出真实文本", async () => {
    const { container } = render(<AnagramText text="PYE HALL" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800);
    });
    const visible = container.querySelector('[aria-hidden="true"]');
    expect(visible?.textContent).toBe("PYE HALL");
  });

  it("不同文本挂载的两个实例互不串扰", () => {
    const a = render(<AnagramText text="PYE HALL" />);
    const b = render(<AnagramText text="MAGPIE" />);
    const ta = a.container.textContent ?? "";
    const tb = b.container.textContent ?? "";
    expect(ta).not.toBe(tb);
  });
});
