import type { MDXComponents } from "*.mdx";
import { articleLoaders, publicArticles, publicComponents } from "virtual:magpie-case-files";
import { type ComponentType, createElement } from "react";
import type { FileFrontmatter } from "./frontmatter";

export type Article = {
  slug: string;
  frontmatter: FileFrontmatter;
  Component: ComponentType<{ components?: MDXComponents }>;
  readingTimeMinutes: number;
};

// The build-side scanner validates and excludes drafts before creating imports.
// Client route loading requests only the selected body; prerender uses server-only imports.
const loaded = new Map<string, Article["Component"]>(Object.entries(publicComponents));
export async function preloadArticle(slug: string) {
  if (!Object.hasOwn(articleLoaders, slug)) return;
  const load = articleLoaders[slug];
  if (load && !loaded.has(slug)) loaded.set(slug, (await load()).default);
}
export const publishedArticles: Article[] = publicArticles.map((article) => {
  return {
    ...article,
    Component: (props) => {
      const Body = loaded.get(article.slug);
      if (!Body) throw new Error(`Article body was not loaded: ${article.slug}`);
      return createElement(Body, props);
    },
  };
});

export function getArticle(slug: string): Article | undefined {
  return publishedArticles.find((article) => article.slug === slug);
}

export function groupByWorld(shelf: Article[]): Record<"red" | "black", Article[]> {
  return {
    red: shelf.filter((article) => article.frontmatter.world === "red"),
    black: shelf.filter((article) => article.frontmatter.world === "black"),
  };
}
