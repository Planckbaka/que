import { Magpie } from "@/components/magpie/silhouettes";
import { ChapterNumeral } from "@/components/motion/ChapterNumeral";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { site } from "@/lib/site";

export function meta() {
  return [
    { title: `Colophon · ${site.title}` },
    {
      name: "description",
      content:
        "The colophon: who writes The Magpie Files, how the edition is set, printed, and bound.",
    },
  ];
}

const EDITION: Array<[string, string]> = [
  ["Set in", "Anton · Crimson Pro · Courier Prime"],
  ["Printed in", "three inks — vermillion, warm ink, aged paper"],
  ["Motion engine", "Motion, scrubbed by Lenis · wipes, never fades"],
  ["Bound with", "React Router v7 framework mode, prerendered to static paper"],
  ["Later printings", "giscus marginalia · pagefind index — pending"],
];

// Colophon (spec §2/D5): the About page written as a book's edition record.
export default function AboutPage() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <ChapterNumeral numeral="MMXXVI" className="-top-4 right-0 text-[clamp(8rem,20vw,17rem)]" />
      <section className="relative mx-auto max-w-[76rem] px-6 pt-16 pb-24 md:px-10">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Colophon · 版权页
        </p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.95]">
          Notes on the Edition
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 font-body text-lg leading-relaxed">
            <p>
              <strong className="font-machine text-sm font-bold uppercase tracking-[0.18em]">
                {site.author}
              </strong>{" "}
              writes both sides of the seam: a backend engineer (Go, Python, and the infrastructure
              between them) in the red world, and a neural-network algorithms detective in the black
              — where every loss function is a case worth closing.
            </p>
            <p>
              The Magpie Files is that dual life, bound as one publication. Articles are set from
              Markdown case files, validated at the press, prerendered to static paper, and bound
              with hard-offset print shadows. The magpie counts the sorrows; the reader counts the
              pages.
            </p>
            <div className="flex flex-wrap gap-6 pt-2 font-machine text-xs font-bold uppercase tracking-[0.22em]">
              <LinkUnderVeil
                to="/files"
                className="border-b-2 border-line pb-1 hover:border-foreground"
              >
                Open the archive
              </LinkUnderVeil>
              <a href="/rss.xml" className="border-b-2 border-line pb-1 hover:border-foreground">
                RSS Feed
              </a>
            </div>
          </div>

          <dl className="on-card h-fit border-2 border-line bg-card p-8 text-card-foreground shadow-print">
            {EDITION.map(([term, detail]) => (
              <div
                key={term}
                className="flex flex-col gap-1 border-b border-line/40 py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <dt className="font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  {term}
                </dt>
                <dd className="font-body text-base">{detail}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between pt-6">
              <span className="font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                First edition · August 2026
              </span>
              <Magpie className="size-6" />
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
