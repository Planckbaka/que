# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**The Magpie Files (喜鹊档案)** — personal blog universe of Orion Arch, grown out of a React 19 + TypeScript design-system showcase modeled on the *Magpie Murders* TV main titles (HUGE Designs, 2022): print/noir aesthetic, vermillion red vs. warm ink "worlds", aged paper, halftone, hard offset print shadows.

**All UI/styling/motion decisions are governed by `.opencode/skills/magpie-design/SKILL.md`.** Read it before creating or restyling any component — palette law (three colors, no gradients/blur/radius), typography voices, the shadcn restyle matrix, motion budgets.

## Commands

```bash
npm run dev          # react-router dev (framework mode, HMR)
npm run build        # tsc -b && react-router build -> build/client (prerendered "/" SPA shell)
npm run preview      # vite preview --outDir build/client
npm run lint         # biome check .
npm run lint:fix     # biome check --write . (formatter + fixer)
npm run typecheck    # tsc -b --noEmit
npm test             # vitest run
npx vitest run src/__tests__/showcase.test.tsx   # single file
```

Note: `build/` and `.react-router/` are generated artifacts (git-ignored).

## Architecture

### RRv7 framework mode with app/ ⇄ src/ shims

Migration history detail that matters daily: the Vite plugin **requires** an `app/` directory (`appDirectory` is hardcoded to `"app"` inside @react-router/dev). This repo keeps canonical implementations under `src/` and forwards through thin shims:

- `app/root.tsx` — one-line re-export of `src/root.tsx` (the real root: `<html data-world="red">` Layout shell + provider tree).
- `app/routes.ts` — holds the actual route map (`index → pages/ShowcasePage`, `* → pages/NotFoundRedirect`); `src/routes.ts` re-exports it.
- `app/entry.server.tsx` — minimal prerender-only renderer (`renderToReadableStream`, node builtins only; no @react-router/node runtime dep).
- `react-router.config.ts` — `ssr: false` + `prerender: ["/"]`; output lands in `build/client`.
- Type coverage of `app/**` lives in `tsconfig.node.json` include — the re-export chain pulls route modules into both tsc programs.

⚠️ Do not casually delete the shims or reorder this chain without rerunning `npm run typecheck`; coverage paths are interdependent.

### Two-world theming pipeline

1. `src/styles/tokens.css` defines physical tokens once under `:root/[data-world="red"]`, overrides semantic tokens under `[data-world="black"]`.
2. `src/index.css` binds them into Tailwind v4 via `@theme inline` (`--color-primary: var(--accent)` …), so utilities resolve against whichever world applies. Custom utilities: `shadow-print*`, `text-outline`, `halftone`.
3. Global world state: `WorldProvider` (`src/components/motion/WorldWipe.tsx`) writes `document.documentElement.dataset.world` and plays a 550ms half-wipe overlay. Sections pin their own `data-world` to opt out of the toggle.

Root provider tree (in `src/root.tsx`): `WorldProvider > SmoothScroll > VeilProvider > (Outlet + VeilOverlay)`.

### Component layers

- `src/components/ui/` — shadcn-style primitives on Radix behavior; overrides live inside each component's cva variants, never ad-hoc classNames at call sites.
- `src/components/magpie/` — thematic primitives (ChapterHeading, ClueChip, Redacted, HalftoneImage, PaperGrain, BookSpine, MagpieCounter) + `silhouettes.tsx` filled-SVG motif library.
- `src/components/motion/` — `motion/react` primitives: AnagramText (seeded deterministic scramble — SSG-safe), TypewriterText, MorphIn, PageFlutter, StaggerList, plus P0 foundation pieces:
  - `SmoothScroll.tsx` — Lenis mount (`duration: 0.8`), exposes `useSmoothScroll(): Lenis | null`; skips entirely under prefers-reduced-motion; intercepts `a[href^="#"]` with `scrollTo(el, { offset: -72 })`.
  - `Veil.tsx` — route-wipe transition: `VeilProvider` / `useVeil().travel(to)` / `LinkUnderVeil` / `VeilOverlay`; 550ms cover→navigate→reveal, ink `#17120c`, busy-guarded; `data-covering` attribute for tests.
- Shared motion tokens stay in `src/lib/motion.ts`.

### Conventions

- Path alias `@/*` → `src/*`. Biome is linter+formatter (2-space, 100 col, `useImportType` error). Run `lint:fix` before finishing.
- Strict TS + `verbatimModuleSyntax` (use `import type`) + `erasableSyntaxOnly` (no enums).
- Fonts self-hosted via `@fontsource` — **imports live in `src/root.tsx`** (not main.tsx; that file no longer exists).
- vitest config sits in `vite.config.ts` and conditionally excludes the reactRouter plugin when `VITEST` env is set; jsdom + RTL setup stubs IntersectionObserver.
- A global `prefers-reduced-motion` CSS kill-switch sits at the bottom of `index.css`; it covers CSS animations/transitions but **not** JS-driven Motion springs/tweens — components must declare their own degradation (SmoothScroll does; Veil does not yet — see ledger).
