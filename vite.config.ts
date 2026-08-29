// vite.config.ts

import { fileURLToPath, URL } from "node:url";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import rehypeShiki from "@shikijs/rehype";
import tailwindcss from "@tailwindcss/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vitest/config";
import { inkTheme, paperTheme } from "./src/lib/code-themes";

export default defineConfig({
  // reactRouter() emits an HMR preamble that vitest cannot detect; load it conditionally so
  // dev/build keep RRv7 framework mode while tests run on plain vite (components import directly).
  // The mdx pipeline stays active in both modes: content tests import seeded case files.
  // RRv7 requires @mdx-js/rollup to precede the react-router plugin.
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: { light: paperTheme, dark: inkTheme },
            defaultColor: "light",
            langs: [
              "typescript",
              "tsx",
              "javascript",
              "jsx",
              "go",
              "python",
              "bash",
              "json",
              "css",
              "html",
              "text",
            ],
            fallbackLanguage: "text",
          },
        ],
      ],
    }),
    ...(process.env.VITEST ? [] : [reactRouter()]),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
