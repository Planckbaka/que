import type { ReactNode } from "react";

type SilhouetteProps = {
  className?: string;
};

function Svg({ className, children }: SilhouetteProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

export function Magpie({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <g transform="rotate(-6 32 32)">
        <ellipse cx="27" cy="37" rx="15" ry="10.5" transform="rotate(-18 27 37)" />
        <polygon points="17,41 3,57 24,49" />
        <circle cx="42" cy="23" r="8" />
        <polygon points="48,20 60,23 48,26" />
        <ellipse cx="28" cy="35" rx="8" ry="3.5" transform="rotate(-18 28 35)" fill="var(--bg)" />
      </g>
      <circle cx="44.5" cy="21.5" r="1.7" fill="var(--bg)" />
    </Svg>
  );
}

export function Staircase({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <polygon points="6,6 18,6 18,18 30,18 30,30 42,30 42,42 54,42 54,58 6,58" />
    </Svg>
  );
}

export function FallingFigure({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <circle cx="32" cy="13" r="6.5" />
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <path d="M32 21 L31 39" />
        <path d="M31 27 L17 19 M31 27 L47 31" />
        <path d="M31 39 L19 53 M31 39 L45 51" />
      </g>
    </Svg>
  );
}

export function PenNib({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <path d="M32 62 L20 36 L21 11 L43 11 L44 36 Z" />
      <rect x="31" y="38" width="2" height="16" fill="var(--bg)" />
      <circle cx="32" cy="33" r="3.5" fill="var(--bg)" />
    </Svg>
  );
}

export function Manor({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <polygon points="5,58 5,25 21,9 29,9 29,58" />
      <polygon points="35,58 35,9 43,9 59,25 59,58" />
      <g fill="var(--bg)">
        <rect x="12" y="30" width="5" height="8" />
        <rect x="45" y="30" width="5" height="8" />
        <rect x="14" y="44" width="5" height="14" />
        <rect x="45" y="44" width="5" height="14" />
      </g>
    </Svg>
  );
}

export function Teacup({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <path d="M12 22 h30 v8 a15 15 0 0 1 -30 0 Z" />
      <path d="M42 25 a7.5 7.5 0 1 1 -1 14" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="8" y="50" width="38" height="4" />
    </Svg>
  );
}

export function TypewriterKey({ className }: SilhouetteProps) {
  return (
    <Svg className={className}>
      <circle cx="32" cy="30" r="16" />
      <rect x="28" y="44" width="8" height="14" />
      <circle cx="32" cy="30" r="8.5" fill="var(--bg)" />
    </Svg>
  );
}
