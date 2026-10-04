import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import AboutPage from "@/pages/AboutPage";

describe("About the author", () => {
  it("separates the author's introduction from the visual inspiration", () => {
    render(
      <MemoryRouter>
        <VeilProvider>
          <AboutPage />
        </VeilProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Orion Arch");
    expect(screen.getByText(/I’m a Python and Go backend engineer/)).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveTextContent("Magpie Murders");
    expect(screen.queryByText(/pending|framework mode|algorithms detective/)).toBeNull();
    expect(screen.getByRole("link", { name: /Read the articles/ })).toHaveAttribute(
      "href",
      "/files",
    );
    expect(screen.getByRole("link", { name: /Follow via RSS/ })).toHaveAttribute(
      "href",
      "/rss.xml",
    );
  });
});
