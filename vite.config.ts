// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // reactRouter() emits an HMR preamble that vitest cannot detect; load it conditionally so
  // dev/build keep RRv7 framework mode while tests run on plain vite (components import directly).
  plugins: [...(process.env.VITEST ? [] : [reactRouter()]), tailwindcss()],
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
