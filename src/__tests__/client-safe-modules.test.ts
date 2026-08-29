// Client-safe import-graph guard.
//
// Regression net for the `npm run dev` hard-crash class: a node-only package
// (e.g. reading-time's CJS entry → node:stream/util) sneaking into the browser
// graph. Rollup tree-shakes it away at build time and vitest runs in Node, so
// NEITHER gate catches it — only this static walk does.
//
// Walks every TS/TSX module under src/ (excluding test infra and type
// declarations), resolves relative/`@/` imports transitively from the client
// roots, and fails when the client graph reaches:
//   1. any `node:` builtin import
//   2. a known node-only package (ban list below)
//   3. src/lib/content-index.ts — the build-side scanner, node-only by design
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(process.cwd(), "src");
const EXCLUDED_DIRS = new Set(["__tests__", "test", "types"]);
const NODE_ONLY_MODULES = [join(SRC, "lib", "content-index.ts")];
const BANNED_PACKAGES = [
  "reading-time",
  "yaml",
  "satori",
  "@resvg/resvg-js",
  "shiki",
  "@shikijs",
  "@mdx-js",
  "gray-matter",
];

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (EXCLUDED_DIRS.has(name) && statSync(full).isDirectory()) continue;
    if (statSync(full).isDirectory()) walkFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function importsOf(file: string): string[] {
  // `import type` statements are erased by verbatimModuleSyntax — they never
  // reach the bundle, so the guard must not flag them.
  const src = readFileSync(file, "utf8").replace(/^\s*import\s+type\s[^;]*;?\s*$/gm, "");
  const specs = new Set<string>();
  for (const m of src.matchAll(/from\s+["']([^"']+)["']/g)) specs.add(m[1]);
  for (const m of src.matchAll(/import\s*\(\s*["']([^"']+)["']/g)) specs.add(m[1]);
  for (const m of src.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) specs.add(m[1]);
  return [...specs];
}

function resolveLocal(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return (
    candidates.find((c) => {
      try {
        return statSync(c).isFile();
      } catch {
        return false;
      }
    }) ?? null
  );
}

describe("client-safe import graph", () => {
  it("keeps node builtins, node-only packages and the build-side scanner out of the browser graph", () => {
    const offenders: string[] = [];
    const visited = new Set<string>();

    function visit(file: string, chain: string[]) {
      if (visited.has(file)) return;
      visited.add(file);
      for (const spec of importsOf(file)) {
        if (spec.startsWith("node:")) {
          offenders.push(`${spec} (imported by ${chain[chain.length - 1]})`);
          continue;
        }
        if (spec === "virtual:magpie-case-files") continue; // build-plugin virtual module
        const banned = BANNED_PACKAGES.find((pkg) => spec === pkg || spec.startsWith(`${pkg}/`));
        if (banned) {
          offenders.push(`${spec} (imported by ${chain[chain.length - 1]})`);
          continue;
        }
        const local = resolveLocal(spec, file);
        if (!local) continue;
        if (NODE_ONLY_MODULES.includes(local)) {
          offenders.push(`src/lib/content-index.ts reached via ${chain.join(" -> ")} -> ${spec}`);
          continue;
        }
        visit(local, [...chain, spec]);
      }
    }

    const libRoots = [
      "content.ts",
      "frontmatter.ts",
      "motion.ts",
      "site.ts",
      "rss.ts",
      "sitemap.ts",
      "code-themes.ts",
    ].map((name) => join(SRC, "lib", name));
    const roots = [
      ...walkFiles(join(SRC, "pages")),
      ...walkFiles(join(SRC, "components")),
      join(SRC, "root.tsx"),
      ...libRoots,
    ];
    for (const file of roots) visit(file, [file]);

    expect(offenders).toEqual([]);
  });
});
