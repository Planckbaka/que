import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HalftoneImageProps = {
  children: ReactNode;
  className?: string;
};

export function HalftoneImage({ children, className }: HalftoneImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden border-2 border-ink bg-paper text-ink", className)}
    >
      <div className="flex h-full w-full items-center justify-center">{children}</div>
      <div
        aria-hidden="true"
        className="halftone pointer-events-none absolute inset-0 text-ink/25 mix-blend-multiply"
      />
    </div>
  );
}
