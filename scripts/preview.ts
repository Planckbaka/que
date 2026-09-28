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
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
};

async function load(
  pathname: string,
): Promise<{ body: Buffer; file: string; status: number } | null> {
  const clean = pathname.replace(/\/+$/, "");
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, "index.html"),
    join(ROOT, `${clean}.html`),
  ];
  for (const file of candidates) {
    try {
      return { body: await readFile(file), file, status: 200 };
    } catch {
      // try the next candidate
    }
  }
  try {
    return {
      body: await readFile(join(ROOT, "__spa-fallback.html")),
      file: "__spa-fallback.html",
      status: 404,
    };
  } catch {
    return { body: await readFile(join(ROOT, "index.html")), file: "index.html", status: 404 };
  }
}

createServer(async (req, res) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Invalid URL");
    return;
  }
  if (pathname.split(/[\\/]/).includes("..")) {
    res.writeHead(404).end("Not found");
    return;
  }
  const found = await load(pathname);
  if (!found) {
    res.writeHead(404);
    res.end();
    return;
  }
  const type = TYPES[extname(found.file)] ?? "application/octet-stream";
  const body = req.headers["accept-encoding"]?.includes("gzip") ? gzipSync(found.body) : found.body;
  res.writeHead(found.status, {
    "content-type": type,
    ...(body !== found.body ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}),
    "content-length": body.length,
    "cache-control":
      found.file === "__spa-fallback.html" || type.startsWith("text/html")
        ? "no-cache"
        : /[.-][A-Za-z0-9_-]{8,}\.(js|css|woff2?)$/.test(found.file)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
  });
  res.end(body);
}).listen(PORT, () => console.log(`preview on http://localhost:${PORT}`));
