import { type ReactNode, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type PagefindResult = {
  meta: { title?: string; url?: string };
  excerpt: string;
  url: string;
};

type PagefindApi = {
  search(query: string): Promise<{ results: Array<{ data(): Promise<PagefindResult> }> }>;
};

// Pagefind excerpts are HTML-escaped text with <mark> highlights. Decode the
// basic entities and split on the mark tags so React renders every text node —
// no dangerouslySetInnerHTML, no XSS surface.
function excerptNodes(html: string): ReactNode[] {
  const decoded = html.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
  const nodes: ReactNode[] = [];
  let open = false;
  for (const part of decoded.split(/(<\/?mark>)/g)) {
    if (part === "<mark>") {
      open = true;
      continue;
    }
    if (part === "</mark>") {
      open = false;
      continue;
    }
    if (part) nodes.push(open ? <mark key={nodes.length}>{part}</mark> : part);
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
    // @vite-ignore: the chunk lives at the deployed root, not in the module
    // graph — the runtime resolves it against the page origin. Fetch first so
    // dev servers (SPA-fallback HTML instead of the chunk) degrade silently
    // instead of throwing module-MIME errors into the console.
    const chunk = "/pagefind/pagefind.js";
    fetch(chunk)
      .then((res) => {
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.includes("javascript")) throw new Error("no pagefind index");
        return import(/* @vite-ignore */ chunk) as Promise<{ default?: PagefindApi }>;
      })
      .then((mod) => {
        if (cancelled) return;
        setPagefind(mod.default ?? (mod as unknown as PagefindApi));
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
    pagefind.search(trimmed).then(async (response) => {
      const data = await Promise.all(response.results.slice(0, 8).map((entry) => entry.data()));
      if (!cancelled) setResults(data);
    });
    return () => {
      cancelled = true;
    };
  }, [pagefind, query]);

  if (!available) {
    return (
      <p className="font-machine text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        Index unavailable in this printing — browse the shelf below.
      </p>
    );
  }

  return (
    <div>
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the files…"
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
              Nothing in the files matches — the detective keeps looking.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
