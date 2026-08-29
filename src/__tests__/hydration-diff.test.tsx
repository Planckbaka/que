// THROWAWAY diagnostic: diff prerendered /lab HTML vs client first render.
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import LabPage from "@/pages/LabPage";

describe("hydration diff /lab", () => {
  it("server output matches client first render", () => {
    const served = readFileSync("build/client/lab/index.html", "utf8");
    const rendered = renderToString(
      <MemoryRouter initialEntries={["/lab"]}>
        <WorldProvider>
          <VeilProvider>
            <LabPage />
          </VeilProvider>
        </WorldProvider>
      </MemoryRouter>,
    );
    const marker = '<div class="relative min-h-svh bg-background text-foreground">';
    const servedBody = served.slice(served.indexOf(marker));
    expect(servedBody.startsWith(marker)).toBe(true);
    let i = 0;
    const a = servedBody;
    const b = rendered;
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    console.log("DIVERGE at", i);
    console.log("SERVED :", JSON.stringify(a.slice(Math.max(0, i - 80), i + 120)));
    console.log("CLIENT :", JSON.stringify(b.slice(Math.max(0, i - 80), i + 120)));
  });
});
