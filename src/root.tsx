// src/root.tsx

import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@fontsource/anton/latin-400.css";
import "@fontsource/crimson-pro/latin-400.css";
import "@fontsource/crimson-pro/latin-400-italic.css";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-700.css";
// The hero headline sets LCP; put its face in the critical chain's first hop.
import antonUrl from "@fontsource/anton/files/anton-latin-400-normal.woff2?url";
import "./index.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { VeilOverlay, VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";

// Default title only — every leaf route owns its own title/description meta so
// the prerendered pages never emit duplicate description tags.
export function meta() {
  return [{ title: "The Magpie Files · 喜鹊档案" }];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-world="red">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#C8281E" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='16' height='32' fill='%23c8281e'/%3E%3Crect x='16' width='16' height='32' fill='%2317120c'/%3E%3Ccircle cx='16' cy='16' r='4' fill='%23f3eee3'/%3E%3C/svg%3E"
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
