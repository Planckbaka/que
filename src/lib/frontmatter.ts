import readingTime from "reading-time";
import { z } from "zod";

// Single source of truth for case-file frontmatter (spec §4.1). Both content
// readers — the Node-side fs scanner and the client-side glob collection —
// validate through this schema, so a slug rule or field change happens once.
export const FileFrontmatterSchema = z.object({
  title: z.string().min(1),
  kicker: z.string().min(1),
  world: z.enum(["red", "black"]),
  tags: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1).max(160),
  date: z.string().date(),
  draft: z.boolean().optional(),
});

export type FileFrontmatter = z.infer<typeof FileFrontmatterSchema>;

export function slugFromFile(filename: string): string {
  if (filename.includes("/") || filename.includes("\\")) {
    throw new Error(`slugFromFile expects a bare filename, got: ${filename}`);
  }
  if (!filename.endsWith(".mdx")) {
    throw new Error(`content files must be .mdx, got: ${filename}`);
  }
  return filename.slice(0, -".mdx".length);
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(readingTime(body).minutes));
}

export function compareNewestFirst(
  a: { frontmatter: FileFrontmatter },
  b: { frontmatter: FileFrontmatter },
): number {
  return Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date);
}
