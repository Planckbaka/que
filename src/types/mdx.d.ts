declare module "*.mdx" {
  import type { ComponentType } from "react";

  export type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>;

  export const frontmatter: Record<string, unknown>;

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}
