import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Magpie } from "@/components/magpie/silhouettes";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/lib/motion";

const RHYMES = [
  "One for sorrow",
  "Two for joy",
  "Three for a girl",
  "Four for a boy",
  "Five for silver",
  "Six for gold",
  "Seven for a secret never told",
] as const;

export function MagpieCounter({ className }: { className?: string }) {
  const [count, setCount] = useState(1);
  const rhyme = RHYMES[count - 1];

  return (
    <div className={className}>
      <p
        aria-live="polite"
        className="font-machine text-sm font-bold uppercase tracking-[0.25em] text-stamp"
      >
        {rhyme}
      </p>
      <div className="mt-4 flex items-end gap-6">
        <motion.span
          key={count}
          initial={{ y: -18, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={SPRING}
          className="font-display text-8xl leading-none"
        >
          {count}
        </motion.span>
        <div className="flex flex-wrap items-center gap-1.5 pb-2" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative tally of identical magpies
            <Magpie key={`magpie-${i + 1}`} className="size-7 text-current opacity-80" />
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label="One magpie fewer"
          disabled={count <= 1}
          onClick={() => setCount((c) => Math.max(1, c - 1))}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="stamp"
          size="icon"
          aria-label="One magpie more"
          disabled={count >= RHYMES.length}
          onClick={() => setCount((c) => Math.min(RHYMES.length, c + 1))}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
