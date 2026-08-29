// src/root.tsx

import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@fontsource/anton";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/400-italic.css";
import "@fontsource/crimson-pro/600.css";
import "@fontsource/crimson-pro/700.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
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
