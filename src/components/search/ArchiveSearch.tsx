import { type ReactNode, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { loadPagefind, type PagefindApi, type PagefindResult } from "@/lib/pagefind";

// Split actual <mark> highlights before decoding escaped text, so literal
// tags in articles survive. React renders every text node —
// no dangerouslySetInnerHTML, no XSS surface.
function excerptNodes(html: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let open = false;
  for (const part of html.split(/(<\/?mark>)/g)) {
    if (part === "<mark>") {
      open = true;
      continue;
    }
    if (part === "</mark>") {
      open = false;
      continue;
    }
    const text = part
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'")
      .replaceAll("&amp;", "&");
    if (text) nodes.push(open ? <mark key={nodes.length}>{text}</mark> : text);
  }
  return nodes;
}

// Archive search (spec D4): pagefind indexes the static output at build time;
// the UI lazy-loads its chunk from the deployed root. Where the index is
// absent — dev server, tests — the component degrades to a polite notice
// instead of breaking the wall.
export function ArchiveSearch() {
  const [query, setQuery] = useState("");
  const [pagefind, setPagefind] = useState<PagefindApi | null>(null);
  const [available, setAvailable] = useState(true);
  const [results, setResults] = useState<PagefindResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPagefind()
      .then((api) => {
        if (!cancelled) setPagefind(api);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pagefind) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setResults(null);
    pagefind
      .search(trimmed)
      .then(async (response) => {
        const data = await Promise.all(response.results.slice(0, 8).map((entry) => entry.data()));
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pagefind, query]);

  if (!available) {
    return (
      <p className="font-machine text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        Search is temporarily unavailable — browse the articles below.
      </p>
    );
  }

  return (
    <div>
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search articles…"
        aria-label="Search the archive"
        className="max-w-md font-machine text-sm uppercase tracking-[0.14em]"
      />
      {results && (
        <ul className="mt-6 grid gap-4">
          {results.map((result) => (
            <li key={result.url}>
              <a
                href={result.url}
                className="block border-2 border-line bg-card p-5 text-card-foreground shadow-print-sm transition-transform duration-150 hover:-translate-y-0.5"
              >
                <p className="font-machine text-xs font-bold uppercase tracking-[0.22em]">
                  {result.meta.title ?? result.url}
                </p>
                <p className="mt-2 font-body text-base leading-relaxed [&_mark]:bg-primary/20">
                  {excerptNodes(result.excerpt)}
                </p>
              </a>
            </li>
          ))}
          {results.length === 0 && (
            <li className="font-machine text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              No articles found. Try another keyword.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
