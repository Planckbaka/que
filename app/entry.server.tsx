// app/entry.server.tsx - hand-written against node builtins so the pure SPA carries neither
// @react-router/node nor isbot as unused runtime deps; runs at build time only (ssr:false + prerender).
import { PassThrough, Readable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    let settled = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        // SPA-mode static generation must wait for all content (not just the shell).
        onAllReady() {
          settled = true;
          const body = new PassThrough();
          resolve(
            new Response(Readable.toWeb(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onError(error: unknown) {
          if (settled) {
            console.error(error);
            return;
          }
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      },
    );
    setTimeout(() => abort(), streamTimeout + 1000);
  });
}
