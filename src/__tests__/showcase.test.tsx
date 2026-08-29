import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import ShowcasePage from "@/pages/ShowcasePage";

function Page() {
  return (
    <MemoryRouter>
      <WorldProvider>
        <VeilProvider>
          <ShowcasePage />
        </VeilProvider>
      </WorldProvider>
    </MemoryRouter>
  );
}

describe("ShowcasePage", () => {
  it("renders the hero title and case furniture", async () => {
    render(<Page />);
    expect(screen.getAllByText(/The Case of/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CASE 1954-PYE REOPENED/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText("PYE HALL")).toBeInTheDocument());
  });

  it("flips the world when the divider switch is toggled", async () => {
    const user = userEvent.setup();
    const { container } = render(<Page />);
    expect(document.documentElement.dataset.world).toBe("red");
    await user.click(screen.getByRole("switch"));
    await waitFor(() => {
      expect(document.documentElement.dataset.world).toBe("black");
    });
    expect(container).toBeTruthy();
  });

  it("steps the magpie rhyme counter", async () => {
    const user = userEvent.setup();
    render(<Page />);
    expect(screen.getByText("One for sorrow")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /one magpie more/i }));
    expect(screen.getByText("Two for joy")).toBeInTheDocument();
  });

  it("wires the p1 motion primitives into the page", () => {
    render(<Page />);
    expect(screen.getByRole("marquee")).toBeInTheDocument();
    expect(screen.getByLabelText("Exhibit gallery")).toHaveAttribute("data-variant", "pinned");
    expect(
      screen.getByRole("separator", { name: "Drag to resize the two worlds" }),
    ).toBeInTheDocument();
  });

  it("points the cover at the latest archive entries", () => {
    render(<Page />);
    expect(screen.getAllByText(/FROM THE ARCHIVE/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /the case of the blazing build/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /attention is a witness/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /the case of the vanishing gradient/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open the archive/i }).getAttribute("href")).toBe(
      "/files",
    );
  });
});
