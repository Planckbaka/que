import { PaperGrain } from "@/components/magpie/PaperGrain";
import { Magpie, PenNib } from "@/components/magpie/silhouettes";
import { PressTape } from "@/components/motion/PressTape";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { useWorld } from "@/components/motion/WorldWipe";
import { JsonLd } from "@/components/seo/JsonLd";
import { Switch } from "@/components/ui/switch";
import { publishedArticles } from "@/lib/content";
import { personNode, site, socialMeta } from "@/lib/site";

export function meta() {
  return [
    { title: site.title },
    { name: "description", content: site.description },
    ...socialMeta({
      path: "/",
      title: site.title,
      description: site.description,
    }),
  ];
}

// Site-level rich-result data: one Person node the whole graph can reference.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...personNode(),
      "@id": `${site.url}/#person`,
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.title,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-background text-foreground">
      <div className="mx-auto grid max-w-[76rem] gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-16">
        <div>
          <p className="font-machine text-xs font-bold uppercase tracking-[0.2em]">
            The personal blog of {site.author}
          </p>
          <h1 className="mt-6 font-display text-[clamp(3.2rem,10vw,9rem)] uppercase leading-[0.92] tracking-tight">
            <span className="block">Orion</span>
            <span className="block text-outline">Arch.</span>
          </h1>
          <div className="mt-8 max-w-[36rem] border-l-2 border-current pl-5">
            <p className="font-body text-xl leading-relaxed md:text-2xl">
              Python. Go. Reliable backends.
              <br />
              From APIs to AI infrastructure.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 font-machine text-xs font-bold uppercase tracking-[0.14em]">
            <LinkUnderVeil
              to="/files"
              className="border-2 border-paper bg-paper px-5 py-4 text-ink shadow-print-sm transition-transform hover:-translate-y-1"
            >
              Read the articles <span aria-hidden="true">↗</span>
            </LinkUnderVeil>
            <LinkUnderVeil to="/about" className="self-center border-b border-current py-2">
              About the author <span aria-hidden="true">→</span>
            </LinkUnderVeil>
          </div>
        </div>
        <div className="reading-paper relative flex flex-col justify-between border-2 border-ink bg-paper p-6 text-ink shadow-print-lg md:p-8">
          <div className="flex justify-between border-b border-ink pb-4 font-machine text-[10px] font-bold uppercase tracking-[0.18em]">
            <span>Python / Go</span>
            <span>@orionarch26</span>
          </div>
          <div
            aria-hidden="true"
            className="relative my-6 flex min-h-36 items-center justify-center md:min-h-48"
          >
            <span className="absolute inset-0 halftone text-ink opacity-10" />
            <Magpie className="relative w-40 -rotate-12 md:w-56" />
            <PenNib className="absolute right-0 bottom-0 size-14 text-blood" />
          </div>
          <div className="border-t border-ink pt-4">
            <p className="font-display text-3xl uppercase">{site.author}</p>
            <p className="mt-2 font-machine text-[11px] uppercase leading-relaxed tracking-[0.12em]">
              Python &amp; Go backend engineer
            </p>
            <p className="mt-4 font-body text-lg leading-relaxed">
              I write to understand how systems work — from a goroutine to a model server.
            </p>
            <a
              href={site.github}
              className="mt-5 inline-block border-b border-ink py-2 font-machine text-xs font-bold"
            >
              GitHub / @orionarch26 ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestArticles() {
  return (
    <section
      className="reading-paper px-6 py-14 md:px-10 md:py-20"
      aria-labelledby="latest-heading"
    >
      <div className="mx-auto max-w-[71rem]">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-6">
          <div>
            <p className="font-machine text-xs font-bold uppercase tracking-[0.2em]">
              01 / From the notebook
            </p>
            <h2 id="latest-heading" className="mt-3 font-display text-4xl uppercase md:text-6xl">
              Latest writing
            </h2>
          </div>
          <LinkUnderVeil
            to="/files"
            className="border-b border-ink pb-1 font-machine text-xs font-bold uppercase tracking-[0.12em]"
          >
            All articles <span aria-hidden="true">→</span>
          </LinkUnderVeil>
        </div>
        <div>
          {publishedArticles.slice(0, 3).map((article, index) => (
            <LinkUnderVeil
              key={article.slug}
              to={`/files/${article.slug}`}
              className="group grid min-w-0 gap-4 border-b border-ink/30 py-7 md:grid-cols-[3rem_1fr_10rem] md:gap-8 md:py-9"
            >
              <span aria-hidden="true" className="font-display text-3xl text-blood">
                0{index + 1}
              </span>
              <div>
                <p className="font-machine text-[10px] font-bold uppercase tracking-[0.16em]">
                  {article.frontmatter.world === "red" ? "Engineering Notes" : "Frontier Notes"}
                </p>
                <h3 className="mt-2 font-display text-3xl uppercase leading-tight group-hover:underline decoration-2 underline-offset-4 md:text-4xl">
                  {article.frontmatter.title}
                </h3>
                <p className="mt-3 max-w-[58ch] font-body text-lg leading-relaxed">
                  {article.frontmatter.summary}
                </p>
              </div>
              <p className="font-machine text-[11px] uppercase leading-loose tracking-[0.08em] md:text-right">
                <time dateTime={article.frontmatter.date}>{article.frontmatter.date}</time>
                <br />
                {article.readingTimeMinutes} min read <span aria-hidden="true">↗</span>
              </p>
            </LinkUnderVeil>
          ))}
        </div>
      </div>
    </section>
  );
}

function WritingTracks() {
  const { world, toggle } = useWorld();
  const tracks = [
    {
      world: "red",
      title: "Engineering Notes",
      number: "I",
      text: "Go, Python, and the systems around them. Notes on making software simpler to build, understand, and maintain.",
    },
    {
      world: "black",
      title: "Frontier Notes",
      number: "II",
      text: "AI infrastructure, evolving runtimes, and the algorithms behind modern services. Professional notes on what changes and why it matters.",
    },
  ];
  if (world === "black") tracks.reverse();
  return (
    <section className="border-y-2 border-ink bg-ink text-paper" aria-labelledby="tracks-heading">
      <div className="mx-auto max-w-[76rem] px-6 py-12 md:px-10 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-paper/30 pb-6">
          <h2
            id="tracks-heading"
            className="font-machine text-xs font-bold uppercase tracking-[0.2em]"
          >
            02 / Two threads of curiosity
          </h2>
          <label
            htmlFor="track-order"
            className="flex items-center gap-4 font-machine text-[11px] uppercase tracking-[0.12em]"
          >
            Frontier notes first
            <Switch
              id="track-order"
              checked={world === "black"}
              onCheckedChange={toggle}
              aria-label="Show frontier articles first"
            />
          </label>
        </div>
        <div className="grid gap-10 pt-10 md:grid-cols-2 md:gap-16">
          {tracks.map((track) => (
            <div key={track.world}>
              <p className="font-display text-5xl text-stamp" aria-hidden="true">
                {track.number}
              </p>
              <h3 className="mt-4 font-display text-3xl uppercase md:text-4xl">{track.title}</h3>
              <p className="mt-4 max-w-[42ch] font-body text-xl leading-relaxed">{track.text}</p>
              <LinkUnderVeil
                to={`/files#${track.world}`}
                className="mt-6 inline-block border-b border-paper py-2 font-machine text-xs font-bold uppercase tracking-[0.12em]"
              >
                Browse this collection <span aria-hidden="true">→</span>
              </LinkUnderVeil>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <div id="top">
      <JsonLd data={websiteJsonLd} />
      <PaperGrain />
      <Hero />
      <PressTape items={["PYTHON & GO", "BACKEND ENGINEERING", "LLM SYSTEMS & PAPER NOTES"]} />
      <LatestArticles />
      <WritingTracks />
      <section
        className="reading-paper border-b-2 border-ink px-6 py-14 md:px-10 md:py-20"
        aria-labelledby="start-heading"
      >
        <div className="mx-auto max-w-[71rem]">
          <p className="font-machine text-xs font-bold uppercase tracking-[0.2em]">
            03 / Places to begin
          </p>
          <h2 id="start-heading" className="mt-3 font-display text-4xl uppercase md:text-6xl">
            Inside my notebook
          </h2>
          <p className="mt-5 max-w-[55ch] font-body text-xl leading-relaxed">
            I follow questions across code, experiments, and papers. Pick a thread that interests
            you.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Building with Go",
                detail:
                  "What happens when a service has less CPU than it expects? Start with runtime budgets and latency.",
                slug: "go-container-cpu-budgets",
              },
              {
                title: "Thinking in Python",
                detail:
                  "What does removing the GIL change for a backend? Explore the assumptions before the benchmarks.",
                slug: "python-free-threading-backend",
              },
              {
                title: "Reading LLM papers",
                detail:
                  "From attention shapes to serving costs: connect the model's mechanics with engineering decisions.",
                slug: "llm-attention-from-shapes-to-kv-cache",
              },
            ].map((item) => (
              <LinkUnderVeil
                key={item.slug}
                to={`/files/${item.slug}`}
                className="min-w-0 border-2 border-ink p-6 shadow-print-sm hover:underline underline-offset-4"
              >
                <h3 className="font-display text-3xl uppercase">{item.title}</h3>
                <p className="mt-4 font-body text-lg leading-relaxed">{item.detail}</p>
                <span className="mt-5 inline-block font-machine text-xs font-bold uppercase">
                  Start reading →
                </span>
              </LinkUnderVeil>
            ))}
          </div>
        </div>
      </section>
      {/* Closing beat inks the page back into the black world (§1 world
          rhythm: red -> paper -> ink -> paper -> ink, flowing into the footer). */}
      <section className="bg-ink px-6 py-14 text-paper md:px-10 md:py-20">
        <div className="mx-auto max-w-[71rem]">
          <p className="font-machine text-xs font-bold uppercase tracking-[0.2em]">
            04 / A note from the author
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <h2 className="font-display text-4xl uppercase leading-tight md:text-5xl">
              A place to
              <br />
              think in public.
            </h2>
            <div className="font-body text-xl leading-relaxed">
              <p>
                I’m {site.author}. This is my notebook for Python and Go backend engineering: APIs,
                concurrency, distributed systems, and the infrastructure behind AI applications.
              </p>
              <LinkUnderVeil
                to="/about"
                className="mt-6 inline-block border-b border-paper pb-1 font-machine text-xs font-bold uppercase tracking-[0.12em]"
              >
                More about me <span aria-hidden="true">→</span>
              </LinkUnderVeil>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
