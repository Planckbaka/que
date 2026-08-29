import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExhibitCard } from "@/components/magpie/ExhibitCard";

describe("ExhibitCard", () => {
  it("labels the exhibit and renders its evidence", () => {
    render(
      <ExhibitCard exhibit="EXHIBIT A-113" caption="Fig. 1">
        <p>Residual connections, filed as evidence.</p>
      </ExhibitCard>,
    );
    expect(screen.getByText("EXHIBIT A-113")).toBeTruthy();
    expect(screen.getByText("Fig. 1")).toBeTruthy();
    expect(screen.getByText(/Residual connections/)).toBeTruthy();
  });

  it("omits the caption slot when no caption is given", () => {
    render(
      <ExhibitCard exhibit="EXHIBIT B-002">
        <p>Content.</p>
      </ExhibitCard>,
    );
    expect(screen.getByText("EXHIBIT B-002")).toBeTruthy();
  });
});
