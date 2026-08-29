import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import readingTime from "reading-time";
import { parse as parseYaml } from "yaml";
import {
  compareNewestFirst,
  type FileFrontmatter,
  FileFrontmatterSchema,
  slugFromFile,
} from "./frontmatter";

// Node-only helper. reading-time lives HERE, not in client-shared
// frontmatter.ts: its CJS entry requires node:stream/util, which crashes the
// dev server the moment the client graph pulls it in.
function readingMinutes(body: string): number {
  return Math.max(1, Math.round(readingTime(body).minutes));
}

export type ScannedArticle = {
  slug: string;
  frontmatter: FileFrontmatter;
  body: string;
  readingTimeMinutes: number;
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function splitFrontmatter(raw: string): { yamlSource: string | null; body: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { yamlSource: null, body: raw };
  return { yamlSource: match[1], body: raw.slice(match[0].length) };
}

// Build-side content scan (Node only). react-router.config.ts consumes it for
// the prerender manifest and the OG/RSS pipeline consumes it at closeBundle;
// the client bundle reads the same files through src/lib/content.ts instead.
export async function scanArticles(contentDir: string): Promise<ScannedArticle[]> {
  const entries = await readdir(contentDir);
  const mdxFiles = entries.filter((name) => name.endsWith(".mdx")).sort();

  const articles = await Promise.all(
    mdxFiles.map(async (file) => {
      const raw = await readFile(join(contentDir, file), "utf8");
      const { yamlSource, body } = splitFrontmatter(raw);
      if (yamlSource === null) {
        throw new Error(`${file}: missing frontmatter block`);
      }
      let data: unknown;
      try {
        data = parseYaml(yamlSource);
      } catch (cause) {
        throw new Error(`${file}: invalid YAML frontmatter: ${String(cause)}`);
      }
      const parsed = FileFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`${file}: ${parsed.error.message}`);
      }
      return {
        slug: slugFromFile(file),
        frontmatter: parsed.data,
        body,
        readingTimeMinutes: readingMinutes(body),
      } satisfies ScannedArticle;
    }),
  );

  return articles.sort(compareNewestFirst);
}
