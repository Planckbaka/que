declare module "virtual:magpie-case-files" {
  export const publicComponents: Record<
    string,
    import("react").ComponentType<{ components?: import("*.mdx").MDXComponents }>
  >;
  export const publicArticles: Array<{
    slug: string;
    frontmatter: import("../lib/frontmatter").FileFrontmatter;
    readingTimeMinutes: number;
  }>;
  export const articleLoaders: Record<
    string,
    () => Promise<{
      default: import("react").ComponentType<{ components?: import("*.mdx").MDXComponents }>;
    }>
  >;
}
