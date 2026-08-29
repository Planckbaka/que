// Coverage completion: route meta() exports, the catch-all page, and the
// build-side scanner's YAML error branch.
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { scanArticles } from "@/lib/content-index";
import { meta as aboutMeta } from "@/pages/AboutPage";
import { meta as filesMeta } from "@/pages/FilesPage";
import { meta as labMeta } from "@/pages/LabPage";
import NotFoundRedirect, { meta as notFoundMeta } from "@/pages/NotFoundRedirect";
import { meta as showcaseMeta } from "@/pages/ShowcasePage";

describe("route meta exports ship social cards", () => {
  it("showcase meta carries the site identity", () => {
    const tags = showcaseMeta();
    expect(tags.find((t) => "title" in t)?.title).toContain("The Magpie Files");
    expect(
      tags.some((t) => t.content?.includes("og:image")) ||
        tags.some((t) => t.property === "og:image"),
    ).toBe(true);
    expect(tags.some((t) => t.name === "twitter:card")).toBe(true);
  });

  it("archive, lab and colophon metas carry title, description and social tags", () => {
    for (const meta of [filesMeta, labMeta, aboutMeta]) {
      const tags = meta();
      expect(tags.find((t) => "title" in t)?.title).toBeTruthy();
      expect(tags.some((t) => t.name === "description")).toBe(true);
      expect(tags.some((t) => t.name === "twitter:card")).toBe(true);
      expect(tags.some((t) => t.property === "og:image")).toBe(true);
    }
  });
});

describe("NotFoundRedirect", () => {
  it("meta marks the page sealed and the component mounts", () => {
    const tags = notFoundMeta();
    expect(tags.find((t) => "title" in t)?.title).toContain("Sealed File");
    expect(tags.some((t) => t.name === "description")).toBe(true);
    expect(
      render(
        <MemoryRouter>
          <NotFoundRedirect />
        </MemoryRouter>,
      ).container,
    ).toBeTruthy();
  });
});

describe("scanArticles yaml diagnostics", () => {
  const dirs: string[] = [];
  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
  });

  it("throws with the filename for malformed yaml", async () => {
    const dir = await mkdtemp(join(tmpdir(), "magpie-yaml-"));
    dirs.push(dir);
    await writeFile(
      join(dir, "broken-yaml.mdx"),
      "---\ntitle: [unclosed\n  bad indentation here\n---\nBody.",
      "utf8",
    );
    await expect(scanArticles(dir)).rejects.toThrow(/broken-yaml\.mdx/);
  });
});
