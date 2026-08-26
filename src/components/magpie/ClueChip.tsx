import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function ClueChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-none border-2 border-dashed border-line px-2.5 py-1 font-machine text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      <Search className="size-3" strokeWidth={2.5} />
      {children}
    </span>
  );
}
