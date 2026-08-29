# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**The Magpie Files (喜鹊档案)** — personal blog universe of Orion Arch, grown out of a React 19 + TypeScript design-system showcase modeled on the *Magpie Murders* TV main titles (HUGE Designs, 2022): print/noir aesthetic, vermillion red vs. warm ink "worlds", aged paper, halftone, hard offset print shadows.

**All UI/styling/motion decisions are governed by `.opencode/skills/magpie-design/SKILL.md`.** Read it before creating or restyling any component — palette law (three colors, no gradients/blur/radius), typography voices, the shadcn restyle matrix, motion budgets.

## Commands

```bash
npm run dev          # react-router dev (framework mode, HMR)
npm run build        # tsc -b && react-router build && pagefind --site build/client
                     # -> build/client: 8 prerendered pages + og/ rss.xml sitemap.xml robots.txt pagefind/
npm run preview      # vite preview --outDir build/client
npm run lint         # biome check .
npm run lint:fix     # biome check --write . (formatter + fixer)
npm run typecheck    # tsc -b --noEmit
npm test             # vitest run
npx vitest run src/__tests__/showcase.test.tsx   # single file
node scripts/animation-check.mjs [baseURL]       # drive every motion primitive in a real browser (needs `npx vite preview`/`npm run dev` + playwright devDep)
```

Note: `build/` and `.react-router/` are generated artifacts (git-ignored).

## Architecture

### RRv7 framework mode with app/ ⇄ src/ shims

Migration history detail that matters daily: the Vite plugin **requires** an `app/` directory (`appDirectory` is hardcoded to `"app"` inside @react-router/dev). This repo keeps canonical implementations under `src/` and forwards through thin shims:

- `app/root.tsx` — one-line re-export of `src/root.tsx` (the real root: `<html data-world="red">` Layout shell + provider tree).
- `app/routes.ts` — route map: `layout(pages/SeoLayout)` wraps index(ShowcasePage), `files`(FilesPage), `files/:slug`(FilePage), `lab`(LabPage), `about`(AboutPage); catch-all `*` → NotFoundRedirect.
- `app/entry.server.tsx` — minimal prerender-only renderer (`renderToReadableStream`, node builtins only; no @react-router/node runtime dep).
- `react-router.config.ts` — `ssr: false`; async `prerender` scans `content/files/*.mdx` (draft-aware) and returns `/`, `/files`, `/lab`, `/about` + published `/files/:slug` paths.
- Type coverage of `app/**` lives in `tsconfig.node.json` include — the re-export chain pulls route modules into both tsc programs.

⚠️ Do not casually delete the shims or reorder this chain without rerunning `npm run typecheck`; coverage paths are interdependent.

### Two-world theming pipeline

1. `src/styles/tokens.css` defines physical tokens once under `:root/[data-world="red"]`, overrides semantic tokens under `[data-world="black"]`.
2. `src/index.css` binds them into Tailwind v4 via `@theme inline` (`--color-primary: var(--accent)` …), so utilities resolve against whichever world applies. Custom utilities: `shadow-print*`, `text-outline`, `halftone`.
3. Global world state: `WorldProvider` (`src/components/motion/WorldWipe.tsx`) writes `document.documentElement.dataset.world` and plays a 550ms half-wipe overlay. Sections pin their own `data-world` to opt out of the toggle.

Root provider tree (in `src/root.tsx`): `WorldProvider > SmoothScroll > VeilProvider > (Outlet + VeilOverlay)`.

### Content pipeline (P2) and pages (P3)

- Single source of truth = `content/files/*.mdx`. One Zod schema (`src/lib/frontmatter.ts`: title/kicker/world/tags/summary/date/draft + slug rule + reading minutes) validates BOTH content readers — a bad file fails the build with its filename.
- Node side `src/lib/content-index.ts` (fs scan): feeds `react-router.config.ts` prerender list, the OG/RSS/sitemap pipeline, and the `magpieCaseFiles` virtual module (vite plugin in `scripts/magpie-content.ts`) that hands reading times to the client bundle.
- Client side `src/lib/content.ts` (`import.meta.glob` eager + schema parse): exposes `articles` / `publishedArticles` / `getArticle` / `groupByWorld` for route modules.
- `scripts/magpie-pipeline.ts` (Vite plugin, closeBundle): writes `build/client/og/{slug,index}.png` (satori+resvg), `rss.xml`, `sitemap.xml`, `robots.txt`, and strips `modulepreload` links from prerendered HTML (they flood the critical window; FCP 3.3s→2.1s — the Veil covers navigation latency).
- MDX compiles via `@mdx-js/rollup` in `vite.config.ts` with remark frontmatter export + `@shikijs/rehype` dual themes (`src/lib/code-themes.ts`, palette-audited). Vocabulary (`Redacted/ClueChip/HalftoneImage/ExhibitCard`) injects via `components` prop from `src/components/mdx/article-components.tsx`.
- Shiki dark-world flip: compiled HTML carries `--shiki-dark` vars; `[data-world="black"] .shiki` overrides with `!important` (inline styles beat plain stylesheet rules).
- Pages: ShowcasePage (cover + demo sections + latest-files entry), FilesPage (archive wall, world-weighted), FilePage (reading template: folio + chapter numeral + giscus slot), LabPage, AboutPage — all under `SeoLayout`.
- `src/lib/api.ts` is the `/api/*` seam (D4): mock bindings today, real Go service later.

### Component layers

- `src/components/ui/` — shadcn-style primitives on Radix behavior; overrides live inside each component's cva variants, never ad-hoc classNames at call sites.
- `src/components/magpie/` — thematic primitives (ChapterHeading, ClueChip, Redacted, HalftoneImage, PaperGrain, BookSpine, MagpieCounter) + `silhouettes.tsx` filled-SVG motif library.
- `src/components/motion/` — `motion/react` primitives: AnagramText (seeded deterministic scramble — SSG-safe), TypewriterText, MorphIn, PageFlutter, StaggerList, plus P0 foundation pieces:
  - `SmoothScroll.tsx` — Lenis mount (`duration: 0.8`), exposes `useSmoothScroll(): Lenis | null`; skips entirely under prefers-reduced-motion; intercepts `a[href^="#"]` with `scrollTo(el, { offset: -72 })`.
  - `Veil.tsx` — route-wipe transition: `VeilProvider` / `useVeil().travel(to)` / `LinkUnderVeil` / `VeilOverlay`; 550ms cover→navigate→reveal, ink `#17120c`, busy-guarded; `data-covering` attribute for tests.
  - P1: `PressTape` (aria-label carries the accessible copy — an sr-only row once fought `w-max` and pushed the document 146px past the viewport), `CenterSeam`, `HorizontalRail`, `HalftoneReveal` (`src/components/magpie/`).
  - P3: `ReadingFolio` (fixed bottom-left page counter, `role="progressbar"`) and `ChapterNumeral` (outlined scroll-parallax numeral; static under reduced motion).
- Shared motion tokens and pure mappers (`railShift`, `clampPct`, `folioPage`, `romanNumeral`, `prefersReducedMotion` — SSR-safe, guards `typeof window`) stay in `src/lib/motion.ts`.

### Conventions

- Path alias `@/*` → `src/*`. Biome is linter+formatter (2-space, 100 col, `useImportType` error). Run `lint:fix` before finishing.
- Strict TS + `verbatimModuleSyntax` (use `import type`) + `erasableSyntaxOnly` (no enums).
- Fonts self-hosted via `@fontsource` — **imports live in `src/root.tsx`** (not main.tsx; that file no longer exists).
- vitest config sits in `vite.config.ts` and conditionally excludes the reactRouter plugin when `VITEST` env is set; jsdom + RTL setup stubs IntersectionObserver.
- A global `prefers-reduced-motion` CSS kill-switch sits at the bottom of `index.css`; it covers CSS animations/transitions but **not** JS-driven Motion springs/tweens — components must declare their own degradation (`prefersReducedMotion()` is the shared probe).
- World-scoped gotchas learned the hard way: Tailwind `@theme inline` vars freeze at `:root` (custom CSS must reference the underlying token — `var(--line)`, not `var(--color-line)`); cards need the `.on-card` scope so muted labels flip with the card surface; world-scoped sections must paint `bg-background` or light text lands on a parent's red.
- Route `meta()` exports: root owns only the default title; every leaf ships its own title + description + `socialMeta(...)` (OG/Twitter) to avoid duplicate description tags.
- Mobile: `html/body { overflow-x: clip }` guards against decorative bleed; verify full-page screenshot widths at 390px when adding monuments.
- Client-safe module rule: anything imported by `src/lib/content.ts`/`frontmatter.ts` ships to the browser — no node-only deps there (reading-time's CJS entry pulls `node:stream/util` and hard-crashes `npm run dev`; it lives in `content-index.ts`, and reading minutes reach the client via the virtual module). Rollup hides this class of bug at build time — **always smoke `npm run dev` too**.
