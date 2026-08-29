// Local preview for the prerendered static output — replaces `vite preview`,
// which serves the ROOT index.html for nested routes (/lab, /files, /about):
// hydration then mismatches (#418), React discards the prerendered tree and
// re-renders client-side (flash + remounted animations).
//
// This server mirrors production CDN behavior:
//   /exact.file         -> the file (gzip)
//   /dir/ or /dir       -> dir/index.html (directory index)
//   /path.html          -> the file
//   anything else       -> __spa-fallback.html (client-routed unknowns)

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(process.cwd(), "build/client");
const PORT = Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

async function load(pathname: string): Promise<{ body: Buffer; file: string } | null> {
  const clean = pathname.replace(/\/+$/, "");
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, "index.html"),
    join(ROOT, `${clean}.html`),
  ];
  for (const file of candidates) {
    try {
      return { body: await readFile(file), file };
    } catch {
      // try the next candidate
    }
  }
  try {
    return { body: await readFile(join(ROOT, "__spa-fallback.html")), file: "__spa-fallback.html" };
  } catch {
    return { body: await readFile(join(ROOT, "index.html")), file: "index.html" };
  }
}

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const found = await load(pathname);
  if (!found) {
    res.writeHead(404);
    res.end();
    return;
  }
  const type = TYPES[extname(found.file)] ?? "application/octet-stream";
  const body = req.headers["accept-encoding"]?.includes("gzip") ? gzipSync(found.body) : found.body;
  res.writeHead(200, {
    "content-type": type,
    ...(body !== found.body ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}),
    "content-length": body.length,
    "cache-control":
      found.file === "__spa-fallback.html" || type.startsWith("text/html")
        ? "no-cache"
        : "public, max-age=31536000, immutable",
  });
  res.end(body);
}).listen(PORT, () => console.log(`preview on http://localhost:${PORT}`));
