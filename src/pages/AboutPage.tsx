import { Magpie } from "@/components/magpie/silhouettes";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { site, socialMeta } from "@/lib/site";

export function meta() {
  const description =
    "About Orion Arch and this personal notebook on Python, Go, and backend systems.";
  return [
    { title: `About · ${site.title}` },
    { name: "description", content: description },
    ...socialMeta({ path: "/about", title: "About", description }),
  ];
}

export default function AboutPage() {
  return (
    <div className="reading-paper min-h-svh">
      <section className="mx-auto max-w-[76rem] px-6 py-14 md:px-10 md:py-20">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.2em]">
          About / The author
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,9vw,7rem)] uppercase leading-none">
          {site.author}
        </h1>
        <div className="mt-10 grid gap-12 border-t-2 border-ink pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-6 font-body text-xl leading-relaxed">
            <p>
              I’m a Python and Go backend engineer, focused on APIs, concurrency, and reliable
              services.
            </p>
            <p>
              This blog is where I work through what I’m learning. I write about service
              architecture, performance, and AI infrastructure — with code, small experiments, and
              explanations I can return to later.
            </p>
            <p>
              Engineering Notes follows the software side. Frontier Notes explores AI systems and
              emerging runtime capabilities. Both start with the same question: how does this
              actually work?
            </p>
            <div className="flex flex-wrap gap-6 pt-4 font-machine text-xs font-bold uppercase tracking-[0.12em]">
              <LinkUnderVeil to="/files" className="border-b border-ink py-2">
                Read the articles →
              </LinkUnderVeil>
              <a href={site.github} className="border-b border-ink py-2">
                Find me on GitHub ↗
              </a>
              <a href="/rss.xml" className="border-b border-ink py-2">
                Follow via RSS ↗
              </a>
            </div>
          </div>
          <aside className="h-fit border-2 border-ink p-7 shadow-print md:p-9">
            <Magpie aria-hidden="true" className="mb-6 size-16 text-blood" />
            <h2 className="font-display text-3xl uppercase">Currently exploring</h2>
            <p className="mt-4 font-body text-lg leading-relaxed">
              My learning notes connect backend fundamentals with the systems that serve modern AI.
            </p>
            <dl className="mt-6 space-y-5 border-t border-ink pt-6">
              {[
                ["Go", "Scheduling, cancellation, CPU budgets, and predictable latency."],
                ["Python", "Async services, bounded concurrency, and evolving runtimes."],
                ["LLM systems", "Attention, MoE routing, and DSpark speculative decoding."],
              ].map(([topic, detail]) => (
                <div key={topic}>
                  <dt className="font-machine text-xs font-bold uppercase tracking-[0.12em]">
                    {topic}
                  </dt>
                  <dd className="mt-2 font-body text-lg leading-relaxed">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-ink pt-6 font-body text-base leading-relaxed">
              A small design note: the paper, ink, and silhouettes are inspired by the opening
              titles of <em>Magpie Murders</em>. The writing and experiments here are my own
              notebook.
            </p>
            <LinkUnderVeil
              to="/lab"
              className="mt-6 inline-block border-b border-ink py-2 font-machine text-xs font-bold uppercase tracking-[0.12em]"
            >
              Explore the design lab →
            </LinkUnderVeil>
          </aside>
        </div>
      </section>
    </div>
  );
}
