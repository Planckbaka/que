// One-command browser gate: serves the current build and drives every motion
// primitive via scripts/animation-check.mjs. Requires `npm run build` first
// (and the playwright devDep + system Chrome).
//   npm run build && npm run test:browser
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const PORT = 4180;
const URL = `http://localhost:${PORT}`;

if (!existsSync(resolve(process.cwd(), "build/client/index.html"))) {
  console.error("no build found — run `npm run build` first");
  process.exit(2);
}

// scripts/preview.mjs (not `vite preview`): nested prerendered routes need
// directory-index serving — vite preview returns the ROOT page for /lab etc.,
// which hydration-mismatches and throws the prerendered tree away.
const server = spawn("node", ["scripts/preview.ts"], {
  stdio: "ignore",
  env: { ...process.env, PORT: String(PORT) },
});
const cleanup = () => server.kill();
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));

let up = false;
for (let i = 0; i < 40 && !up; i++) {
  await new Promise((r) => setTimeout(r, 250));
  up = await fetch(URL)
    .then((r) => r.ok)
    .catch(() => false);
}
if (!up) {
  console.error("preview server failed to start");
  process.exit(2);
}

const child = spawn("node", ["scripts/animation-check.mjs", URL], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 1));
