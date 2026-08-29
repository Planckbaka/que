// Prerendered pages ship a modulepreload link for every chunk in the route
// graph. A dozen high-priority preloads contend with the render-blocking CSS
// for the critical window (Lighthouse mobile: FCP 3.3s -> 2.1s when stripped).
// The inline route-import module re-discovers the same URLs right after first
// paint, and the Veil covers navigation latency, so nothing of value is lost.
export function stripModulePreloads(html: string): string {
  return html.replaceAll(/<link rel="modulepreload"[^>]*\/>/g, "");
}
