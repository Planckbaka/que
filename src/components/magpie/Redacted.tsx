import type { ReactNode } from "react";

type RedactedProps = {
  children: ReactNode;
  title?: string;
};

export function Redacted({ children, title = "Declassified on hover" }: RedactedProps) {
  return (
    <span
      title={title}
      className="cursor-help select-none bg-[var(--redaction)] px-1 text-transparent transition-colors duration-150 hover:bg-transparent hover:text-inherit"
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
