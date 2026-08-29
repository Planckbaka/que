import type { MDXComponents } from "*.mdx";
import { caseFileReadingTime } from "virtual:magpie-case-files";
import type { ComponentType } from "react";
import {
  compareNewestFirst,
  type FileFrontmatter,
  FileFrontmatterSchema,
  slugFromFile,
} from "./frontmatter";

export type Article = {
  slug: string;
  frontmatter: FileFrontmatter;
  Component: ComponentType<{ components?: MDXComponents }>;
  readingTimeMinutes: number;
};

// Client-side content collection. Runs inside the Vite pipeline (prerender
// render pass AND the browser bundle), so schema violations fail the build
// here as well as in the Node-side scanner (src/lib/content-index.ts), which
// also feeds this module its reading times through the virtual module below.
const compiled = import.meta.glob<{
  default: ComponentType<{ components?: MDXComponents }>;
  frontmatter: Record<string, unknown>;
}>("../../content/files/*.mdx", { eager: true });

const collected: Article[] = Object.entries(compiled).map(([path, mod]) => {
  const slug = slugFromFile(path.split("/").pop() ?? "");
  const readingTimeMinutes = caseFileReadingTime[slug];
  if (readingTimeMinutes === undefined) {
    throw new Error(`no reading time found for case file: ${slug}`);
  }
  return {
    slug,
    frontmatter: FileFrontmatterSchema.parse(mod.frontmatter),
    Component: mod.default,
    readingTimeMinutes,
  };
});

export const articles: Article[] = collected.sort(compareNewestFirst);

export const publishedArticles: Article[] = articles.filter(
  (article) => !article.frontmatter.draft,
);

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
