import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchiveSearch } from "@/components/search/ArchiveSearch";
import { loadPagefind, type PagefindResult } from "@/lib/pagefind";

vi.mock("@/lib/pagefind", () => ({ loadPagefind: vi.fn() }));
const search = vi.fn();
const result: PagefindResult = {
  url: "/files/example",
  meta: { title: "Example" },
  excerpt: "Literal &lt;mark&gt; and <mark>match</mark>",
};

beforeEach(() => {
  search.mockReset().mockResolvedValue({ results: [] });
  vi.mocked(loadPagefind).mockReset().mockResolvedValue({ search });
});

async function renderSearch() {
  await act(async () => {
    render(<ArchiveSearch />);
  });
  return screen.getByRole("searchbox", { name: /search the archive/i });
}

describe("ArchiveSearch", () => {
  it("renders the search field", async () => {
    expect(await renderSearch()).toBeTruthy();
  });
  it("degrades when loading the index fails", async () => {
    vi.mocked(loadPagefind).mockRejectedValue(new Error("offline"));
    render(<ArchiveSearch />);
    expect(await screen.findByText(/Search is temporarily unavailable/i)).toBeTruthy();
  });
  it.each(["search", "fragment"])("degrades when the %s request fails", async (stage) => {
    if (stage === "search") search.mockRejectedValue(new Error("offline"));
    else
      search.mockResolvedValue({ results: [{ data: () => Promise.reject(new Error("offline")) }] });
    fireEvent.change(await renderSearch(), { target: { value: "match" } });
    expect(await screen.findByText(/Search is temporarily unavailable/i)).toBeTruthy();
  });
  it("preserves literal tags and renders only actual highlights", async () => {
    search.mockResolvedValue({ results: [{ data: async () => result }] });
    fireEvent.change(await renderSearch(), { target: { value: "match" } });
    const link = await screen.findByRole("link", { name: /Example/ });
    expect(link.textContent).toContain("Literal <mark> and match");
    expect(link.querySelectorAll("mark")).toHaveLength(1);
    expect(link.querySelector("mark")?.textContent).toBe("match");
  });
  it("ignores stale failures after a newer query succeeds", async () => {
    let rejectOld!: (error: Error) => void;
    search.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectOld = reject;
        }),
    );
    search.mockResolvedValue({ results: [{ data: async () => result }] });
    const input = await renderSearch();
    fireEvent.change(input, { target: { value: "old" } });
    fireEvent.change(input, { target: { value: "new" } });
    await screen.findByRole("link", { name: /Example/ });
    await act(async () => {
      rejectOld(new Error("late failure"));
    });
    expect(screen.queryByText(/Search is temporarily unavailable/i)).toBeNull();
  });
});
