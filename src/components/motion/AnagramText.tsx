import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&#%?";

function scramble(source: string): string {
  let out = "";
  for (const ch of source) {
    out += ch === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

type AnagramTextProps = {
  text: string;
  className?: string;
  delay?: number;
  beat?: number;
};

export function AnagramText({ text, className, delay = 350, beat = 110 }: AnagramTextProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(() => (reduced ? text : scramble(text)));

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    setDisplay(scramble(text));
    const start = Date.now() + delay;
    const id = window.setInterval(() => {
      const resolved = Math.floor((Date.now() - start) / beat);
      if (resolved >= text.length) {
        setDisplay(text);
        window.clearInterval(id);
        return;
      }
      setDisplay(text.slice(0, resolved) + scramble(text.slice(resolved)));
    }, 55);
    return () => window.clearInterval(id);
  }, [text, reduced, delay, beat]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
