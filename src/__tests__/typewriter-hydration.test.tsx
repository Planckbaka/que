import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { TypewriterText } from "@/components/motion/TypewriterText";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("motion/react", () => ({ useReducedMotion: () => preference.reduced }));
it("hydrates server text before revealing the reduced-motion final state", async () => {
  const tree = <TypewriterText text="A readable note" />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(tree);
  const original = container.firstElementChild;
  preference.reduced = true;
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError });
    });
    expect(container.firstElementChild).toBe(original);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("A readable note");
  } finally {
    await act(async () => root?.unmount());
    preference.reduced = false;
  }
});
