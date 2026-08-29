import { Outlet } from "react-router";
import { RunningHead } from "@/components/magpie/RunningHead";
import { SiteFooter } from "@/components/magpie/SiteFooter";

// Shared page frame for every content route (spec §3 _seo.tsx). The world
// state stays global — sections pin their own data-world when they opt out.
// Lenis + Veil keep mounting in root so even the fallback shell keeps them.
export default function SeoLayout() {
  return (
    <div className="min-h-svh">
      <RunningHead />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
