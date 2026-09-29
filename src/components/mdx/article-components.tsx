import type { MDXComponents } from "*.mdx";
import type { ComponentPropsWithoutRef } from "react";
import { ClueChip } from "@/components/magpie/ClueChip";
import { ExhibitCard } from "@/components/magpie/ExhibitCard";
import { HalftoneImage } from "@/components/magpie/HalftoneImage";
import { Redacted } from "@/components/magpie/Redacted";
import { ArticleFigure } from "./ArticleFigure";

function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <figure className="min-w-0">
      <figcaption className="font-machine text-[10px] uppercase tracking-[0.1em]">
        Code / Scroll horizontally to read long lines
      </figcaption>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex lint/a11y/useSemanticElements: preserve preformatted text while exposing a named keyboard-scrollable region. */}
      <pre {...props} tabIndex={0} role="region" aria-label="Code example" />
    </figure>
  );
}

// MDX writing vocabulary (spec §4.3). Injected through the `components` prop
// wherever case-file content renders, so articles never import directly.
export const articleComponents: MDXComponents = {
  pre: CodeBlock,
  Redacted,
  ClueChip,
  HalftoneImage,
  ExhibitCard,
  ArticleFigure,
};
