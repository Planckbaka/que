// src/root.tsx

import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@fontsource/anton/latin-400.css";
import "@fontsource/crimson-pro/latin-400.css";
import "@fontsource/crimson-pro/latin-400-italic.css";
// True bold for prose — without it <strong> renders as synthesized faux-bold.
import "@fontsource/crimson-pro/latin-700.css";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-700.css";
// The hero headline sets LCP; put its face in the critical chain's first hop.
import antonUrl from "@fontsource/anton/files/anton-latin-400-normal.woff2?url";
import "./index.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { VeilOverlay, VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { site } from "@/lib/site";

// Default title only — every leaf route owns its own title/description meta so
// the prerendered pages never emit duplicate description tags.
export function meta() {
  return [{ title: "Orion Arch · Engineering Notes" }];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-world="red">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#C8281E" />
        <link rel="icon" type="image/svg+xml" href="/orion-mark.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* RSS autodiscovery — feed readers and browsers surface the subscription
            button only when the head advertises the feed. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={site.title}
          href={`${site.url}/rss.xml`}
        />
        <link rel="preload" href={antonUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <WorldProvider>
      <SmoothScroll>
        <VeilProvider>
          <Outlet />
          <VeilOverlay />
        </VeilProvider>
      </SmoothScroll>
    </WorldProvider>
  );
}
