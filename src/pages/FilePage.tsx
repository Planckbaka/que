import { useParams } from "react-router";
import { articleComponents } from "@/components/mdx/article-components";
import { getArticle } from "@/lib/content";
import { site } from "@/lib/site";

// Minimal case-file reader (P2 pipeline proof). P3 replaces this with the full
// 正文模板: _seo layout, Folio reading progress, RunningHead/Footer chrome.
export function meta({ params }: { params: { slug?: string } }) {
  const article = getArticle(params.slug ?? "");
  if (!article) {
    return [{ title: `Sealed File · ${site.title}` }];
  }
  const { frontmatter: fm } = article;
  return [
    { title: `${fm.title} · ${site.title}` },
    { name: "description", content: fm.summary },
    { tagName: "link", rel: "canonical", href: `${site.url}/files/${article.slug}` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: fm.title },
    { property: "og:description", content: fm.summary },
    { property: "og:url", content: `${site.url}/files/${article.slug}` },
    { property: "og:image", content: `${site.url}/og/${article.slug}.png` },
  ];
}

function SealedNotice({ slug }: { slug?: string }) {
  return (
    <main
      data-world="black"
      className="flex min-h-svh items-center justify-center bg-background text-foreground"
    >
      <div className="border-2 border-line bg-card px-10 py-8 text-center shadow-print">
        <p className="font-display text-4xl uppercase">Sealed File</p>
        <p className="mt-3 font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
          {slug ? `Case ${slug} is not on public record` : "Case not on public record"}
        </p>
      </div>
    </main>
  );
}

export default function FilePage() {
  const { slug } = useParams();
  const article = getArticle(slug ?? "");
  if (!article || article.frontmatter.draft) {
    return <SealedNotice slug={slug} />;
  }
  const { frontmatter: fm, Component } = article;
  return (
    <main data-world={fm.world} className="min-h-svh bg-background text-foreground">
      <article className="mx-auto max-w-[76rem] px-6 py-16 md:px-10">
        <div className="case-file mx-auto max-w-[72ch] border-2 border-line bg-card p-8 text-card-foreground shadow-print-lg md:p-14">
          <p className="font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
            {fm.kicker}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.95]">
            {fm.title}
          </h1>
          <p className="mt-6 font-machine text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Filed {fm.date} · {article.readingTimeMinutes} min read
          </p>
          <div className="mt-10">
            <Component components={articleComponents} />
          </div>
        </div>
      </article>
    </main>
  );
}
