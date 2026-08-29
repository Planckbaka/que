import { useEffect, useRef } from "react";
import { useWorld } from "@/components/motion/WorldWipe";
import { site } from "@/lib/site";

// Giscus credentials arrive with the real launch (plan Appendix B); the
// component gates on their presence so a static build never half-loads.
export type GiscusConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
};

const WORLD_THEME = {
  red: "noborder_light",
  black: "noborder_dark",
} as const;

export function GiscusComments({ config = site.comments }: { config?: GiscusConfig }) {
  const { world } = useWorld();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!config || !host) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", config.repo);
    script.setAttribute("data-repo-id", config.repoId);
    script.setAttribute("data-category", config.category);
    script.setAttribute("data-category-id", config.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "0");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", WORLD_THEME[world]);
    script.setAttribute("data-loading", "lazy");
    host.replaceChildren(script);
    return () => host.replaceChildren();
    // Mount once per config; world flips are handled by the postMessage below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (!config) return;
    const frame = hostRef.current?.querySelector("iframe.giscus-frame") as HTMLIFrameElement | null;
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: WORLD_THEME[world] } } },
      "https://giscus.app",
    );
  }, [world, config]);

  if (!config) {
    return (
      <p className="border-t-2 border-line pt-6 font-machine text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        Reader marginalia arrive in a later printing — the case file stays open.
      </p>
    );
  }

  return (
    <section aria-label="Reader marginalia" className="border-t-2 border-line pt-6">
      <p className="mb-4 font-machine text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
        Marginalia · 旁注
      </p>
      <div ref={hostRef} data-giscus-repo={config.repo} />
    </section>
  );
}
