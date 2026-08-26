import type { ReactNode } from "react";

type ChapterHeadingProps = {
  numeral: string;
  kicker: string;
  title: string;
  children?: ReactNode;
};

export function ChapterHeading({ numeral, kicker, title, children }: ChapterHeadingProps) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -top-[0.12em] left-0 select-none font-display leading-none opacity-25 [font-size:clamp(7rem,18vw,14rem)]"
      >
        {numeral}
      </span>
      <div className="relative pt-[clamp(3.5rem,9vw,7rem)]">
        <p className="font-machine text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {kicker}
        </p>
        <h2 className="mt-2 max-w-xl font-display text-[clamp(2.2rem,5vw,3.6rem)] uppercase leading-[0.95]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
