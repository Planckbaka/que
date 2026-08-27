import { motion } from "motion/react";
import { BookSpine } from "@/components/magpie/BookSpine";
import { ChapterHeading } from "@/components/magpie/ChapterHeading";
import { ClueChip } from "@/components/magpie/ClueChip";
import { HalftoneImage } from "@/components/magpie/HalftoneImage";
import { MagpieCounter } from "@/components/magpie/MagpieCounter";
import { PaperGrain } from "@/components/magpie/PaperGrain";
import { Redacted } from "@/components/magpie/Redacted";
import {
  FallingFigure,
  Magpie,
  Manor,
  PenNib,
  Staircase,
  Teacup,
} from "@/components/magpie/silhouettes";
import { AnagramText } from "@/components/motion/AnagramText";
import { CenterSeam } from "@/components/motion/CenterSeam";
import { HorizontalRail } from "@/components/motion/HorizontalRail";
import { MorphIn } from "@/components/motion/MorphIn";
import { PageFlutter } from "@/components/motion/PageFlutter";
import { PressTape } from "@/components/motion/PressTape";
import { StaggerList } from "@/components/motion/StaggerList";
import { TypewriterText } from "@/components/motion/TypewriterText";
import { useWorld } from "@/components/motion/WorldWipe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RunningHead() {
  return (
    <header className="flex items-baseline justify-between border-b border-foreground/30 px-6 py-3 font-machine text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground md:px-10">
      <span>The Magpie Files · 喜鹊档案</span>
      <span className="hidden sm:inline">Case No. 1954-PYE</span>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden px-6 pt-14 pb-20 md:px-10">
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -top-8 -right-6 leading-none opacity-40 select-none [font-size:clamp(14rem,34vw,30rem)]"
      >
        I
      </span>
      <PageFlutter className="z-0" />
      <div className="relative z-10 mx-auto grid w-full max-w-[76rem] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Chapter One · One for Sorrow
          </p>
          <h1 className="mt-4 font-display uppercase leading-[0.92]">
            <span className="block text-[clamp(2.6rem,6vw,4.4rem)]">The Case of</span>
            <span className="mt-3 inline-block bg-ink px-5 py-1 text-paper shadow-print-lg [font-size:clamp(3.2rem,9vw,7rem)] [[data-world='black']_&]:shadow-[7px_7px_0_0_var(--color-blood)]">
              <AnagramText text="PYE HALL" />
            </span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/90">
            A murder within the murder. The final chapter is missing, the author is dead, and every
            magpie on the lawn is counting something.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Button size="lg" asChild>
              <a href="#evidence">Open Case File</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#notes">Meet the Suspects</a>
            </Button>
          </div>
        </div>
        <motion.div
          className="relative hidden justify-self-end lg:block"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Magpie className="w-[min(30vw,380px)] text-primary" />
          <Manor className="absolute -bottom-16 -left-24 w-44 text-paper opacity-90" />
        </motion.div>
      </div>
      <p className="absolute bottom-5 left-6 font-machine text-[11px] uppercase tracking-[0.28em] text-paper/70 md:left-10">
        Folio 01 · Two Worlds, One Story
      </p>
    </section>
  );
}

function WorldDivider() {
  const { world, toggle } = useWorld();
  return (
    <section aria-label="World toggle" className="relative grid grid-cols-2 border-y-2 border-ink">
      <div className="bg-blood p-8 text-paper md:p-12">
        <p className="font-display text-xl uppercase tracking-wide md:text-2xl">Author World</p>
        <p className="mt-1 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-paper/75">
          Reality · Susan Ryeland
        </p>
      </div>
      <div className="bg-ink p-8 text-right text-paper md:p-12">
        <p className="font-display text-xl uppercase tracking-wide md:text-2xl">Detective World</p>
        <p className="mt-1 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-paper/65">
          Fiction · Atticus Pünd
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-paper"
      />
      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <Switch
          checked={world === "black"}
          onCheckedChange={toggle}
          aria-label="Flip between the author world and the detective world"
        />
        <p className="mt-2 inline-block bg-ink px-2 py-0.5 text-center font-machine text-[10px] font-bold uppercase tracking-[0.25em] text-paper">
          Flip the world
        </p>
      </div>
    </section>
  );
}

function RailDemo() {
  return (
    <HorizontalRail ariaLabel="Exhibit gallery">
      {EXHIBITS.map((ex) => (
        <figure
          key={ex.badge}
          className="w-[70vw] shrink-0 border-2 border-line bg-card p-8 shadow-print"
        >
          {ex.art}
          <p className="mt-6 text-lg italic">{ex.title}</p>
          <p className="mt-2 text-base italic opacity-70">{ex.date}</p>
          <figcaption className="mt-2 font-machine text-xs uppercase tracking-[0.25em]">
            {ex.badge}
          </figcaption>
        </figure>
      ))}
    </HorizontalRail>
  );
}

function SeamDemo() {
  return (
    <CenterSeam
      left={
        <div className="flex h-full flex-col justify-center p-8 md:p-12">
          <p className="font-display text-xl uppercase tracking-wide md:text-2xl">Author World</p>
          <p className="mt-1 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-paper/75">
            Drag the seam, or use the arrow keys
          </p>
        </div>
      }
      right={
        <div className="flex h-full flex-col items-end justify-center p-8 text-right md:p-12">
          <p className="font-display text-xl uppercase tracking-wide md:text-2xl">
            Detective World
          </p>
          <p className="mt-1 font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-paper/65">
            Two worlds, one fold
          </p>
        </div>
      }
    />
  );
}

const EXHIBITS = [
  {
    badge: "Exhibit A-113",
    title: "The Staircase",
    date: "Found at Pye Hall, landing two",
    art: <Staircase className="size-20" />,
    secret: "She was pushed.",
  },
  {
    badge: "Exhibit B-07",
    title: "The Fountain Pen",
    date: "Recovered from the study desk",
    art: <PenNib className="size-20" />,
    secret: "It writes more than novels.",
  },
  {
    badge: "Exhibit C-02",
    title: "Afternoon Tea",
    date: "Still warm when they arrived",
    art: <Teacup className="size-20" />,
    secret: "Two cups. One guest.",
  },
];

function EvidenceLocker() {
  return (
    <section
      id="evidence"
      data-world="black"
      className="bg-background px-6 py-24 text-foreground md:px-10"
    >
      <div className="mx-auto max-w-[76rem]">
        <MorphIn>
          <ChapterHeading
            numeral="II"
            kicker="Evidence Locker · Pye Hall"
            title="Twelve Objects, One Truth"
          >
            <p className="mt-5 max-w-2xl font-machine text-xs font-bold uppercase tracking-[0.25em] text-stamp">
              <TypewriterText text="RETRIEVING RECORDS… 12 ITEMS FOUND" />
            </p>
          </ChapterHeading>
        </MorphIn>
        <MorphIn delay={0.15}>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-stamp">
            Every object in this room passed through both worlds before it reached the evidence
            shelf. Look closely and you will see where one story ends and the other begins — usually
            along a clean vertical seam.
          </p>
        </MorphIn>
        <StaggerList className="mt-14 grid gap-10 md:grid-cols-3">
          {EXHIBITS.map((ex) => (
            <Card key={ex.badge} variant="evidence" className="min-h-[24rem]">
              <CardHeader>
                <Badge variant="evidence">{ex.badge}</Badge>
                <CardTitle className="mt-2">{ex.title}</CardTitle>
                <CardDescription>{ex.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <HalftoneImage className="flex h-36 items-center justify-center">
                  {ex.art}
                </HalftoneImage>
                <p className="mt-4 text-base italic">
                  Note: <Redacted>{ex.secret}</Redacted>
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="type" size="sm">
                  Examine →
                </Button>
                <FallingFigure className="ml-auto size-8 opacity-60" />
              </CardFooter>
            </Card>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}

const SUSPECTS = [
  { name: "Robert Conway", role: "The brother", status: "No alibi", cleared: false },
  { name: "Melanie Bryant", role: "The agent", status: "No alibi", cleared: false },
  { name: "John White", role: "The gardener", status: "Cleared", cleared: true },
  { name: "Atticus Pünd", role: "The detective", status: "Never suspected", cleared: true },
];

function CaseNotes() {
  return (
    <section
      id="notes"
      data-world="red"
      className="bg-background px-6 py-24 text-foreground md:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <MorphIn tilt={1}>
          <ChapterHeading
            numeral="III"
            kicker="Case Notes · Everybody Lies"
            title="Everybody Is Suspect"
          />
        </MorphIn>
        <Tabs defaultValue="notes" className="mt-12">
          <TabsList>
            <TabsTrigger value="notes">Case Notes</TabsTrigger>
            <TabsTrigger value="suspects">Suspects</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <p className="max-w-2xl text-lg leading-relaxed">
              The author loved anagrams the way murderers love alibis. His detective's own name
              hides another sentence entirely, which is either a clue or a very long joke at our
              expense.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ClueChip>Anagram password</ClueChip>
              <ClueChip>Missing chapter</ClueChip>
              <ClueChip>Seven magpies</ClueChip>
              <ClueChip>Red herring?</ClueChip>
            </div>
          </TabsContent>
          <TabsContent value="suspects">
            <ul>
              {SUSPECTS.map((s) => (
                <li
                  key={s.name}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-3.5"
                >
                  <span className="text-lg">
                    <span className="font-display mr-3 uppercase tracking-wide">{s.name}</span>
                    <span className="italic opacity-80">{s.role}</span>
                  </span>
                  <Badge variant={s.cleared ? "ghost" : "stamp"}>{s.status}</Badge>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="timeline">
            <dl className="font-machine text-xs font-bold uppercase tracking-[0.18em]">
              {[
                ["08:02", "Typewriter heard from the study"],
                ["09:15", "Gardener finds the study door open"],
                ["11:40", "Editor arrives with the manuscript"],
                ["16:00", "Magpies counted on the lawn: seven"],
              ].map(([time, event]) => (
                <div
                  key={time}
                  className="flex justify-between gap-6 border-b border-border py-2.5"
                >
                  <dt className="text-primary">{time}</dt>
                  <dd className="text-right">{event}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function CounterSection() {
  return (
    <section data-world="black" className="bg-background px-6 py-24 text-foreground md:px-10">
      <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
        <MorphIn tilt={-1}>
          <ChapterHeading
            numeral="IV"
            kicker="Field Guide · Nursery Rhyme"
            title="Count the Magpies"
          />
          <MagpieCounter className="mt-10" />
        </MorphIn>
        <div>
          <label
            htmlFor="case-index"
            className="font-machine text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground"
          >
            Search the case index
          </label>
          <Input id="case-index" className="mt-3" placeholder="Type and press enter…" />
          <p className="mt-2 font-machine text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Try: MAGPIE, PYE, SORROW
          </p>
          <p className="mt-10 max-w-sm text-lg italic leading-relaxed opacity-90">
            And remember what the rhyme says about the seventh bird:{" "}
            <Redacted>seven for a secret never told.</Redacted>
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer data-world="red" className="border-t-2 border-ink bg-background text-foreground">
      <div className="mx-auto grid max-w-[76rem] gap-12 px-6 py-16 sm:grid-cols-[auto_1fr_auto] md:px-10">
        <div className="flex gap-4">
          <BookSpine label="Anton" className="h-44" />
          <BookSpine label="Crimson Pro" className="h-52" />
          <BookSpine label="Courier Prime" className="h-40" />
        </div>
        <div className="space-y-2 self-center font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <p>The Magpie Files — a design system study</p>
          <p>After the main titles by HUGE Designs (2022)</p>
          <p>Set in Anton · Crimson Pro · Courier Prime</p>
        </div>
        <nav className="flex flex-col items-start gap-3 sm:items-end" aria-label="Colophon links">
          <Button variant="type" size="sm" asChild>
            <a href="#top">Back to cover</a>
          </Button>
          <Button variant="type" size="sm" asChild>
            <a href="#evidence">Evidence</a>
          </Button>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between px-6 py-3 font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground md:px-10">
          <span>Folio ∞</span>
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Magpie className="size-5" />
          </motion.span>
          <span>Printed nowhere</span>
        </div>
      </div>
    </footer>
  );
}

export default function ShowcasePage() {
  return (
    <div id="top" className="min-h-svh">
      <PaperGrain />
      <RunningHead />
      <main>
        <Hero />
        <WorldDivider />
        <PressTape items={["ONE FOR SORROW", "SEVEN FOR A SECRET", "CASE 1954-PYE REOPENED"]} />
        <RailDemo />
        <SeamDemo />
        <EvidenceLocker />
        <CaseNotes />
        <CounterSection />
      </main>
      <Footer />
    </div>
  );
}
