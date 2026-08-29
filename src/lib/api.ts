// /api/* seam (spec D4): these signatures ARE the future Go service contract.
// The static site has no backend yet, so every call resolves locally — view
// counts from a deterministic mock, writes politely refused. Swapping in the
// real fetches later touches only this module, never a call site.

export type ViewCount = { slug: string; count: number };

export type Rejected = { ok: false; reason: "api-not-in-service" };

// Stable per-slug pseudo count: a hash stride in the hundreds, so the mock
// reads like a real tally without ever changing between builds.
function mockViews(slug: string): number {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }
  return 120 + hash;
}

export async function getViews(slug: string): Promise<ViewCount> {
  return { slug, count: mockViews(slug) };
}

export async function like(_slug: string): Promise<Rejected> {
  return { ok: false, reason: "api-not-in-service" };
}

export async function subscribe(_email: string): Promise<Rejected> {
  return { ok: false, reason: "api-not-in-service" };
}
