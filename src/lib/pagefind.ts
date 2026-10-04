export type PagefindResult = {
  meta: { title?: string; url?: string };
  excerpt: string;
  url: string;
};

export type PagefindApi = {
  search(query: string): Promise<{ results: Array<{ data(): Promise<PagefindResult> }> }>;
};

// Check the MIME type before import: development servers can return SPA HTML
// for a missing index, which would otherwise trigger a module loading error.
export async function loadPagefind(): Promise<PagefindApi> {
  const chunk = "/pagefind/pagefind.js";
  const res = await fetch(chunk);
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("javascript")) {
    throw new Error("no pagefind index");
  }
  const mod = await import(/* @vite-ignore */ chunk);
  return mod.default ?? mod;
}
