import { describe, expect, it } from "vitest";
import { buildRssXml, type RssPost } from "@/lib/rss";

const site = {
  url: "https://themagpiefiles.pages.dev",
  title: "The Magpie Files",
  description: "Engineering notes and algorithm case files.",
};

const posts: RssPost[] = [
  {
    slug: "the-case-of-the-blazing-build",
    title: "The Case of the Blazing Build",
    summary: "Evidence & testimony <encoded> in one feed",
    date: "2026-08-21",
  },
  {
    slug: "one-for-sorrow",
    title: "One for Sorrow, Attention Is a Witness",
    summary: "Nine witnesses, one verdict.",
    date: "2026-08-02",
  },
];

describe("buildRssXml", () => {
  it("emits an RSS 2.0 channel for the site", () => {
    const xml = buildRssXml(posts, site);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<title>${site.title}</title>`);
    expect(xml).toContain(`<link>${site.url}</link>`);
  });

  it("emits one item per post with link, guid and pubDate", () => {
    const xml = buildRssXml(posts, site);
    expect(xml.match(/<item>/g)).toHaveLength(posts.length);
    expect(xml).toContain(`<link>${site.url}/files/the-case-of-the-blazing-build</link>`);
    expect(xml).toContain('guid isPermaLink="true"');
    expect(xml).toContain(new Date("2026-08-21").toUTCString());
  });

  it("escapes XML-sensitive characters in text fields", () => {
    const xml = buildRssXml(posts, site);
    expect(xml).toContain("Evidence &amp; testimony &lt;encoded&gt; in one feed");
    expect(xml).not.toContain("<encoded>");
  });
});
