import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import LabPage from "@/pages/LabPage";

function renderLab() {
  return render(
    <MemoryRouter initialEntries={["/lab"]}>
      <WorldProvider>
        <VeilProvider>
          <LabPage />
        </VeilProvider>
      </WorldProvider>
    </MemoryRouter>,
  );
}

describe("LabPage", () => {
  it("stamps the evidence lab masthead", () => {
    renderLab();
    expect(screen.getAllByText(/EVIDENCE LAB/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Motion on Exhibit/i);
  });

  it("hangs a placard for every primitive under glass", () => {
    renderLab();
    for (const placard of [
      /AnagramText/i,
      /TypewriterText/i,
      /MorphIn & StaggerList/i,
      /Press Tape/i,
      /Halftone/i,
      /HorizontalRail/i,
      /CenterSeam/i,
      /Veil/i,
      /Reading Folio/i,
    ]) {
      expect(screen.getAllByText(placard).length).toBeGreaterThan(0);
    }
  });

  it("offers a live veil wipe and the world switch", () => {
    renderLab();
    expect(screen.getByRole("link", { name: /Wipe to myself/i })).toBeTruthy();
    expect(screen.getByRole("switch")).toBeTruthy();
  });
});
