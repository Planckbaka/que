import { Link } from "react-router";
import { AnagramText } from "@/components/motion/AnagramText";
import { site } from "@/lib/site";

export function meta(): Array<Record<string, string>> {
  return [
    { title: `Page not found · ${site.title}` },
    {
      name: "description",
      content: "This page is unavailable. Browse the published articles or return home.",
    },
    { name: "robots", content: "noindex, follow" },
  ];
}

export default function NotFoundRedirect() {
  return (
    <section className="reading-paper relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-16">
      {/* Monumental outlined numeral anchors the card's open flank — the same
          signature device as reading views' chapter numerals (monument budget:
          this is the view's one). */}
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none font-display text-[clamp(12rem,30vw,24rem)] leading-none opacity-40 md:block"
      >
        404
      </span>
      <div className="relative max-w-xl border-2 border-ink p-8 shadow-print">
        <p className="font-machine text-sm uppercase tracking-[0.14em]">404 / Orion Arch</p>
        {/* The 404 itself is the view's Easter egg: the heading mounts as a
            seeded anagram and resolves once, like every good case-file cover. */}
        <h1 className="mt-4 font-display text-5xl uppercase">
          <AnagramText text="Page not found" />
        </h1>
        <p className="mt-6 font-body text-xl">
          This link may be outdated, or the article is not published.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 underline underline-offset-4">
          <Link to="/files">Browse articles →</Link>
          <Link to="/">Return home →</Link>
        </div>
      </div>
    </section>
  );
}
