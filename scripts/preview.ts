// Local preview for the prerendered static output — replaces `vite preview`,
// which serves the ROOT index.html for nested routes (/lab, /files, /about):
// hydration then mismatches (#418), React discards the prerendered tree and
// re-renders client-side (flash + remounted animations).
//
// This server mirrors production CDN behavior:
//   /exact.file         -> the file (gzip if compressible)
//   /dir/ or /dir       -> dir/index.html (directory index)
//   /path.html          -> the file
//   anything else       -> __spa-fallback.html with HTTP 404
//
// Responses stream straight from disk (createReadStream) — the request path
// is validated and resolved to a file inside build/client first, so no
// request-controlled bytes ever flow into the response body.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const ROOT = resolve(process.cwd(), "build/client");
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

// Already compressed by their codecs — gzipping them wastes CPU for ~0%.
const COMPRESSIBLE = (type: string) =>
  /^(text\/|application\/(json|xml|javascript)|image\/svg)/.test(type);

type Found = { file: string; status: number };

async function locate(pathname: string): Promise<Found> {
  const clean = pathname.replace(/\/+$/, "");
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, "index.html"),
    join(ROOT, `${clean}.html`),
  ];
  for (const candidate of candidates) {
    // Containment: the resolved path must stay inside the build output —
    // belt and braces beyond the ".." segment check in the handler.
    const resolved = resolve(candidate);
    if (resolved !== ROOT && !resolved.startsWith(ROOT + sep)) continue;
    const info = await stat(resolved).catch(() => null);
    if (info?.isFile()) return { file: resolved, status: 200 };
  }
  const fallback = await stat(join(ROOT, "__spa-fallback.html")).catch(() => null);
  if (fallback?.isFile()) return { file: join(ROOT, "__spa-fallback.html"), status: 404 };
  return { file: join(ROOT, "index.html"), status: 404 };
}

createServer(async (req, res) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400, { "content-type": "text/plain" }).end("Invalid URL");
    return;
  }
  if (pathname.split(/[\\/]/).includes("..")) {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  const found = await locate(pathname);
  const type = TYPES[extname(found.file)] ?? "application/octet-stream";
  const compress = COMPRESSIBLE(type) && req.headers["accept-encoding"]?.includes("gzip");
  res.writeHead(found.status, {
    "content-type": type,
    "x-content-type-options": "nosniff",
    ...(compress ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}),
    "cache-control":
      found.file === "__spa-fallback.html" || type.startsWith("text/html")
        ? "no-cache"
        : /[.-][A-Za-z0-9_-]{8,}\.(js|css|woff2?)$/.test(found.file)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  try {
    if (compress) {
      await pipeline(createReadStream(found.file), createGzip(), res);
    } else {
      await pipeline(createReadStream(found.file), res);
    }
  } catch (error) {
    // Client aborts are the common case and stay silent; genuine IO failures
    // (EACCES, vanished file mid-stream) must not vanish without a trace.
    const code = (error as NodeJS.ErrnoException | null)?.code ?? "";
    if (!code.startsWith("ERR_STREAM_PREMATURE") && code !== "ECONNRESET" && code !== "EPIPE") {
      console.error(`[preview] stream failed for ${found.file}:`, error);
    }
    res.destroy();
  }
}).listen(PORT, () => console.log(`preview on http://localhost:${PORT}`));
