import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import AboutPage from "@/pages/AboutPage";

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={["/about"]}>
      <WorldProvider>
        <VeilProvider>
          <AboutPage />
        </VeilProvider>
      </WorldProvider>
    </MemoryRouter>,
  );
}

describe("AboutPage (Colophon)", () => {
  it("carries the colophon masthead", () => {
    renderAbout();
    expect(screen.getAllByText(/COLOPHON/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Notes on the Edition/i);
  });

  it("signs the edition to Orion Arch", () => {
    renderAbout();
    const mentions = screen.getAllByText(/Orion Arch/);
    expect(mentions.length).toBeGreaterThan(0);
    expect(screen.getByText(/Backend engineer/i)).toBeTruthy();
  });

  it("records the edition details in the colophon table", () => {
    renderAbout();
    expect(screen.getByText(/Set in/i)).toBeTruthy();
    expect(screen.getByText(/Anton · Crimson Pro · Courier Prime/)).toBeTruthy();
    expect(screen.getByText(/Printed in three inks/i)).toBeTruthy();
    expect(screen.getByText(/Motion engine/i)).toBeTruthy();
  });

  it("links the feed and the archive", () => {
    renderAbout();
    expect(screen.getByRole("link", { name: /RSS/i }).getAttribute("href")).toBe("/rss.xml");
    expect(screen.getByRole("link", { name: /Open the archive/i }).getAttribute("href")).toBe(
      "/files",
    );
  });
});
