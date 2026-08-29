import { escapeXml } from "./rss";

export type SitemapEntry = {
  path: string;
  lastmod: string;
};

// Pure sitemap construction; the pipeline (scripts/magpie-pipeline.ts) picks
// the same path set as the prerender manifest and writes the file.
export function buildSitemapXml(entries: SitemapEntry[], site: { url: string }): string {
  const urls = entries.map((entry) =>
    [
      "  <url>",
      `    <loc>${escapeXml(`${site.url}${entry.path}`)}</loc>`,
      `    <lastmod>${entry.lastmod}</lastmod>`,
      "  </url>",
    ].join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export function buildRobotsTxt(site: { url: string }): string {
  return ["User-agent: *", "Allow: /", "", `Sitemap: ${site.url}/sitemap.xml`, ""].join("\n");
}
