import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import SeoLayout from "@/pages/SeoLayout";

function renderLayoutAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <VeilProvider>
        <Routes>
          <Route path="/" element={<SeoLayout />}>
            <Route index element={<p>cover body</p>} />
            <Route path="files" element={<p>archive body</p>} />
          </Route>
        </Routes>
      </VeilProvider>
    </MemoryRouter>,
  );
}

describe("SeoLayout", () => {
  it("wraps the outlet with the running head", () => {
    renderLayoutAt("/");
    expect(screen.getAllByText(/Orion Arch/).length).toBeGreaterThan(0);
    expect(screen.getByText("cover body")).toBeTruthy();
  });

  it("carries the site footer with in-world navigation", () => {
    renderLayoutAt("/files");
    expect(screen.getByText("archive body")).toBeTruthy();
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/files");
    expect(nav.getByRole("link", { name: "Articles" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Lab" })).toHaveAttribute("href", "/lab");
    expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("main")).toBeTruthy();
  });

  it("signs the footer as Orion Arch and links the feed", () => {
    renderLayoutAt("/");
    expect(screen.getAllByText(/Orion Arch/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /RSS/ }).getAttribute("href")).toBe("/rss.xml");
  });
});
