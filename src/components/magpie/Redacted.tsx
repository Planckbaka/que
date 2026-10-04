import { type ReactNode, useState } from "react";

type RedactedProps = {
  children: ReactNode;
  title?: string;
};

export function Redacted({ children, title = "Reveal or hide this note" }: RedactedProps) {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      type="button"
      title={title}
      aria-expanded={revealed}
      onClick={() => setRevealed((value) => !value)}
      className={`inline cursor-pointer px-1 text-left transition-colors duration-[140ms] hover:bg-transparent hover:text-inherit ${
        revealed
          ? "bg-transparent text-inherit"
          : // The hairline boundary keeps the bar a qualifying non-text target
            // (WCAG 1.4.11) in the black world, where --redaction sits near the card surface.
            "bg-[var(--redaction)] text-transparent outline outline-1 -outline-offset-1 outline-line/50"
      }`}
    >
      <span className="sr-only">
        {revealed ? "Hide note: " : "Reveal note: "}
        {children}
      </span>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
