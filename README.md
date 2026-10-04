# The Magpie Files (喜鹊档案)

Personal blog of **Orion Arch** — Python & Go backend engineering notes wrapped in a
print/noir "case files" aesthetic, built on React 19 + React Router v7 framework mode
(`ssr: false` + prerender), Tailwind v4, and MDX.

## Commands

```bash
npm install          # Node >= 22.18 (the preview/publication scripts use TS type stripping)
npm run dev          # dev server (HMR)
npm run build        # tsc → RRv7 build → pagefind → scripts/check-publication.ts release gate
npm run preview      # serve build/client with CDN-like directory-index behavior
npm run lint         # biome check .
npm run typecheck    # tsc -b --noEmit
npm test             # vitest
npm run test:browser # playwright gate: drives every motion primitive in the real build
```

## How it fits together

- **Content**: `content/files/*.mdx` is the single source of truth. One Zod schema
  validates it; drafts are excluded before any import is generated, and
  `check-publication.ts` fails the build if a draft slug/title leaks into any artifact.
- **Reading**: article metadata ships in the entry chunk; bodies load per slug on
  demand. Prerendered HTML always contains full text (pagefind indexes it; no-JS
  readers get it). Articles gain heading anchors, a TOC, and tag-based related reads.
- **Design law**: `.opencode/skills/magpie-design/SKILL.md` — 3-color palette, no
  gradients/blur/radius, motion budgets. Read it before styling anything.
- **Guides for agents**: `AGENTS.md` (quick reference) and `CLAUDE.md` (longer
  architecture notes, including the `app/ ⇄ src/` shim arrangement and hard-won
  gotchas).

## Release checklist

1. `npm run build` must pass — it includes the publication gate (draft leakage,
   image derivatives, OG cards, RSS/sitemap counts, anchors, canonicals).
2. `npm run test:browser` for the full production browser regression.
3. Unknown paths return the SPA fallback with HTTP 404 locally (`preview`) and on
   Cloudflare Pages via `public/_redirects`.
4. `src/lib/site.ts` still pins a placeholder origin (`themagpiefiles.pages.dev`) —
   swap in the production domain before launching; canonical/OG/RSS/sitemap all
   derive from it.

## Deploying (Cloudflare Pages)

Build command `npm run build`, output directory `build/client`. `public/_redirects`
makes unmatched paths serve `__spa-fallback.html` with a true 404 status.
