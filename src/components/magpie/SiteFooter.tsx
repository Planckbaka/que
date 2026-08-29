import { motion } from "motion/react";
import { BookSpine } from "@/components/magpie/BookSpine";
import { Magpie } from "@/components/magpie/silhouettes";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const NAV = [
  { label: "Cover", to: "/" },
  { label: "Archive", to: "/files" },
  { label: "Lab", to: "/lab" },
  { label: "Colophon", to: "/about" },
];

// Shared page furniture (spec §3 _seo layout). Navigation rides the Veil wipe.
export function SiteFooter() {
  return (
    <footer data-world="red" className="border-t-2 border-ink bg-background text-foreground">
      <div className="mx-auto grid max-w-[76rem] gap-12 px-6 py-16 sm:grid-cols-[auto_1fr_auto] md:px-10">
        <div className="flex gap-4">
          <BookSpine label="Anton" className="h-44" />
          <BookSpine label="Crimson Pro" className="h-52" />
          <BookSpine label="Courier Prime" className="h-40" />
        </div>
        <div className="space-y-2 self-center font-machine text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <p>{site.title} — engineering notes and algorithm case files</p>
          <p>After the main titles by HUGE Designs (2022)</p>
          <p>Set in Anton · Crimson Pro · Courier Prime</p>
        </div>
        <nav className="flex flex-col items-start gap-3 sm:items-end" aria-label="Site">
          {NAV.map((entry) => (
            <Button key={entry.to} variant="type" size="sm" asChild>
              <LinkUnderVeil to={entry.to}>{entry.label}</LinkUnderVeil>
            </Button>
          ))}
          <Button variant="type" size="sm" asChild>
            <a href="/rss.xml">RSS Feed</a>
          </Button>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between px-6 py-3 font-machine text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground md:px-10">
          <span>© 2026 {site.author}</span>
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
