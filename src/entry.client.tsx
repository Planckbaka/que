// Custom client entry: identical to the RRv7 default (startTransition +
// HydratedRouter), plus onRecoverableError so hydration recoveries surface
// their component stack in the console instead of failing silently.
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

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
