import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { VeilProvider } from "@/components/motion/Veil";
import { WorldProvider } from "@/components/motion/WorldWipe";
import { publishedArticles } from "@/lib/content";
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

describe("Blog cover", () => {
  it("introduces the blog and author with working reading links", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Orion.*Arch/);
    expect(screen.getByText(/The personal blog of Orion Arch/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read the articles/ })).toHaveAttribute(
      "href",
      "/files",
    );
    expect(screen.getByRole("link", { name: /About the author/ })).toHaveAttribute(
      "href",
      "/about",
    );
  });
  it("puts real articles directly after the cover", () => {
    const { container } = render(<Page />);
    const writing = screen.getByRole("region", { name: "Latest writing" });
    for (const article of publishedArticles.slice(0, 3)) {
      expect(
        within(writing).getByRole("link", { name: new RegExp(article.frontmatter.title) }),
      ).toHaveAttribute("href", `/files/${article.slug}`);
    }
    expect(container.textContent).not.toMatch(
      /PYE HALL|Susan Ryeland|Atticus Pünd|Meet the Suspects|Twelve Objects/,
    );
    expect(screen.getByRole("region", { name: "Inside my notebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub \/ @orionarch26/ })).toHaveAttribute(
      "href",
      "https://github.com/orionarch26",
    );
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("separator")).toBeNull();
  });
  it("switches the reading tracks as well as the world", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const trackRegion = screen.getByRole("region", { name: /Two threads/ });
    expect(within(trackRegion).getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "Engineering Notes",
    );
    await user.click(screen.getByRole("switch"));
    await waitFor(() => expect(document.documentElement.dataset.world).toBe("black"));
    expect(within(trackRegion).getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "Frontier Notes",
    );
  });
});
