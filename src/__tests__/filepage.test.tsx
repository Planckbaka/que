import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeAll, describe, expect, it } from "vitest";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { articles, getArticle, publishedArticles } from "@/lib/content";
import FilePage, { loader, meta } from "@/pages/FilePage";

function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/files/${slug}`]}>
      <WorldProvider>
        <Routes>
          <Route path="/files/:slug" element={<FilePage />} />
        </Routes>
      </WorldProvider>
    </MemoryRouter>,
  );
}

describe("content collection", () => {
  it("collects every case file with validated frontmatter", () => {
    expect(articles).toHaveLength(9);
    const blazing = getArticle("the-case-of-the-blazing-build");
    expect(blazing?.frontmatter.world).toBe("red");
    expect(blazing?.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("orders articles newest first", () => {
    const dates = articles.map((a) => a.frontmatter.date);
    const sorted = [...dates].sort((a, b) => Date.parse(b) - Date.parse(a));
    expect(dates).toEqual(sorted);
  });

  it("excludes drafts from the published shelf", () => {
    expect(publishedArticles).toHaveLength(9);
    expect(publishedArticles.some((a) => a.frontmatter.draft)).toBe(false);
    expect(getArticle("sealed-testimony-of-the-overfitted-witness")).toBeUndefined();
    const tags = meta({ params: { slug: "sealed-testimony-of-the-overfitted-witness" } });
    expect(tags).toContainEqual({ name: "robots", content: "noindex, follow" });
  });
});

describe("FilePage", () => {
  beforeAll(() => loader({ params: { slug: "the-case-of-the-blazing-build" } }));
  it("renders kicker, title and highlighted body for a published case", async () => {
    renderAtSlug("the-case-of-the-blazing-build");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The Case of the Blazing Build",
    );
    expect(screen.getAllByText(/Docket 2026-081/).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(document.querySelectorAll("pre.shiki").length).toBeGreaterThanOrEqual(2),
    );
  });

  it("mounts the reading folio at one page per reading minute", () => {
    renderAtSlug("the-case-of-the-blazing-build");
    expect(screen.getByText("Folio 01 ∕ 03")).toBeTruthy();
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar.getAttribute("aria-valuemax")).toBe("3");
  });

  it("stamps the article's chapter numeral behind the folio", () => {
    renderAtSlug("the-case-of-the-blazing-build");
    const numerals = document.querySelectorAll("span.text-outline");
    expect([...numerals].some((el) => el.textContent === "VII")).toBe(true);
  });

  it("shows the sealed notice for draft case files", () => {
    renderAtSlug("sealed-testimony-of-the-overfitted-witness");
    expect(screen.getByText(/Page not found/i)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Page not found");
  });

  it("shows the sealed notice for unknown slugs", () => {
    renderAtSlug("the-case-that-never-was");
    expect(screen.getByText(/Page not found/i)).toBeTruthy();
  });

  it("exposes og:image and canonical through meta", () => {
    const tags = meta({ params: { slug: "the-case-of-the-blazing-build" } });
    const ogImage = tags.find((tag) => "property" in tag && tag.property === "og:image");
    expect(ogImage).toBeTruthy();
    expect(ogImage?.content).toContain("/og/the-case-of-the-blazing-build.png");
    const canonical = tags.find((tag) => "rel" in tag && tag.rel === "canonical");
    expect(canonical?.href).toContain("/files/the-case-of-the-blazing-build");
  });
});
