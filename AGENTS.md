# AGENTS.md

**The Magpie Files (喜鹊档案)** — personal blog, React 19 + React Router v7 framework mode (`ssr: false` + prerender), Tailwind v4, MDX content, print/noir aesthetic.

**Read before styling anything:** `.opencode/skills/magpie-design/SKILL.md` is the design law (3-color palette, no gradients/blur/radius, motion budgets). It overrides all visual judgment. `CLAUDE.md` has a longer architecture write-up; `docs/superpowers/plans/` holds the P0–P4 phase plans.

## Commands

```bash
npm run dev          # react-router dev (HMR)
npm run build        # tsc -b && react-router build && pagefind && node scripts/check-publication.ts
npm run preview      # node scripts/preview.ts  (NOT vite preview — see gotchas)
npm run lint         # biome check .
npm run lint:fix     # biome check --write . — run before finishing
npm run typecheck    # tsc -b --noEmit
npm test             # vitest run  (single file: npx vitest run src/__tests__/showcase.test.tsx)
npm run test:browser # playwright gate: serves build/client, drives every motion primitive
```

`build/` and `.react-router/` are generated artifacts (git-ignored).

## Architecture boundaries

- **app/ ⇄ src/ shims (don't delete):** the RRv7 Vite plugin hardcodes `appDirectory: "app"`. Canonical code lives in `src/`; `app/root.tsx`, `app/routes.ts`, `app/entry.server.tsx` are thin shims/re-exports into `src/` (entry.server is prerender-only, no @react-router/node dep). Route map: `SeoLayout` wraps `/` (Showcase), `/files`, `/files/:slug`, `/lab`, `/about`; catch-all → NotFoundRedirect. After touching the shim chain, rerun `npm run typecheck` — tsc coverage of `app/**` lives in `tsconfig.node.json`.
- **Two-world theming:** `src/styles/tokens.css` (physical tokens) → `src/index.css` (`@theme inline` binds them to Tailwind) → `data-world="red|black"` on `<html>` via `WorldProvider`. Root provider tree in `src/root.tsx`: WorldProvider > SmoothScroll > VeilProvider > Outlet + VeilOverlay.
- **Content pipeline:** `content/files/*.mdx` is the single source of truth. One Zod schema (`src/lib/frontmatter.ts`) validates both readers. Node side `src/lib/content-index.ts` feeds the prerender list, OG/RSS/sitemap output, and the virtual module (plugin in `scripts/magpie-content.ts`). Client side `src/lib/content.ts` uses `import.meta.glob`. `scripts/magpie-pipeline.ts` (Vite closeBundle) writes `build/client/og/*.png`, `rss.xml`, `sitemap.xml`, and strips `modulepreload` links from prerendered HTML (FCP work — don't undo).
- **Component layers:** `src/components/ui/` (shadcn-on-Radix; styling overrides go in cva variants, never ad-hoc classNames at call sites), `src/components/magpie/` (thematic primitives + `silhouettes.tsx`), `src/components/motion/` (motion/react primitives: SmoothScroll/Lenis, Veil route-wipe, AnagramText/TypewriterText, ReadingFolio…). Shared pure helpers and motion tokens live in `src/lib/motion.ts` (SSR-safe).
- `src/lib/api.ts` is the `/api/*` seam (mock bindings today, Go service later).

## Hard-won gotchas

- **Client-safe module rule:** anything imported by `src/lib/content.ts` / `frontmatter.ts` ships to the browser — **no node-only deps there** (`reading-time` pulls `node:stream` and hard-crashes dev). Reading minutes reach the client via the virtual module. Rollup hides this class of bug at build time — **always smoke `npm run dev` too**. `src/__tests__/client-safe-modules.test.ts` guards the graph.
- **Preview:** `npm run preview` runs `scripts/preview.ts`, which serves `build/client` with directory-index resolution. Plain `vite preview` serves root `index.html` for nested routes → hydration mismatch (#418) and remounted animations.
- **Pagefind search** (`src/lib/pagefind.ts`) fetch-probes `/pagefind/pagefind.js` before dynamic import — the index only exists in build output; a missing index must throw cleanly, not crash module loading.
- **Draft discipline:** `scripts/check-publication.ts` (part of `npm run build`) fails if any draft slug/title leaks into build artifacts, or if published article HTML is missing anchors/canonical or still shows the streamed fallback.
- **Reduced motion:** the global CSS kill-switch at the bottom of `index.css` covers CSS animations only, **not** JS Motion springs — every motion component must degrade itself via `prefersReducedMotion()` (`src/lib/motion.ts`).
- **World-scoped CSS:** Tailwind `@theme inline` vars freeze at `:root` — custom CSS must reference the underlying token (`var(--line)`, not `var(--color-line)`). Cards need the `.on-card` scope; world-scoped sections must paint `bg-background` or light text lands on a parent's red. Shiki dark-world flip needs `!important` (inline styles beat plain stylesheet rules).
- **Fonts:** self-hosted via `@fontsource`, imported in `src/root.tsx` (there is no `main.tsx`).
- **Route meta:** root owns only the default title; every leaf route ships its own title + description + `socialMeta(...)` to avoid duplicate description tags.
- **TS strictness:** `verbatimModuleSyntax` (use `import type`) + `erasableSyntaxOnly` (no enums). Biome is linter + formatter (2-space, 100 col, `useImportType` is error). Path alias `@/*` → `src/*`.
- **Vitest:** config sits in `vite.config.ts`; the reactRouter plugin is excluded when `VITEST` is set; jsdom setup stubs IntersectionObserver. Motion components have dedicated hydration/reduced-motion test files — mirror that pattern for new primitives.
- **Mobile:** `html/body { overflow-x: clip }` guards decorative bleed; check full-page screenshots at 390px when adding wide sections.
