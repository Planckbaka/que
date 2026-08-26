---
name: magpie-design
description: "Magpie Murders (喜鹊谋杀案) opening-titles design system governing EVERY UI decision in this repo. Use when creating/styling/animating any React + Tailwind + shadcn component, page, or motion — triggers: 喜鹊, magpie, theme, tokens, palette, split-screen, anagram, typewriter, evidence, case-file, mystery UI."
---

# MAGPIE DESIGN SYSTEM

> Distilled from the _Magpie Murders_ main titles (HUGE Designs, 2022): a stark three-color print aesthetic where two inverted worlds tell one story.

## 1. Design Philosophy — Five Laws

1. **Two Worlds, One Story** — every screen belongs to the RED WORLD (reality/the author) or the BLACK WORLD (fiction/the detective). The same objects appear in both; only the palette inverts. Alternate worlds between sections to create narrative rhythm.
2. **Three Colors, Zero Gradients** — vermillion red, warm ink black, aged paper cream. Depth comes from halftone, overlap, and hard offset print shadows — never gradients, glows, or blur.
3. **Scale Play** — pair the macro with the monumental: a typewriter key fills the viewport, then cuts to a full staircase. One monumental element per view minimum.
4. **Everything Transforms** — objects morph across boundaries (bell→typewriter key, pen→sword, body→books). Elements crossfade-and-scale into their next state; they never pop.
5. **Cozy, Not Grim** — murder rendered with wit: anagrams, hidden magpies, redacted jokes, nursery-rhyme counters.

## 2. Color Tokens (`src/styles/tokens.css`)

| Token       | Value   | Usage                                  |
| ----------- | ------- | -------------------------------------- |
| --paper     | #F3EEE3 | backgrounds (aged paperback)           |
| --paper-dim | #E7DFCC | alternate surfaces                     |
| --ink       | #17120C | text/borders; BLACK-WORLD background   |
| --red       | #C8281E | RED-WORLD bg, primary actions, stamps  |
| --red-bright| #E03A24 | hover/active                           |

**World themes** — set via `data-world` attribute on `<html>` OR any section wrapper:

```css
[data-world="red"] {
  --bg: #c8281e;
  --fg: #f6f1e5;
  --accent: #17120c;
  --surface: #f3eee3;
  --on-surface: #17120c;
}
[data-world="black"] {
  --bg: #14100b;
  --fg: #f6f1e5;
  --accent: #e03a24;
  --surface: #221b14;
  --on-surface: #f3eee3;
}
```

Map into shadcn semantics via Tailwind v4 `@theme inline` (--background/--foreground/--primary/--card...). Rules: never introduce a 4th hue · neutrals only via ink/paper opacity · body text must be ink-on-paper or paper-on-ink (red = display/fills/accents only) · focus ring = 2px dashed `--fg`.

## 3. Typography (@fontsource self-hosted)

| Voice   | Font          | Rules                                                |
| ------- | ------------- | ---------------------------------------------------- |
| Display | Anton         | UPPERCASE, tracking -0.02em, titles/chapter numerals |
| Body    | Crimson Pro   | measure ≤ 68ch, book-like                            |
| Machine | Courier Prime | UPPERCASE meta labels, tracking +0.14em              |

Fluid scale: display clamp(3rem, 8vw, 8rem) · h2 1.75–2.5rem · body 1–1.125rem · micro .75rem.
Signatures: oversized outlined chapter numeral behind headings (-webkit-text-stroke, transparent fill) · red Anton drop cap floating 3 lines · page furniture (running heads, folio numbers, hairlines).

**Anagram Rule**: names may mount scrambled→resolve. Scramble-once-on-mount only; never scramble functional text mid-interaction.

## 4. Layout

- 12-col grid, max-w-[76rem]; 8px vertical baseline.
- **Center-line symmetry**: mirror compositions across a vertical 2px ink rule — the seam where both worlds meet (split heroes, dual personas, before/after).
- **Macro↔wide rhythm**: dense hero → airy text; alternate intimacy and monumentality.
- Page furniture on every view: running head, folio bottom-outer, 1px hairline rules @ 40%.
- `rounded-none` everywhere (`--radius: 0`). Radius banned except `rounded-full` dots/seals.

## 5. Motion System (`src/lib/motion.ts`, engine = Motion)

durations: snap 140 · beat 240 · drift 480 · settle 800 · cinematic 1100 (ms)
easing: EASE_PRINT cubic-bezier(.2,0,0,1) · EASE_PLUMMET cubic-bezier(.55,0,1,.45) · typewriter = steps(1)
spring: { stiffness: 260, damping: 26 }

Reusable primitives (`src/components/motion/`):

1. `<AnagramText>` letters mount shuffled → resolve left→right, beat per letter
2. `<TypewriterText>` types char-by-char, blinking block caret; instant under reduced-motion
3. `<WorldWipe>` world change via center-line clip-path wipe (~700ms), never fade
4. `<MorphIn>` enter: scale .85→1 + rotate ±2° + fade, ease-print
5. `<PageFlutter>` decorative pages drift (y+rotate loop 12–18s linear)
6. `<StaggerList>` children cascade 60ms apart with MorphIn

Scroll: parallax on monumental elements only (≤2 per view).
Hard rules: interactions ≤240ms · entrances ≤800ms · prefers-reduced-motion kills transforms (opacity-only ≤160ms) · never animate hue/gradients.

## 6. shadcn Customization Matrix

Strategy: **keep Radix behavior, replace every skin.** Overrides live inside each component's cva variants — never ad-hoc className at call sites.

Base layer: hard offset print shadows `.shadow-print{4px}` / `-sm{3px}` / `-lg{6px}` (solid ink) with hover lift / press sink · 2px solid ink borders · zero radius.

| shadcn       | Restyle as                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| Button       | stamp(red block)·ink(black block)·outline(paper)·type(courier link); uppercase courier label |
| Card         | evidence(tag-hole corner)·file(paper-dim)·clipping(forced newsprint light)      |
| Tabs         | folder tabs sitting on a rule edge; active = 4px stamp-red top bar + card fill  |
| Dialog/Sheet | case-file folder; header carries rotated rubber-stamp mark                      |
| Tooltip      | numbered footnote card                                                          |
| Badge        | evidence tag: punched hole dot + courier code (EXHIBIT A-113)                   |
| Input        | typewriter field: transparent, 2px bottom rule, stamp-red caret                 |
| Skeleton     | redaction bars: solid ink blocks (never gray pulse)                             |
| Switch       | world toggle: half-red/half-black knob crossing center line                     |
| Table        | case log ledger: ruled lines, courier cells                                     |
| Toast        | memo slip with red staple bar                                                   |
| Avatar       | ink silhouette bust placeholder (no photos)                                     |

Custom primitives (`src/components/magpie/`): MagpieCounter (「one for sorrow…」tally), BookSpine (vertical label), ChapterHeading, ClueChip, HalftoneImage (CSS dot-pattern duotone), PaperGrain (feTurbulence ~4%), Redacted (hover-to-reveal spoilers), silhouettes.tsx (filled SVG motif library).

## 7. Iconography & Imagery

Filled silhouette SVGs only — no stroke icons for motifs, no raw photography (all images pass through HalftoneImage). Lucide allowed only at small sizes inside courier-meta contexts. Motif library: magpie, typewriter key, pen nib, staircase, manor facade split by center line, falling figure, fluttering page, magnifier. Plant one Easter egg per major view.

## 8. Do / Don't

DO alternate worlds between sections · DO monumental whitespace · DO witty terse copy.
DON'T gradients/glass/blur · DON'T rounded corners · DON'T a 4th color · DON'T emoji in UI · DON'T center-everything (use asymmetric editorial balance).

## 9. File Index

```
src/styles/tokens.css        world/color tokens
src/index.css                tailwind entry, @theme inline mapping, base layer
src/lib/motion.ts            motion tokens
src/lib/utils.ts             cn()
src/components/motion/*      §5 primitives
src/components/magpie/*      §6 customs + silhouettes
src/components/ui/*          customized shadcn (Radix behavior kept)
```
