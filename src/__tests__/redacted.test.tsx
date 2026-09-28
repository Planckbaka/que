import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Redacted } from "@/components/magpie/Redacted";

describe("Redacted", () => {
  it("lets keyboard readers reveal and hide a note with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<Redacted>The missing explanation.</Redacted>);
    const note = screen.getByRole("button", { name: "Reveal note: The missing explanation." });

    await user.tab();
    expect(note).toHaveFocus();
    expect(note).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{Enter}");
    expect(note).toHaveAttribute("aria-expanded", "true");
    expect(note).toHaveAccessibleName("Hide note: The missing explanation.");
    expect(note).not.toHaveClass("text-transparent");

    await user.keyboard(" ");
    expect(note).toHaveAttribute("aria-expanded", "false");
    expect(note).toHaveClass("text-transparent");
  });

  it("lets pointer readers toggle a note without relying on hover", async () => {
    const user = userEvent.setup();
    render(<Redacted>A note on a touch screen.</Redacted>);
    const note = screen.getByRole("button", { name: "Reveal note: A note on a touch screen." });

    await user.click(note);
    expect(note).toHaveAttribute("aria-expanded", "true");
    await user.click(note);
    expect(note).toHaveAttribute("aria-expanded", "false");
  });
});
