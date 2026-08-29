import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { groupByWorld, publishedArticles } from "@/lib/content";
import FilesPage from "@/pages/FilesPage";

describe("groupByWorld", () => {
  it("splits the published shelf into world tracks, newest first", () => {
    const grouped = groupByWorld(publishedArticles);
    expect(grouped.red.map((a) => a.slug)).toEqual(["the-case-of-the-blazing-build"]);
    expect(grouped.black.map((a) => a.slug)).toEqual([
      "one-for-sorrow-attention-is-a-witness",
      "the-case-of-the-vanishing-gradient",
    ]);
  });
});

function renderFilesPage() {
  return render(
    <MemoryRouter initialEntries={["/files"]}>
      <WorldProvider>
        <VeilProvider>
          <FilesPage />
        </VeilProvider>
      </WorldProvider>
    </MemoryRouter>,
  );
}

describe("FilesPage", () => {
  it("lists every published case and hides drafts", () => {
    renderFilesPage();
    for (const name of [
      /the case of the blazing build/i,
      /attention is a witness/i,
      /the case of the vanishing gradient/i,
    ]) {
      expect(screen.getByRole("link", { name })).toBeTruthy();
    }
    expect(screen.queryByRole("link", { name: /overfitted witness/i })).toBeNull();
  });

  it("orders world tracks with the active world first", () => {
    const { container } = renderFilesPage();
    const headings = [...container.querySelectorAll("h2")];
    const redIndex = headings.findIndex((el) => el.textContent?.includes("Engineering Notes"));
    const blackIndex = headings.findIndex((el) => el.textContent?.includes("Algorithm Files"));
    expect(redIndex).toBeGreaterThan(-1);
    expect(blackIndex).toBeGreaterThan(-1);
    expect(redIndex).toBeLessThan(blackIndex);
  });

  it("shows the running head and archive kicker", () => {
    renderFilesPage();
    expect(screen.getAllByText(/THE ARCHIVE/i).length).toBeGreaterThan(0);
  });
});
