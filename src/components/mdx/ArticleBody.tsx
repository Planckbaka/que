import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/content";
import { articleComponents } from "./article-components";

export function ArticleBody({ Component }: Pick<Article, "Component">) {
  const body = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Array<{ id: string; text: string }>>([]);
  useEffect(() => {
    setHeadings(
      Array.from(body.current?.querySelectorAll("h2[id]") ?? []).map((heading) => ({
        id: heading.id,
        text: heading.textContent ?? "",
      })),
    );
    // A direct link may arrive before its lazy body has hydrated.
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);
  return (
    <>
      <details className="mb-8 border-y border-line py-3">
        <summary className="cursor-pointer font-machine text-sm">On this page</summary>
        <nav aria-label="Article contents">
          <ol>
            {headings.map(({ id, text }) => (
              <li key={id}>
                <a href={`#${id}`} data-native-scroll>
                  {text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
      <div ref={body}>
        <Component components={articleComponents} />
      </div>
    </>
  );
}
