import { ClueChip } from "@/components/magpie/ClueChip";
import { Redacted } from "@/components/magpie/Redacted";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { useWorld, type World } from "@/components/motion/WorldWipe";
import { ArchiveSearch } from "@/components/search/ArchiveSearch";
import type { Article } from "@/lib/content";
import { groupByWorld, publishedArticles } from "@/lib/content";
import { site, socialMeta } from "@/lib/site";

export function meta() {
  const description =
    "Articles on backend engineering, infrastructure, neural networks, and machine learning.";
  return [
    { title: `Articles · ${site.title}` },
    { name: "description", content: description },
    ...socialMeta({ path: "/files", title: "Articles", description }),
  ];
}

const TRACKS: Array<{ world: World; heading: string; kicker: string }> = [
  {
    world: "black",
    heading: "Frontier Notes",
    kicker: "AI systems · Runtimes · Algorithms",
  },
  {
    world: "red",
    heading: "Engineering Notes",
    kicker: "Go · Python · Systems",
  },
];

function FileCard({ article }: { article: Article }) {
  const { frontmatter: fm } = article;
  return (
    <LinkUnderVeil
      to={`/files/${article.slug}`}
      className="on-card block border-2 border-line bg-card p-6 md:p-8 text-card-foreground shadow-print-sm transition-transform duration-[140ms] hover:-translate-y-1"
    >
      <p className="font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
        {fm.kicker}
      </p>
      <h3 className="mt-3 font-display text-3xl uppercase leading-none">{fm.title}</h3>
      <p className="mt-4 font-body text-lg leading-relaxed">{fm.summary}</p>
      <p className="mt-6 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {fm.date} · {article.readingTimeMinutes} min read
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {fm.tags.map((tag) => (
          <ClueChip key={tag}>{tag}</ClueChip>
        ))}
      </div>
    </LinkUnderVeil>
  );
}

// The archive wall (spec §3): case files grouped by world track. The reader's
// current world weighs the ordering — its track leads the wall.
export default function FilesPage() {
  const { world } = useWorld();
  const grouped = groupByWorld(publishedArticles);
  const ordered = world === "black" ? TRACKS : [...TRACKS].reverse();

  return (
    <div className="reading-paper min-h-svh">
      <section className="reading-paper mx-auto max-w-[76rem] px-6 pt-12 pb-12 md:px-10 md:pt-16">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          My notebook / All writing
        </p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.95]">
          Articles & Notes
        </h1>
        <p className="mt-4 max-w-[52ch] font-body text-lg text-muted-foreground">
          Notes on software and machine learning, collected in two reading paths. Find an article or
          browse by subject below. {/* Archive-wall Easter egg (SKILL §7). */}
          <Redacted title="Reveal the archivist's note">
            One for sorrow, two for joy — the rest are sealed evidence.
          </Redacted>
        </p>
        <div className="mt-8">
          <ArchiveSearch />
        </div>
      </section>

      {ordered.map((track) => (
        <section
          key={track.world}
          id={track.world}
          data-world={track.world}
          className="scroll-mt-6 border-t-2 border-ink bg-background px-6 py-14 text-foreground md:px-10"
        >
          <header className="mx-auto max-w-[76rem]">
            <p className="font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {track.kicker}
            </p>
            <h2 className="mt-2 font-display text-4xl uppercase md:text-5xl">{track.heading}</h2>
          </header>
          <div className="mx-auto mt-10 grid max-w-[76rem] gap-8 md:grid-cols-2">
            {grouped[track.world].map((article) => (
              <FileCard key={article.slug} article={article} />
            ))}
            {grouped[track.world].length === 0 && (
              <p className="font-machine text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                No articles in this collection yet. I’m still working on the next note.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
