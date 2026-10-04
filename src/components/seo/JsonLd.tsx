// JSON-LD structured data. RRv7's meta() cannot emit <script> tags, so pages
// render this directly; search engines read it from the prerendered HTML and
// the tag is inert after hydration (application/ld+json never executes).
// "<" is escaped so author-controlled frontmatter (titles, tags) can never
// close the script element early. The noDangerouslySetInnerHtml override for
// this file lives in biome.json — the payload is always our own stringify.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
