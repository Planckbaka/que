import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HalftoneReveal } from "@/components/magpie/HalftoneReveal";

describe("HalftoneReveal", () => {
  it("img carries alt text and lazy loading", () => {
    render(<HalftoneReveal src="/images/clue.png" alt="A magnified clue" />);
    const img = screen.getByRole("img", { name: "A magnified clue" });
    expect(img).toHaveAttribute("alt", "A magnified clue");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders an aria-hidden halftone overlay", () => {
    const { container } = render(<HalftoneReveal src="/images/clue.png" alt="A magnified clue" />);
    const overlay = container.querySelector("span.halftone");
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveAttribute("aria-hidden", "true");
  });
});
