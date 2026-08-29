export type RssPost = {
  slug: string;
  title: string;
  summary: string;
  date: string;
};

export type RssSite = {
  url: string;
  title: string;
  description: string;
};

export function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Pure RSS 2.0 construction so the feed shape is unit-testable; the build
// pipeline (scripts/magpie-pipeline.ts) only picks the posts and writes the file.
export function buildRssXml(posts: RssPost[], site: RssSite): string {
  const items = posts.map((post) =>
    [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(`${site.url}/files/${post.slug}`)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(`${site.url}/files/${post.slug}`)}</guid>`,
      `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(post.summary)}</description>`,
      "    </item>",
    ].join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.title)}</title>`,
    `    <link>${escapeXml(site.url)}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <atom:link href="${escapeXml(`${site.url}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
