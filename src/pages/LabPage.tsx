import { ClueChip } from "@/components/magpie/ClueChip";
import { ExhibitCard } from "@/components/magpie/ExhibitCard";
import { HalftoneImage } from "@/components/magpie/HalftoneImage";
import { Magpie } from "@/components/magpie/silhouettes";
import { AnagramText } from "@/components/motion/AnagramText";
import { CenterSeam } from "@/components/motion/CenterSeam";
import { ChapterNumeral } from "@/components/motion/ChapterNumeral";
import { HorizontalRail } from "@/components/motion/HorizontalRail";
import { MorphIn } from "@/components/motion/MorphIn";
import { PageFlutter } from "@/components/motion/PageFlutter";
import { PressTape } from "@/components/motion/PressTape";
import { ReadingFolio } from "@/components/motion/ReadingFolio";
import { StaggerList } from "@/components/motion/StaggerList";
import { TypewriterText } from "@/components/motion/TypewriterText";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { useWorld } from "@/components/motion/WorldWipe";
import { Switch } from "@/components/ui/switch";
import { site, socialMeta } from "@/lib/site";

export function meta() {
  const description = "A collection of small interactive design experiments from my personal blog.";
  return [
    { title: `Evidence Lab · ${site.title}` },
    { name: "description", content: description },
    ...socialMeta({ path: "/lab", title: "Evidence Lab", description }),
  ];
}

function Placard({ name, note }: { name: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <h2 className="font-machine text-xs font-bold uppercase tracking-[0.28em]">{name}</h2>
      <p className="font-machine text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {note}
      </p>
    </div>
  );
}

function VeilDemo() {
  return (
    <div className="flex items-center gap-6">
      <LinkUnderVeil
        to="/lab"
        className="border-2 border-line bg-card text-card-foreground px-5 py-3 font-machine text-xs font-bold uppercase tracking-[0.22em] shadow-print-sm"
      >
        Wipe to myself
      </LinkUnderVeil>
      <p className="font-machine text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        550ms cover → navigate → reveal (300ms between articles) · never a fade
      </p>
    </div>
  );
}

function WorldDemo() {
  const { world, toggle } = useWorld();
  return (
    <div className="flex items-center gap-6">
      <Switch checked={world === "black"} onCheckedChange={toggle} aria-label="Toggle the world" />
      <p className="font-machine text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Current world: {world} — red for engineering, black for algorithms
      </p>
    </div>
  );
}

// Evidence Lab (spec §3 /lab): the portfolio showroom — every motion primitive
// from spec §5, live under glass. One placard per exhibit, monument budget held.
export default function LabPage() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <ChapterNumeral
        numeral="VIII"
        className="hidden md:block -top-4 right-0 text-[clamp(10rem,24vw,20rem)]"
      />
      <ReadingFolio total={4} />
      <section className="relative mx-auto max-w-[76rem] px-6 pt-16 pb-12 md:px-10">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Design Lab / Interactive studies
        </p>
        <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.95]">
          Small Experiments
        </h1>
        <p className="mt-4 max-w-[52ch] font-body text-lg text-muted-foreground">
          A working sketchbook for this blog’s visual language. Explore the typography, paper
          textures, and interactions used throughout the site.
        </p>
      </section>

      <div className="mx-auto max-w-[76rem] space-y-16 px-6 pb-24 md:px-10">
        <section className="space-y-6">
          <Placard name="AnagramText" note="seeded scramble · resolves once on mount" />
          <AnagramText
            text="ORION ARCH"
            className="font-display text-6xl uppercase tracking-tight md:text-7xl"
          />
        </section>

        <section className="space-y-6">
          <Placard name="TypewriterText" note="steps(1) caret · instant when reduced" />
          <TypewriterText
            text="Every file begins with a typewriter."
            className="font-machine text-xl font-bold uppercase tracking-[0.14em]"
          />
        </section>

        <section className="space-y-6">
          <Placard name="MorphIn & StaggerList" note="scale .85→1 · 60ms cascade" />
          <StaggerList className="grid gap-4 md:grid-cols-3">
            {["Evidence A-113", "Evidence B-002", "Evidence C-907"].map((label) => (
              <MorphIn key={label}>
                <ExhibitCard exhibit={label} caption="case log">
                  <p className="font-body text-lg leading-relaxed">
                    Filed, stamped, and entering the room at print speed.
                  </p>
                </ExhibitCard>
              </MorphIn>
            ))}
          </StaggerList>
        </section>

        <section className="space-y-6">
          <Placard name="Press Tape" note="pure css loop · hover pauses · removed when reduced" />
          <PressTape items={["EXHIBIT ROW 5", "DO NOT FOLD", "FILE UNDER M"]} />
        </section>

        <section className="space-y-6">
          <Placard name="Halftone" note="css dot field · hover focuses 7px → 3px" />
          <div className="grid gap-8 md:grid-cols-2">
            <HalftoneImage className="p-10" interactive>
              <Magpie className="size-28" />
            </HalftoneImage>
            <div className="flex items-center font-machine text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              All photography passes through the dot field — no raw images on the record.
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <Placard name="HorizontalRail" note="sticky pin · scroll scrubs translateX" />
          <HorizontalRail ariaLabel="Rail exhibit">
            {["PLATE I", "PLATE II", "PLATE III"].map((plate) => (
              <div
                key={plate}
                className="flex h-48 w-[60vw] shrink-0 items-center justify-center border-2 border-line bg-card text-card-foreground font-display text-4xl uppercase shadow-print-sm md:w-[32vw]"
              >
                {plate}
              </div>
            ))}
          </HorizontalRail>
        </section>

        <section className="space-y-6">
          <Placard name="CenterSeam" note="pointer-driven seam · keyboard ±5%" />
          <CenterSeam
            left={
              <div className="flex h-full items-center justify-center font-display text-3xl uppercase">
                Engineering
              </div>
            }
            right={
              <div className="flex h-full items-center justify-center font-display text-3xl uppercase">
                Algorithms
              </div>
            }
          />
        </section>

        <section className="space-y-6">
          <Placard name="Veil" note="route wipe · cover, navigate, reveal" />
          <VeilDemo />
        </section>

        <section className="space-y-6">
          <Placard name="World Switch" note="two worlds, one story · palette inverts" />
          <WorldDemo />
        </section>

        <section className="space-y-6">
          <Placard name="Reading Folio" note="bottom-left now — scroll this page to read it" />
          <p className="font-body text-lg text-muted-foreground">
            The page counter in the lower-left corner is the same chrome every case file carries.{" "}
            <ClueChip>folio 01 ∕ 04</ClueChip>
          </p>
        </section>

        <footer className="relative border-t-2 border-line pt-8">
          {/* Constrained rain zone: PageFlutter resolves against the nearest
              positioned ancestor, so without this bounds it would rain over
              the whole page instead of garnishing the footer corner. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/3 md:w-1/4"
          >
            <PageFlutter />
          </div>
          <p className="font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            Design studies / Orion Arch
          </p>
        </footer>
      </div>
    </div>
  );
}
