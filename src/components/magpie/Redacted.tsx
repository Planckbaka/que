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
      className={`inline cursor-pointer px-1 text-left transition-colors duration-150 hover:bg-transparent hover:text-inherit ${
        revealed ? "bg-transparent text-inherit" : "bg-[var(--redaction)] text-transparent"
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
