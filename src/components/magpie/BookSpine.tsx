import type { ReactNode } from "react";

type BookSpineProps = {
  label: string;
  className?: string;
  children?: ReactNode;
};

export function BookSpine({ label, className }: BookSpineProps) {
  return (
    <div className={`flex w-12 flex-col border-2 border-ink ${className ?? ""}`}>
      <span className="h-2.5 shrink-0 bg-stamp" />
      <span className="flex flex-1 items-center justify-center bg-ink py-5 text-paper">
        <span className="rotate-180 font-machine text-xs font-bold uppercase tracking-[0.25em] [writing-mode:vertical-rl]">
          {label}
        </span>
      </span>
      <span className="h-2.5 shrink-0 bg-stamp" />
    </div>
  );
}
