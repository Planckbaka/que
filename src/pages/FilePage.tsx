import { Link, useParams } from "react-router";
import { GiscusComments } from "@/components/comments/GiscusComments";
import { ArticleBody } from "@/components/mdx/ArticleBody";
import { ChapterNumeral } from "@/components/motion/ChapterNumeral";
import { ReadingFolio } from "@/components/motion/ReadingFolio";
import { getArticle, preloadArticle, publishedArticles } from "@/lib/content";
import { romanNumeral } from "@/lib/motion";
import { site, socialMeta } from "@/lib/site";
import NotFoundPage, { meta as notFoundMeta } from "./NotFoundRedirect";
import { RouteErrorCard } from "./SeoLayout";

// Resolve the body before rendering so prerendered HTML contains visible text,
// rather than a streamed Suspense placeholder that a static indexer ignores.
export async function loader({ params }: { params: { slug?: string } }) {
  await preloadArticle(params.slug ?? "");
  return null;
}
export async function clientLoader(args: Parameters<typeof loader>[0]) {
  await preloadArticle(args.params.slug ?? "");
  return null;
}
clientLoader.hydrate = true as const;

// Minimal case-file reader (P2 pipeline proof). P3 replaces this with the full
// 正文模板: _seo layout, Folio reading progress, RunningHead/Footer chrome.
export function meta({ params }: { params: { slug?: string } }): Array<Record<string, string>> {
  const article = getArticle(params.slug ?? "");
  if (!article) {
    return notFoundMeta();
  }
  const { frontmatter: fm } = article;
  return [
    { title: `${fm.title} · ${site.title}` },
    { name: "description", content: fm.summary },
    { tagName: "link", rel: "canonical", href: `${site.url}/files/${article.slug}` },
    { property: "og:type", content: "article" },
    { property: "og:url", content: `${site.url}/files/${article.slug}` },
    { property: "article:published_time", content: fm.date },
    ...fm.tags.map((tag) => ({ property: "article:tag", content: tag })),
    ...socialMeta({
      title: fm.title,
      description: fm.summary,
      image: `${site.url}/og/${article.slug}.png`,
    }),
  ];
}

// Body chunks load on demand; a failed fetch (offline, deploy swap) must not
// take the whole layout down — show a reading-local error inside the chrome.
export function ErrorBoundary() {
  return (
    <RouteErrorCard
      title="Reading interrupted"
      detail="This article failed to load. Check the connection and try again — the archive itself is intact."
    />
  );
}

export default function FilePage() {
  const { slug } = useParams();
  const article = getArticle(slug ?? "");
  if (!article || article.frontmatter.draft) {
    return <NotFoundPage />;
  }
  const { frontmatter: fm, Component } = article;
  // Chapter numeral = position in the published shelf (monument budget: this
  // numeral is the one monumental element on the reading view).
  const ordinal = publishedArticles.findIndex((entry) => entry.slug === article.slug);
  // 相关阅读只取有标签交集的文章——0 分凑数等于随机推荐，宁缺毋滥
  const related = publishedArticles
    .filter((entry) => entry.slug !== article.slug)
    .map((entry) => ({
      entry,
      score: entry.frontmatter.tags.filter((tag) => fm.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return (
    <div data-world={fm.world} className="relative min-h-svh bg-background text-foreground">
      <ChapterNumeral
        numeral={romanNumeral(ordinal + 1)}
        className="hidden md:block -top-8 right-0 text-[clamp(10rem,26vw,22rem)]"
      />
      <ReadingFolio total={article.readingTimeMinutes} />
      <article className="relative z-10 mx-auto max-w-[76rem] px-6 py-16 md:px-10">
        <div
          data-pagefind-body
          className="on-card case-file mx-auto max-w-[72ch] border-2 border-line bg-card p-5 text-card-foreground shadow-print-lg sm:p-8 md:p-14"
        >
          <p className="font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
            {fm.kicker}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.95]">
            {fm.title}
          </h1>
          <p className="mt-6 font-machine text-xs uppercase tracking-[0.18em] text-muted-foreground">
            By {site.author} · {fm.date} · {article.readingTimeMinutes} min read
          </p>
          <div className="mt-10">
            <ArticleBody key={article.slug} Component={Component} />
          </div>
          {related.length > 0 && (
            <nav
              data-pagefind-ignore
              aria-label="Related articles"
              className="mt-12 border-t border-line pt-6"
            >
              <h2>Continue reading</h2>
              <ul>
                {related.map(({ entry }) => (
                  <li key={entry.slug}>
                    <Link to={`/files/${entry.slug}`}>{entry.frontmatter.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="mt-14">
            <GiscusComments />
          </div>
        </div>
      </article>
    </div>
  );
}
