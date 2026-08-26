import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnagramText } from "@/components/motion/AnagramText";
import { TypewriterText } from "@/components/motion/TypewriterText";

describe("AnagramText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves scrambled letters into the real text", () => {
    const { container } = render(<AnagramText text="PYE HALL" delay={100} beat={50} />);
    act(() => {
      vi.advanceTimersByTime(100 + 8 * 50 + 200);
    });
    expect(container).toHaveTextContent("PYE HALL");
  });
});

describe("TypewriterText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("types the full text eventually", () => {
    const { container } = render(
      <TypewriterText text="EXHIBIT A-113" speed={20} startDelay={50} />,
    );
    act(() => {
      vi.advanceTimersByTime(50 + 14 * 20 + 200);
    });
    expect(container).toHaveTextContent("EXHIBIT A-113");
  });
});
