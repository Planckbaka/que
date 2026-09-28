// URL path segments arrive percent-encoded; a malformed escape (%zz) makes
// decodeURIComponent throw URIError. The route renders a 404 for unknown
// slugs, so the raw segment is always a safe fallback — never let a decoding
// hiccup skip hydration for the whole document.
export function decodeSlugSegment(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
