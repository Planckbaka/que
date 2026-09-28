import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { scanArticles } from "../src/lib/content-index.ts";

const root = resolve("build/client");
const articles = await scanArticles(resolve("content/files"));
const files = await readdir(root, { recursive: true });
const textFiles = files.filter((file) => /\.(js|html|xml|json)$/.test(file));
for (const file of textFiles) {
  const text = await readFile(resolve(root, file), "utf8");
  for (const draft of articles.filter((article) => article.frontmatter.draft)) {
    assert(!text.includes(draft.slug), `Draft slug leaked into ${file}`);
    assert(!text.includes(draft.frontmatter.title), `Draft title leaked into ${file}`);
  }
}
for (const article of articles.filter((entry) => !entry.frontmatter.draft)) {
  const html = await readFile(resolve(root, "files", article.slug, "index.html"), "utf8");
  assert(!html.includes("Loading article"), `Streamed fallback left in ${article.slug}`);
  assert(/<h2[^>]* id="/.test(html), `Missing anchors in ${article.slug}`);
  assert(html.includes('rel="canonical"'), `Missing canonical in ${article.slug}`);
}
console.log("Publication check passed: drafts excluded, article HTML resolved.");
