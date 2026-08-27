export function HalftoneReveal({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="group relative overflow-hidden border-2 border-line">
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
      <span
        aria-hidden="true"
        className="halftone pointer-events-none absolute inset-0 bg-paper opacity-45 transition-all duration-200 [background-size:7px] group-hover:opacity-20 group-hover:[background-size:3px]"
      />
    </figure>
  );
}
