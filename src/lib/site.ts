// Site identity (spec D5). The origin is a placeholder until the P4 launch
// task pins the production domain; canonical/OG/RSS all derive from it.
export const site = {
  url: "https://themagpiefiles.pages.dev",
  title: "The Magpie Files",
  author: "Orion Arch",
  description: "The Magpie Files — engineering notes and algorithm case files by Orion Arch.",
  // giscus credentials (repo/repoId/category/categoryId) land at launch; until
  // then article pages show the "later printing" notice. Shape:
  // comments: { repo: "Planckbaka/que", repoId: "...", category: "Marginalia", categoryId: "..." },
  comments: undefined,
} as const;

// Shared OG/Twitter card meta for route `meta()` exports. Routes without a
// dedicated card fall back to the site card (build/client/og/index.png).
export function socialMeta(input: {
  title: string;
  description: string;
  image?: string;
}): Array<Record<string, string>> {
  const image = input.image ?? `${site.url}/og/index.png`;
  return [
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: image },
  ];
}
