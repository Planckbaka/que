import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TypewriterTextProps = {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  caret?: boolean;
};

export function TypewriterText({
  text,
  className,
  speed = 55,
  startDelay = 250,
  caret = true,
}: TypewriterTextProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(() => (reduced ? text.length : 0));
  const done = count >= text.length;

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let id: number | undefined;
    const kickoff = window.setTimeout(() => {
      id = window.setInterval(() => {
        setCount((c) => {
          if (c + 1 >= text.length) window.clearInterval(id);
          return Math.min(c + 1, text.length);
        });
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(kickoff);
      if (id !== undefined) window.clearInterval(id);
    };
  }, [text, reduced, speed, startDelay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {caret && !done && (
          <span
            aria-hidden="true"
            className={cn(
              "caret-blink ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-current",
            )}
          />
        )}
      </span>
    </span>
  );
}
