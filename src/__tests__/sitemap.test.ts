import { describe, expect, it } from "vitest";
import { buildRobotsTxt, buildSitemapXml, type SitemapEntry } from "@/lib/sitemap";

const site = {
  url: "https://themagpiefiles.pages.dev",
  title: "The Magpie Files",
  description: "Engineering notes and algorithm case files.",
};

const entries: SitemapEntry[] = [
  { path: "/", lastmod: "2026-08-29" },
  { path: "/files", lastmod: "2026-08-29" },
  { path: "/files/the-case-of-the-blazing-build", lastmod: "2026-08-21" },
];

describe("buildSitemapXml", () => {
  it("emits one url per entry with the site origin", () => {
    const xml = buildSitemapXml(entries, site);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain(`<loc>${site.url}/files/the-case-of-the-blazing-build</loc>`);
    expect(xml.match(/<url>/g)).toHaveLength(entries.length);
  });

  it("carves lastmod dates from the article dates", () => {
    const xml = buildSitemapXml(entries, site);
    expect(xml).toContain("<lastmod>2026-08-21</lastmod>");
  });

  it("escapes xml-sensitive characters in paths", () => {
    const xml = buildSitemapXml([{ path: "/files/a&b", lastmod: "2026-01-01" }], site);
    expect(xml).toContain("/files/a&amp;b");
  });
});

describe("buildRobotsTxt", () => {
  it("allows all crawlers and points at the sitemap", () => {
    const txt = buildRobotsTxt(site);
    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Allow: /");
    expect(txt).toContain(`Sitemap: ${site.url}/sitemap.xml`);
  });
});
