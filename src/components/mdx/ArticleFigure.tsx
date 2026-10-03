import type { ReactNode } from "react";

// Reading-layout width breakpoints for article illustrations: two viewport
// tiers with the page chrome subtracted, then the fixed card column.
const DEFAULT_SIZES =
  "(max-width: 639px) calc(100vw - 92px), (max-width: 767px) calc(100vw - 116px), 600px";
// WebP derivatives are generated manually (cwebp -q 82); check-publication.ts
// fails the build if any referenced derivative is missing from build/client.
const DERIVATIVE_WIDTHS = [480, 800, 1254];

type ArticleFigureProps = {
  /** Asset base path without size suffix, e.g. /images/articles/moe-top-two-routing */
  base: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  caption: ReactNode;
  attribution?: string;
};

// Article illustration with the full-size PNG kept one click away: responsive
// WebP srcSet inline, the ~2.7 MB PNG only loads on explicit request.
// SKILL §7 carve-out: these are authored schematic figures with their own
// responsive WebP pipeline — the "everything through HalftoneImage" law covers
// atmosphere/photography, not technical diagrams that must stay crisp.
export function ArticleFigure({
  base,
  alt,
  width = 1254,
  height = 1254,
  sizes = DEFAULT_SIZES,
  caption,
  attribution = "Illustration generated with GPT Image.",
}: ArticleFigureProps) {
  const srcSet = DERIVATIVE_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  return (
    <figure className="article-illustration">
      <a
        href={`${base}.png`}
        target="_blank"
        rel="noreferrer"
        aria-label="Open illustration at full size in a new tab"
      >
        <img
          src={`${base}-800.webp`}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption>
        {caption} <a href={`${base}.png`}>View full-size image (new tab)</a>. {attribution}
      </figcaption>
    </figure>
  );
}
