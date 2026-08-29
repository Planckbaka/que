import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChapterNumeral } from "@/components/motion/ChapterNumeral";
import { ReadingFolio } from "@/components/motion/ReadingFolio";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { folioPage, romanNumeral } from "@/lib/motion";

describe("folioPage", () => {
  it("maps progress to page numbers", () => {
    expect(folioPage(0, 12)).toBe(1);
    expect(folioPage(1, 12)).toBe(12);
    expect(folioPage(0.5, 12)).toBe(7);
  });

  it("clamps out-of-range progress", () => {
    expect(folioPage(-1, 12)).toBe(1);
    expect(folioPage(2, 12)).toBe(12);
  });

  it("survives a degenerate total", () => {
    expect(folioPage(0.4, 0)).toBe(1);
    expect(folioPage(0.4, -3)).toBe(1);
  });
});

describe("romanNumeral", () => {
  it("renders standard roman numerals", () => {
    expect(romanNumeral(1)).toBe("I");
    expect(romanNumeral(4)).toBe("IV");
    expect(romanNumeral(9)).toBe("IX");
    expect(romanNumeral(14)).toBe("XIV");
    expect(romanNumeral(40)).toBe("XL");
    expect(romanNumeral(90)).toBe("XC");
    expect(romanNumeral(400)).toBe("CD");
    expect(romanNumeral(2026)).toBe("MMXXVI");
  });

  it("falls back to I for non-positive input", () => {
    expect(romanNumeral(0)).toBe("I");
    expect(romanNumeral(-5)).toBe("I");
  });
});

describe("ReadingFolio", () => {
  it("prints the current folio range and exposes it to assistive tech", () => {
    render(
      <WorldProvider>
        <ReadingFolio total={12} />
      </WorldProvider>,
    );
    expect(screen.getByText("Folio 01 ∕ 12")).toBeTruthy();
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("12");
  });

  it("pads single digits", () => {
    render(
      <WorldProvider>
        <ReadingFolio total={9} />
      </WorldProvider>,
    );
    expect(screen.getByText("Folio 01 ∕ 09")).toBeTruthy();
  });
});

describe("ChapterNumeral", () => {
  it("renders a hidden decorative outlined numeral", () => {
    const { container } = render(
      <WorldProvider>
        <div className="relative">
          <ChapterNumeral numeral="XVII" />
        </div>
      </WorldProvider>,
    );
    const numeral = container.querySelector("span");
    expect(numeral?.getAttribute("aria-hidden")).toBe("true");
    expect(numeral?.className).toContain("text-outline");
    expect(numeral?.textContent).toBe("XVII");
  });
});
