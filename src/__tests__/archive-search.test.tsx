import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { ArchiveSearch } from "@/components/search/ArchiveSearch";

function renderSearch() {
  return render(
    <MemoryRouter>
      <WorldProvider>
        <ArchiveSearch />
      </WorldProvider>
    </MemoryRouter>,
  );
}

describe("ArchiveSearch", () => {
  it("renders the typewriter search field", () => {
    renderSearch();
    expect(screen.getByRole("searchbox", { name: /search the archive/i })).toBeTruthy();
  });

  it("degrades politely when the pagefind index is absent (dev/tests)", async () => {
    renderSearch();
    const notice = await screen.findByText(/Index unavailable in this printing/i);
    expect(notice).toBeTruthy();
  });
});
