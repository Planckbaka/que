import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { articleComponents } from "@/components/mdx/article-components";
import { scanArticles } from "@/lib/content-index";
import GradientCase, {
  frontmatter as gradientFrontmatter,
} from "../../content/files/the-case-of-the-vanishing-gradient.mdx";

const CONTENT_DIR = resolve(process.cwd(), "content/files");

describe("seed case files", () => {
  it("parses all three seeds through the build-side scanner", async () => {
    const articles = await scanArticles(CONTENT_DIR);
    expect(articles.map((a) => a.slug)).toEqual([
      "the-case-of-the-blazing-build",
      "one-for-sorrow-attention-is-a-witness",
      "the-case-of-the-vanishing-gradient",
    ]);
  });

  it("covers both worlds across the seeds", async () => {
    const articles = await scanArticles(CONTENT_DIR);
    const worlds = new Set(articles.map((a) => a.frontmatter.world));
    expect(worlds.has("red")).toBe(true);
    expect(worlds.has("black")).toBe(true);
  });

  it("keeps reading time positive", async () => {
    const articles = await scanArticles(CONTENT_DIR);
    for (const article of articles) {
      expect(article.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("mdx pipeline", () => {
  it("compiles a seeded case file with exported frontmatter", () => {
    expect(typeof GradientCase).toBe("function");
    expect(gradientFrontmatter.title).toBe("The Case of the Vanishing Gradient");
  });

  it("renders shiki-highlighted code blocks at compile time", () => {
    const { container } = render(<GradientCase components={articleComponents} />);
    const blocks = container.querySelectorAll("pre.shiki");
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const preStyle = blocks[0]?.getAttribute("style") ?? "";
    expect(preStyle).toContain("--shiki-dark:");
  });

  it("resolves the mdx vocabulary inside article bodies", () => {
    const { container } = render(<GradientCase components={articleComponents} />);
    expect(container.querySelectorAll("span[title]").length).toBeGreaterThan(0);
  });
});
