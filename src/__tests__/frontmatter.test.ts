import { describe, expect, it } from "vitest";
import { FileFrontmatterSchema, slugFromFile } from "@/lib/frontmatter";

const valid = {
  title: "The Case of the Vanishing Gradient",
  kicker: "Algorithm Files · Case No. 017",
  world: "black",
  tags: ["deep-learning", "optimization"],
  summary: "A detective story about a loss that refused to leave a trace.",
  date: "2026-08-29",
};

describe("FileFrontmatterSchema", () => {
  it("accepts a complete frontmatter", () => {
    const parsed = FileFrontmatterSchema.parse(valid);
    expect(parsed.title).toBe("The Case of the Vanishing Gradient");
    expect(parsed.world).toBe("black");
  });

  it("treats draft as optional and absent by default", () => {
    const parsed = FileFrontmatterSchema.parse(valid);
    expect(parsed.draft).toBeUndefined();
  });

  it("accepts an explicit draft flag", () => {
    const parsed = FileFrontmatterSchema.parse({ ...valid, draft: true });
    expect(parsed.draft).toBe(true);
  });

  it("rejects empty tags", () => {
    expect(() => FileFrontmatterSchema.parse({ ...valid, tags: [] })).toThrow();
  });

  it("rejects summaries over 160 characters", () => {
    expect(() =>
      FileFrontmatterSchema.parse({ ...valid, summary: "a".repeat(161) }),
    ).toThrow();
  });

  it("rejects unknown worlds", () => {
    expect(() => FileFrontmatterSchema.parse({ ...valid, world: "grey" })).toThrow();
  });

  it("rejects non-ISO dates", () => {
    expect(() => FileFrontmatterSchema.parse({ ...valid, date: "August 29, 2026" })).toThrow();
  });
});

describe("slugFromFile", () => {
  it("strips the mdx suffix", () => {
    expect(slugFromFile("the-case-of-x.mdx")).toBe("the-case-of-x");
  });

  it("refuses path separators", () => {
    expect(() => slugFromFile("nested/the-case-of-x.mdx")).toThrow();
  });

  it("refuses non-mdx files", () => {
    expect(() => slugFromFile("the-case-of-x.md")).toThrow();
  });
});
