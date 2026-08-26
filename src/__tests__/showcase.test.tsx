import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WorldProvider } from "@/components/motion/WorldWipe";
import ShowcasePage from "@/pages/ShowcasePage";

function Page() {
  return (
    <WorldProvider>
      <ShowcasePage />
    </WorldProvider>
  );
}

describe("ShowcasePage", () => {
  it("renders the hero title and case furniture", async () => {
    render(<Page />);
    expect(screen.getByText(/The Case of/i)).toBeInTheDocument();
    expect(screen.getByText(/Case No\. 1954-PYE/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("PYE HALL")).toBeInTheDocument(),
    );
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
});
