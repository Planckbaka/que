import { useEffect, useRef } from "react";
import { isRouteErrorResponse, Link, Outlet, useRouteError } from "react-router";
import { RunningHead } from "@/components/magpie/RunningHead";
import { SiteFooter } from "@/components/magpie/SiteFooter";
import NotFoundPage from "./NotFoundRedirect";

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

// Rendered only while an error boundary is active; React 19 hoists the meta
// tag into <head>, keeping accidental runtime errors out of search indexes.
export function RouteErrorCard({ title, detail }: { title: string; detail: string }) {
  // Boundary replaces the page wholesale — move keyboard focus onto the card
  // heading so screen-reader/keyboard users land in the error announcement.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <section className="reading-paper flex min-h-svh items-center justify-center px-6 py-16">
      <meta name="robots" content="noindex" />
      <div className="max-w-xl border-2 border-ink p-8 shadow-print">
        <p className="font-machine text-sm">Error / Orion Arch</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 font-display text-5xl uppercase outline-none"
        >
          {title}
        </h1>
        <p className="mt-6 font-body text-xl">{detail}</p>
        <div className="mt-8 flex flex-wrap gap-6 underline underline-offset-4">
          <Link to="/files">Browse articles →</Link>
          <Link to="/">Return home →</Link>
        </div>
      </div>
    </section>
  );
}

function useLogRouteError(scope: string) {
  const error = useRouteError();
  useEffect(() => {
    // Boundaries swallow the stack; surface it for production diagnostics
    // (same intent as the hydration logger in entry.client.tsx).
    console.error(`[${scope}]`, error);
  }, [scope, error]);
}

// Layout-level boundary: keeps the site chrome mounted so an error never
// drops the reader onto an unstyled router default. The chrome is repeated
// here because the boundary replaces SeoLayout itself when it renders.
export function ErrorBoundary() {
  useLogRouteError("route error");
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="min-h-svh">
      <RunningHead />
      <main>
        {notFound ? (
          <NotFoundPage />
        ) : (
          <RouteErrorCard
            title="Reading interrupted"
            detail="An unexpected error interrupted this page. The archive itself is intact."
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
