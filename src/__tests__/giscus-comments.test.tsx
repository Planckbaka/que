import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { GiscusComments } from "@/components/comments/GiscusComments";
import { VeilProvider } from "@/components/motion/Veil";
import { useWorld, WorldProvider } from "@/components/motion/WorldWipe";

const CONFIG = {
  repo: "Planckbaka/que",
  repoId: "R_test",
  category: "Marginalia",
  categoryId: "DIC_test",
};

function WorldToggleButton() {
  const { world, toggle } = useWorld();
  return (
    <button type="button" onClick={toggle}>
      world is {world}
    </button>
  );
}

function Harness({ configured }: { configured?: boolean }) {
  return (
    <MemoryRouter>
      <WorldProvider>
        <VeilProvider>
          {configured ? <GiscusComments config={CONFIG} /> : <GiscusComments />}
          <WorldToggleButton />
        </VeilProvider>
      </WorldProvider>
    </MemoryRouter>
  );
}

describe("GiscusComments unconfigured (P4 default)", () => {
  it("prints the later-printing notice and injects nothing", () => {
    const { container } = render(<Harness />);
    expect(screen.getByText(/arrive in a later printing/i)).toBeTruthy();
    expect(container.querySelector("script[src*='giscus']")).toBeNull();
  });
});

describe("GiscusComments configured", () => {
  it("mounts the giscus script with the repo contract", async () => {
    const { container } = render(<Harness configured />);
    await waitFor(() => {
      expect(container.querySelector("script[src='https://giscus.app/client.js']")).toBeTruthy();
    });
    const script = container.querySelector("script[src='https://giscus.app/client.js']");
    expect(script?.getAttribute("data-repo")).toBe("Planckbaka/que");
    expect(script?.getAttribute("data-repo-id")).toBe("R_test");
    expect(script?.getAttribute("data-category")).toBe("Marginalia");
  });

  it("re-voices the giscus theme when the world flips", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness configured />);
    await waitFor(() => {
      expect(container.querySelector("script[src*='giscus']")).toBeTruthy();
    });
    const postMessage = vi.fn();
    const frame = document.createElement("iframe");
    frame.className = "giscus-frame";
    Object.defineProperty(frame, "contentWindow", { value: { postMessage } });
    container.querySelector("[data-giscus-repo]")?.appendChild(frame);

    await user.click(screen.getByRole("button", { name: /world is red/i }));
    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        { giscus: { setConfig: { theme: "noborder_dark" } } },
        "https://giscus.app",
      );
    });
    // The world wipe busy-guards for ~1.1s (cover + reveal); keep clicking
    // until the toggle lands, then expect the re-voiced theme.
    await waitFor(
      async () => {
        await user.click(screen.getByRole("button", { name: /world is black/i }));
        expect(screen.getByRole("button", { name: /world is red/i })).toBeTruthy();
      },
      { timeout: 4000 },
    );
    expect(postMessage).toHaveBeenLastCalledWith(
      { giscus: { setConfig: { theme: "noborder_light" } } },
      "https://giscus.app",
    );
  });
});
