import { describe, expect, it } from "vitest";
import { stripModulePreloads } from "../../scripts/strip-preloads";

describe("stripModulePreloads", () => {
  it("removes every modulepreload link", () => {
    const html = [
      "<head>",
      '<link rel="modulepreload" href="/assets/manifest.js"/>',
      '<link rel="stylesheet" href="/assets/root.css"/>',
      '<link rel="modulepreload" href="/assets/react.js"/>',
      "</head>",
    ].join("");
    const out = stripModulePreloads(html);
    expect(out).not.toContain("modulepreload");
    expect(out).toContain("stylesheet");
    expect(out).toContain("<head></head>".slice(0, 6));
  });

  it("leaves html without preloads untouched", () => {
    const html = "<html><head><title>x</title></head></html>";
    expect(stripModulePreloads(html)).toBe(html);
  });
});
