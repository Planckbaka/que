import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import LabPage from "@/pages/LabPage";

describe("hydration /lab", () => {
  it("hydrates server markup without discarding it", async () => {
    const tree = (
      <MemoryRouter initialEntries={["/lab"]}>
        <WorldProvider>
          <VeilProvider>
            <LabPage />
          </VeilProvider>
        </WorldProvider>
      </MemoryRouter>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const originalPage = container.firstElementChild;
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, { onRecoverableError });
      });
      expect(originalPage).not.toBeNull();
      expect(container.firstElementChild).toBe(originalPage);
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
