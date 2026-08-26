import type { Transition } from "motion/react";

export const DURATIONS = {
  snap: 0.14,
  beat: 0.24,
  drift: 0.48,
  settle: 0.8,
  cinematic: 1.1,
} as const;

export const EASE_PRINT: [number, number, number, number] = [0.2, 0, 0, 1];
export const EASE_PLUMMET: [number, number, number, number] = [0.55, 0, 1, 0.45];

export const SPRING: Transition = { type: "spring", stiffness: 260, damping: 26 };

export const STAGGER_STEP = 0.06;

export function stagger(index: number, step: number = STAGGER_STEP): number {
  return index * step;
}
