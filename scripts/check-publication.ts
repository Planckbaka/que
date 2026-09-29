import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { scanArticles } from "../src/lib/content-index.ts";

// Fixed routes registered in app/routes.ts: /, /files, /lab, /about.
const FIXED_ROUTE_COUNT = 4;

const root = resolve("build/client");
const articles = await scanArticles(resolve("content/files"));
const published = articles.filter((article) => !article.frontmatter.draft);
const files = await readdir(root, { recursive: true });
const textFiles = files.filter((file) => /\.(js|html|xml|json)$/.test(file));
for (const file of textFiles) {
  const text = await readFile(resolve(root, file), "utf8");
  for (const draft of articles.filter((article) => article.frontmatter.draft)) {
    assert(!text.includes(draft.slug), `Draft slug leaked into ${file}`);
    assert(!text.includes(draft.frontmatter.title), `Draft title leaked into ${file}`);
  }
}

// Every /images/... URL reachable from shipped HTML must exist in the build —
// catches hand-maintained srcSet entries whose WebP derivatives were never
// generated (cwebp is manual; see docs/optimization-2026-09-05.md).
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const imageRefs = new Set<string>();
for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), "utf8");
  for (const match of html.matchAll(/\/images\/[\w./-]+/g)) {
    imageRefs.add(match[0]);
  }
}
assert(imageRefs.size > 0, "No image references found in prerendered HTML");
for (const ref of imageRefs) {
  const asset = resolve(root, ref.replace(/^\//, ""));
  const exists = await stat(asset)
    .then(() => true)
    .catch(() => false);
  assert(exists, `Referenced image missing from build: ${ref}`);
}

for (const article of published) {
  const html = await readFile(resolve(root, "files", article.slug, "index.html"), "utf8");
  assert(!html.includes("Loading article"), `Streamed fallback left in ${article.slug}`);
  assert(/<h2[^>]* id="/.test(html), `Missing anchors in ${article.slug}`);
  assert(html.includes('rel="canonical"'), `Missing canonical in ${article.slug}`);
  const ogCard = resolve(root, "og", `${article.slug}.png`);
  const hasOg = await stat(ogCard)
    .then(() => true)
    .catch(() => false);
  assert(hasOg, `Missing OG card for ${article.slug}`);
}

// Artifact counts must mirror the published shelf: RSS items, sitemap
// locations (fixed routes + articles) and OG cards track scanArticles().
const rss = await readFile(resolve(root, "rss.xml"), "utf8");
const rssItems = [...rss.matchAll(/<item>/g)].length;
assert.equal(rssItems, published.length, "RSS item count != published article count");

const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
const sitemapLocs = [...sitemap.matchAll(/<loc>/g)].length;
assert.equal(
  sitemapLocs,
  published.length + FIXED_ROUTE_COUNT,
  "Sitemap loc count != published articles + fixed routes",
);

const prerendered = files.filter((file) => /^files\/[\w-]+\/index\.html$/.test(file));
assert.equal(
  prerendered.length,
  published.length,
  "Prerendered article count != published article count",
);

console.log(
  `Publication check passed: drafts excluded, ${published.length} articles resolved, ${imageRefs.size} image refs verified.`,
);
