declare module "*.mdx" {
  import type { ComponentType } from "react";

  // MDX components receive arbitrary JSX props; concrete article vocabulary
  // components (typed props + children) assign into this via contravariance.
  export type MDXComponents = Record<string, ComponentType<never>>;

  export const frontmatter: Record<string, unknown>;

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}
