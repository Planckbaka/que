// Site identity (spec D5). The origin is a placeholder until the P4 launch
// task pins the production domain; canonical/OG/RSS all derive from it.
export const site = {
  url: "https://themagpiefiles.pages.dev",
  title: "Orion Arch · Engineering Notes",
  author: "Orion Arch",
  github: "https://github.com/orionarch26",
  description:
    "Orion Arch’s personal blog — a Python and Go backend engineering blog by Orion Arch, covering APIs, concurrency, and AI infrastructure.",
  // giscus credentials (repo/repoId/category/categoryId) land at launch; until
  // then article pages show the "later printing" notice. Shape:
  // comments: { repo: "Planckbaka/que", repoId: "...", category: "Marginalia", categoryId: "..." },
  comments: undefined,
} as const;

// Shared OG/Twitter card meta for route `meta()` exports. Routes without a
// dedicated card fall back to the site card (build/client/og/index.png, a
// 1200×630 render by magpie-pipeline.ts).
export function socialMeta(input: {
  title: string;
  description: string;
  image?: string;
  path?: string;
  ogType?: "website" | "article";
}): Array<Record<string, string>> {
  const image = input.image ?? `${site.url}/og/index.png`;
  return [
    ...(input.path
      ? [
          {
            tagName: "link",
            rel: "canonical",
            href: `${site.url}${input.path}`,
          },
          { property: "og:url", content: `${site.url}${input.path}` },
        ]
      : []),
    { property: "og:type", content: input.ogType ?? "website" },
    { property: "og:title", content: input.title },
    { property: "og:site_name", content: site.title },
    { property: "og:description", content: input.description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: input.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: image },
  ];
}
