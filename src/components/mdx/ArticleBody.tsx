import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/content";
import { articleComponents } from "./article-components";

export function ArticleBody({ Component }: Pick<Article, "Component">) {
  const body = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDetailsElement>(null);
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
      {/* 条目来自正文渲染后的收集：没有 h2 时整块隐藏，no-JS 静态页不再出现空目录 */}
      {headings.length > 0 && (
        <details ref={tocRef} className="mb-8 border-y border-line py-3">
          <summary className="cursor-pointer font-machine text-sm uppercase tracking-[0.14em]">
            On this page
          </summary>
          <nav aria-label="Article contents">
            <ol>
              {headings.map(({ id, text }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    data-native-scroll
                    onClick={() => tocRef.current?.removeAttribute("open")}
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )}
      <div ref={body} className="article-body">
        <Component components={articleComponents} />
      </div>
    </>
  );
}
