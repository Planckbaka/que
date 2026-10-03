import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HalftoneImageProps = {
  children: ReactNode;
  className?: string;
  /** Container becomes a `group`; hover tightens the dot field 7px -> 3px. */
  interactive?: boolean;
};

export function HalftoneImage({ children, className, interactive = false }: HalftoneImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-2 border-ink bg-paper text-ink",
        interactive && "group",
        className,
      )}
    >
      <div className="flex h-full w-full items-center justify-center">{children}</div>
      <div
        aria-hidden="true"
        className={cn(
          "halftone pointer-events-none absolute inset-0 text-ink/25 mix-blend-multiply",
          interactive && "group-hover:halftone-focus",
        )}
      />
    </div>
  );
}
