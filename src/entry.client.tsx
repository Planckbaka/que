// Custom client entry: identical to the RRv7 default (startTransition +
// HydratedRouter), plus onRecoverableError so hydration recoveries surface
// their component stack in the console instead of failing silently.
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

async function hydrate() {
  const match = /^\/files\/([^/]+)\/?$/.exec(window.location.pathname);
  if (match) {
    // 预取失败（离线、部署交换后旧 chunk 404）绝不能卡死水合：那会让完整
    // 的静态正文失去一切交互，且 reading-local 错误边界活在未挂载的 React
    // 树里、永远不可达。失败时交给 FilePage 的 clientLoader 链路落到边界。
    try {
      const { preloadArticle } = await import("./lib/content");
      const { decodeSlugSegment } = await import("./lib/slug");
      await preloadArticle(decodeSlugSegment(match[1]));
    } catch (error) {
      console.error("[hydrate] body preload failed:", error);
    }
  }
  startTransition(() => {
    hydrateRoot(document, <HydratedRouter />, {
      onRecoverableError: (error, errorInfo) => {
        console.error(
          "[hydration]",
          error instanceof Error ? error.message : error,
          "\n",
          errorInfo.componentStack,
        );
      },
    });
  });
}
void hydrate().catch((error: unknown) => console.error("Unable to hydrate", error));
