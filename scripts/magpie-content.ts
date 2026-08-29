import { resolve } from "node:path";
import type { Plugin } from "vite";
import { scanArticles } from "../src/lib/content-index";

const VIRTUAL_ID = "virtual:magpie-case-files";

// Serves slug -> reading minutes to the client bundle, computed once by the
// build-side scanner so both content paths share a single formula. Vite caches
// virtual modules; content edits refresh reading times on dev-server restart.
export function magpieCaseFiles(): Plugin {
  const resolved = `\0${VIRTUAL_ID}`;
  return {
    name: "magpie-case-files",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return resolved;
      return null;
    },
    async load(id) {
      if (id !== resolved) return null;
      const articles = await scanArticles(resolve(process.cwd(), "content/files"));
      const minutes = Object.fromEntries(
        articles.map((article) => [article.slug, article.readingTimeMinutes]),
      );
      return `export const caseFileReadingTime = ${JSON.stringify(minutes)};`;
    },
  };
}
