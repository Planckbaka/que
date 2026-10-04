// src/__tests__/pageflutter.test.tsx
// PageFlutter 回归：装饰雨层 aria-hidden + 六片纸 + 每片三道装订线；
// reduced-motion 水合不报错（JS 侧不 animate，CSS kill-switch 负责冻结
// 残留的内联 transform —— index.css .page-flutter-sheet）。
import { act, render } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageFlutter } from "@/components/motion/PageFlutter";

describe("PageFlutter", () => {
  afterEach(() => {
    vi.unstubAllGlobals(); // 回到 setup.ts 的默认 matchMedia 存根（matches:false）
  });

  it("renders six sheets inside an aria-hidden decorative layer", () => {
    const { container } = render(<PageFlutter />);
    const root = container.firstElementChild as HTMLElement | null;
    expect(root?.getAttribute("aria-hidden")).toBe("true");
    expect(root?.className).toContain("pointer-events-none");

    const sheets = container.querySelectorAll(".page-flutter-sheet");
    expect(sheets).toHaveLength(6);
    for (const sheet of sheets) {
      expect(sheet.querySelectorAll("span")).toHaveLength(3);
    }
  });

  it("hydrates the same server markup when the client prefers reduced motion", async () => {
    const tree = <PageFlutter />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const serverRoot = container.firstElementChild;
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, { onRecoverableError });
      });
      expect(container.firstElementChild).toBe(serverRoot);
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(container.querySelectorAll(".page-flutter-sheet")).toHaveLength(6);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
