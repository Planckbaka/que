// Diagnostic build: non-minified React in the PRERENDERED output, so React
// prints full hydration diffs (component trees, +/- lines) instead of
// "Minified React error #418". Not for shipping — run via:
//   npx react-router build --config vite.devbuild.config.ts
import { mergeConfig } from "vite";
import base from "./vite.config.ts";

export default mergeConfig(base, {
  mode: "development",
  build: { minify: false },
  define: { "process.env.NODE_ENV": '"development"' },
});
