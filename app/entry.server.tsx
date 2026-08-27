// app/entry.server.tsx - hand-written so the pure SPA carries neither @react-router/node nor
// isbot as unused runtime deps; runs at build time only (ssr:false + prerender of "/").
// Uses renderToReadableStream so the response body is already a web ReadableStream.
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  // Timeout guard: if rendering hangs, the abort fires and the awaited promise / allReady
  // rejects, so static generation fails explicitly instead of emitting a half-built HTML.
  const signal = AbortSignal.timeout(10_000);
  const stream = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal,
      // Post-shell render errors must be logged (pre-shell errors surface via the await above).
      onError(error) {
        console.error(error);
      },
    },
  );
  // SPA-mode static generation must wait for all content (not just the shell).
  await stream.allReady;
  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
