import type { ThemeRegistrationRaw } from "shiki";
import { describe, expect, it } from "vitest";
import { inkTheme, paperTheme } from "@/lib/code-themes";

// Palette law (SKILL.md §2): ink/paper/paper-dim at any alpha, the two stamp
// reds, or transparent. Nothing else may appear inside the Shiki themes.
const BASE_COLORS = new Set(["#f3eee3", "#e7dfcc", "#17120c", "#c8281e", "#e03a24"]);
const ALPHA_BASES = new Set(["#17120c", "#f3eee3", "#e7dfcc"]);

function isAllowed(color: string): boolean {
  if (color === "transparent") return true;
  if (BASE_COLORS.has(color)) return true;
  if (!color.startsWith("#") || color.length !== 9) return false;
  const base = color.slice(0, 7);
  const alpha = color.slice(7);
  return /^[0-9a-f]{2}$/.test(alpha) && ALPHA_BASES.has(base);
}

function collectColors(theme: ThemeRegistrationRaw): string[] {
  const colors: string[] = [];
  for (const entry of theme.settings) {
    if (entry.settings.foreground) colors.push(entry.settings.foreground.toLowerCase());
    if (entry.settings.background) colors.push(entry.settings.background.toLowerCase());
  }
  for (const value of Object.values(theme.colors ?? {})) {
    colors.push(value.toLowerCase());
  }
  return colors;
}

describe("code theme palette law", () => {
  it("paper theme uses only the three-color palette", () => {
    const offenders = collectColors(paperTheme).filter((color) => !isAllowed(color));
    expect(offenders).toEqual([]);
  });

  it("ink theme uses only the three-color palette", () => {
    const offenders = collectColors(inkTheme).filter((color) => !isAllowed(color));
    expect(offenders).toEqual([]);
  });

  it("declares one theme per world", () => {
    expect(paperTheme.name).toBe("magpie-paper");
    expect(paperTheme.type).toBe("light");
    expect(inkTheme.name).toBe("magpie-ink");
    expect(inkTheme.type).toBe("dark");
  });

  it("keeps code blocks transparent to the world background", () => {
    expect(paperTheme.colors?.["editor.background"]).toBe("transparent");
    expect(inkTheme.colors?.["editor.background"]).toBe("transparent");
  });
});
