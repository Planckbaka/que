import type { MDXComponents } from "*.mdx";
import { ClueChip } from "@/components/magpie/ClueChip";
import { ExhibitCard } from "@/components/magpie/ExhibitCard";
import { HalftoneImage } from "@/components/magpie/HalftoneImage";
import { Redacted } from "@/components/magpie/Redacted";

// MDX writing vocabulary (spec §4.3). Injected through the `components` prop
// wherever case-file content renders, so articles never import directly.
export const articleComponents: MDXComponents = {
  Redacted,
  ClueChip,
  HalftoneImage,
  ExhibitCard,
};
