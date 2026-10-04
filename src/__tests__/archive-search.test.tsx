import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
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
    render(
      <MemoryRouter>
        <VeilProvider>
          <ArchiveSearch />
        </VeilProvider>
      </MemoryRouter>,
    );
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
  it("survives a transient search-request failure without losing the input", async () => {
    // 一次瞬时拒绝（部署交换、断网一瞬间）只清空结果，搜索功能必须还活着：
    // 降级到 unavailable 通知是「索引加载失败」专属路径（见上一条用例）。
    search.mockRejectedValue(new Error("offline"));
    const input = await renderSearch();
    fireEvent.change(input, { target: { value: "match" } });
    // 防抖 → 请求 → 拒绝 → searching 指示器熄灭：输入框仍在、无结果列表、
    // 绝不降级到 unavailable（那是索引加载失败的专属路径）。
    await waitFor(() => expect(screen.queryByText(/searching/i)).toBeNull());
    expect(screen.getByRole("searchbox", { name: "Search the archive" })).toBeTruthy();
    expect(screen.queryByText(/Search is temporarily unavailable/i)).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("drops a single unreadable result without disabling search", async () => {
    search.mockResolvedValue({
      results: [{ data: async () => result }, { data: () => Promise.reject(new Error("bad")) }],
    });
    fireEvent.change(await renderSearch(), { target: { value: "match" } });
    expect(await screen.findByRole("link", { name: /Example/ })).toBeTruthy();
    expect(screen.queryByText(/Search is temporarily unavailable/i)).toBeNull();
  });
  it("shows a searching indicator and clears it when results land", async () => {
    let resolveSearch!: (value: {
      results: Array<{ data: () => Promise<PagefindResult> }>;
    }) => void;
    search.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );
    const input = await renderSearch();
    fireEvent.change(input, { target: { value: "match" } });
    // 300ms 防抖后才发起请求并亮出指示器
    expect(await screen.findByText(/Searching…/i)).toBeTruthy();
    await act(async () => {
      resolveSearch({ results: [{ data: async () => result }] });
    });
    expect(await screen.findByRole("link", { name: /Example/ })).toBeTruthy();
    expect(screen.queryByText(/Searching…/i)).toBeNull();
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
    // 等防抖放行 "old"，让第一次 search 挂起
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    fireEvent.change(input, { target: { value: "new" } });
    await screen.findByRole("link", { name: /Example/ });
    await act(async () => {
      rejectOld(new Error("late failure"));
    });
    expect(screen.queryByText(/Search is temporarily unavailable/i)).toBeNull();
  });
});
