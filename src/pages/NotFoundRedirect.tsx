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
    <section className="reading-paper flex min-h-svh items-center justify-center px-6 py-16">
      <div className="max-w-xl border-2 border-ink p-8 shadow-print">
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
