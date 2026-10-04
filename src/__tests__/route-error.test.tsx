// Error boundaries: layout-level boundary keeps the site chrome and switches
// between the 404 card and the runtime-error card; slug decoding never throws.

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { decodeSlugSegment } from "@/lib/slug";
import { ErrorBoundary as FilePageBoundary } from "@/pages/FilePage";
import { ErrorBoundary as LayoutBoundary, RouteErrorCard } from "@/pages/SeoLayout";

function renderBoundaryWithError(errorElement: ReactNode, loader: () => never) {
  // VeilProvider needs the router context, so it wraps the boundary itself.
  // initialEntries aims at the route — otherwise the router 404s on "/" and
  // the boundary never sees our loader error.
  const router = createMemoryRouter(
    [
      {
        path: "/broken",
        loader,
        HydrateFallback: () => null,
        errorElement: <VeilProvider>{errorElement}</VeilProvider>,
      },
    ],
    { initialEntries: ["/broken"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("decodeSlugSegment", () => {
  it("decodes well-formed segments and keeps malformed ones raw", () => {
    expect(decodeSlugSegment("the-case-of-the-blazing-build")).toBe(
      "the-case-of-the-blazing-build",
    );
    expect(decodeSlugSegment("l%C3%A9l%C3%A9")).toBe("lélé");
    // %zz is an invalid escape — decodeURIComponent would throw URIError and
    // entry.client would skip hydration for the entire document.
    expect(decodeSlugSegment("%zz")).toBe("%zz");
  });
});

describe("RouteErrorCard", () => {
  it("renders the card with recovery links and noindex", () => {
    render(
      <MemoryRouter>
        <RouteErrorCard title="Reading interrupted" detail="Something went wrong." />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: /reading interrupted/i })).toBeTruthy();
    expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
  });
});

describe("SeoLayout ErrorBoundary", () => {
  it("renders the styled 404 page for route error responses", async () => {
    renderBoundaryWithError(<LayoutBoundary />, () => {
      throw new Response("nope", { status: 404 });
    });
    expect(await screen.findByRole("heading", { level: 1, name: /page not found/i })).toBeTruthy();
    expect(screen.getByText("Browse articles →")).toBeTruthy();
  });

  it("renders the error card with chrome for runtime errors", async () => {
    renderBoundaryWithError(<LayoutBoundary />, () => {
      throw new Error("boom");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: /reading interrupted/i }),
    ).toBeTruthy();
    // Chrome stays mounted — footer survives the failure.
    expect(screen.getByText("Return home →")).toBeTruthy();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
  });
});

describe("FilePage ErrorBoundary", () => {
  it("shows a reading-local error when the body chunk fails", async () => {
    renderBoundaryWithError(<FilePageBoundary />, () => {
      throw new TypeError("Failed to fetch dynamically imported module");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: /reading interrupted/i }),
    ).toBeTruthy();
    expect(screen.getByText(/failed to load/i)).toBeTruthy();
  });
});
