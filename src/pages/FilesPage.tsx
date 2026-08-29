import { ClueChip } from "@/components/magpie/ClueChip";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { useWorld, type World } from "@/components/motion/WorldWipe";
import type { Article } from "@/lib/content";
import { groupByWorld, publishedArticles } from "@/lib/content";
import { site } from "@/lib/site";

export function meta() {
  return [
    { title: `The Archive · ${site.title}` },
    {
      name: "description",
      content:
        "Every case on public record — algorithm files from the black world, engineering notes from the red, grouped by world.",
    },
  ];
}

const TRACKS: Array<{ world: World; heading: string; kicker: string }> = [
  {
    world: "black",
    heading: "Algorithm Files",
    kicker: "Black world · the detective's track",
  },
  {
    world: "red",
    heading: "Engineering Notes",
    kicker: "Red world · the author's track",
  },
];

function FileCard({ article }: { article: Article }) {
  const { frontmatter: fm } = article;
  return (
    <LinkUnderVeil
      to={`/files/${article.slug}`}
      className="on-card block border-2 border-line bg-card p-8 text-card-foreground shadow-print-sm transition-transform duration-150 hover:-translate-y-1"
    >
      <p className="font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
        {fm.kicker}
      </p>
      <h3 className="mt-3 font-display text-3xl uppercase leading-none">{fm.title}</h3>
      <p className="mt-4 font-body text-lg leading-relaxed">{fm.summary}</p>
      <p className="mt-6 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        Filed {fm.date} · {article.readingTimeMinutes} min read
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
    <div className="min-h-svh bg-background text-foreground">
      <section className="px-6 pt-16 pb-12 md:px-10">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          The Archive · 档案墙
        </p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.95]">
          Every Case on Record
        </h1>
        <p className="mt-4 max-w-[52ch] font-body text-lg text-muted-foreground">
          Two tracks, one investigation. Your current world leads the shelf; flip the switch to
          re-weight the files.
        </p>
      </section>

      {ordered.map((track) => (
        <section
          key={track.world}
          data-world={track.world}
          className="border-t-2 border-ink px-6 py-14 md:px-10"
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
                No files on public record yet — the detective is still writing.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
