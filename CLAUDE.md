# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**The Magpie Files (喜鹊档案)** — a single-page React 19 + Vite 7 + TypeScript design-system showcase modeled on the *Magpie Murders* TV main titles (HUGE Designs, 2022). It demonstrates a print/noir aesthetic: vermillion red vs. warm ink "worlds", aged paper, halftone, and offset print shadows.

**All UI/styling/motion decisions are governed by `.opencode/skills/magpie-design/SKILL.md`.** Read it before creating or restyling any component — it defines the palette rules (three colors only, no gradients/blur/radius), typography voices (Anton display / Crimson Pro body / Courier Prime machine), the shadcn restyle matrix, and motion budgets.

## Commands

```bash
npm run dev          # vite dev server
npm run build        # tsc -b && vite build (type errors fail the build)
npm run preview      # serve production build
npm run lint         # biome check .
npm run lint:fix     # biome check --write . (formatter + fixer)
npm run typecheck    # tsc -b --noEmit
npm test             # vitest run (all tests)
npx vitest run src/__tests__/showcase.test.tsx   # single file
npx vitest run -t "flips the world"              # single test by name
```

No storybook; `ShowcasePage` is itself the living style guide.

## Architecture

### Two-world theming pipeline

The defining mechanism spans three files:

1. `src/styles/tokens.css` defines physical tokens (`--paper`, `--ink`, `--red`, …) once under `:root/[data-world="red"]` and overrides `--bg/--fg/--accent/--surface/…` under `[data-world="black"]`.
2. `src/index.css` binds those variables into Tailwind v4 via `@theme inline` (e.g. `--color-primary: var(--accent)`), so utilities like `bg-background`, `text-stamp`, `shadow-print` resolve against whichever world applies at runtime. Custom utilities (`shadow-print*`, `text-outline`, `halftone`) also live here.
3. World state lives in `WorldProvider` (`src/components/motion/WorldWipe.tsx`) which writes `document.documentElement.dataset.world` and plays a full-screen clip-path wipe. `useWorld()` throws outside the provider (in App the provider wraps the router).

Sections may pin their own `data-world="red|black"` attribute to render in a fixed world regardless of the global toggle (EvidenceLocker pins `"black"`; CaseNotes, CounterSection, Footer pin `"red"`; Hero/RunningHead follow global state). Global state is flipped from the switch in `WorldDivider`.

### Component layers

- `src/components/ui/` — shadcn-style primitives on Radix behavior with custom cva variants. Strategy: **keep Radix behavior, replace the skin**; overrides go inside each component's cva variants, never ad-hoc classNames at call sites. New shadcn components should follow the matrix in the SKILL.md §6.
- `src/components/magpie/` — thematic primitives (ChapterHeading, ClueChip, Redacted, HalftoneImage, PaperGrain, BookSpine, MagpieCounter) plus `silhouettes.tsx`, a library of filled silhouette SVG motifs (Magpie, Manor, PenNib, Staircase, Teacup, FallingFigure). Filled silhouettes only; lucide icons only in small courier-meta contexts.
- `src/components/motion/` — Motion (framer's successor, imported from `motion/react`) primitives: AnagramText, TypewriterText, MorphIn, PageFlutter, StaggerList, WorldWipe. Shared durations/easings/springs live in `src/lib/motion.ts`; use its constants rather than inventing timing values. Motion budget: interactions ≤240ms, entrances ≤800ms.

### Conventions

- Path alias `@/*` → `src/*`.
- Fonts are self-hosted via `@fontsource` packages imported in `src/main.tsx`; never load webfont CDNs.
- `@fontsource/anton` imports bare package CSS in main.tsx; others select weight css files explicitly.
- Strict TS (`strict`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` → type-only imports must use `import type`) and `erasableSyntaxOnly` (no enums/namespaces).
- Biome is both formatter and linter (2-space, 100 col, organize imports): run `npm run lint:fix` before finishing. `useImportType` is an error-level rule.
- A global `prefers-reduced-motion` kill-switch sits at the bottom of `index.css`.

## Testing

Vitest with jsdom + React Testing Library. Config lives in `vite.config.ts` (`environment: "jsdom"`, `globals: true`, setup at `src/test/setup.ts`, css disabled during tests).

- `src/test/setup.ts` stubs `IntersectionObserver` (needed by scroll-driven motion components) and calls RTL `cleanup()` after each test.
- World-toggle tests rely on real timers: the `WorldProvider.toggle()` swaps worlds after a ~550ms half-wipe timeout, so assertions must wrap in `waitFor`.
