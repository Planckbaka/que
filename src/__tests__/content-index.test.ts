import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { scanArticles } from "@/lib/content-index";

const FRONTMATTER = [
  "---",
  "title: The Case of the Vanishing Gradient",
  "kicker: Algorithm Files · Case No. 017",
  "world: black",
  "tags: [deep-learning]",
  "summary: A detective story about a loss that refused to leave a trace.",
  "date: 2026-08-29",
  "---",
].join("\n");

async function makeContentDir(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "magpie-content-"));
  await Promise.all(
    Object.entries(files).map(([name, text]) => writeFile(join(dir, name), text, "utf8")),
  );
  return dir;
}

describe("scanArticles", () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
  });

  it("parses, validates and measures the body", async () => {
    const dir = await makeContentDir({
      "the-case-of-x.mdx": `${FRONTMATTER}\nChain rule testimony follows. ${"word ".repeat(80)}`,
    });
    dirs.push(dir);
    const [article] = await scanArticles(dir);
    expect(article.slug).toBe("the-case-of-x");
    expect(article.frontmatter.title).toBe("The Case of the Vanishing Gradient");
    expect(article.frontmatter.world).toBe("black");
    expect(article.readingTimeMinutes).toBeGreaterThan(0);
    expect(article.body).toContain("Chain rule testimony");
  });

  it("throws with the offending filename for invalid frontmatter", async () => {
    const dir = await makeContentDir({
      "broken.mdx": "---\ntitle: Missing Everything Else\n---\nBody.",
    });
    dirs.push(dir);
    await expect(scanArticles(dir)).rejects.toThrow(/broken\.mdx/);
  });

  it("sorts newest first", async () => {
    const dir = await makeContentDir({
      "older.mdx": `${FRONTMATTER.replace("2026-08-29", "2026-01-01")}\nBody.`,
      "newer.mdx": `${FRONTMATTER}\nBody.`,
    });
    dirs.push(dir);
    const articles = await scanArticles(dir);
    expect(articles[0]?.slug).toBe("newer");
    expect(articles[1]?.slug).toBe("older");
  });

  it("ignores non-mdx entries", async () => {
    const dir = await makeContentDir({
      "the-case-of-x.mdx": `${FRONTMATTER}\nBody.`,
      "scratch.txt": "not a case file",
    });
    dirs.push(dir);
    const articles = await scanArticles(dir);
    expect(articles).toHaveLength(1);
    expect(articles[0]?.slug).toBe("the-case-of-x");
  });
});
