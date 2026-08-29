import type { ReactNode } from "react";

type ExhibitCardProps = {
  exhibit: string;
  caption?: string;
  children: ReactNode;
};

// MDX vocabulary: schematic / architecture figure card (evidence-card variant,
// SKILL.md §6). Used inside case files via the `components` prop mapping.
export function ExhibitCard({ exhibit, caption, children }: ExhibitCardProps) {
  return (
    <figure className="border-2 border-line bg-card p-6 shadow-print-sm">
      <figcaption className="mb-4 flex items-baseline justify-between gap-4 font-machine text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
        <span>{exhibit}</span>
        {caption ? <span>{caption}</span> : null}
      </figcaption>
      {children}
    </figure>
  );
}
