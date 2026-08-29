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
