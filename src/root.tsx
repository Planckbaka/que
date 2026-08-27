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
import { WorldProvider } from "@/components/motion/WorldWipe";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-world="red">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#C8281E" />
        <meta
          name="description"
          content="The Magpie Files — engineering notes and algorithm case files by Orion Arch."
        />
        <title>The Magpie Files · 喜鹊档案</title>
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
      <Outlet />
    </WorldProvider>
  );
}
