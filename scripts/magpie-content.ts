import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import { scanArticles } from "../src/lib/content-index";

const VIRTUAL_ID = "virtual:magpie-case-files";

// Generates a public metadata manifest and body imports from the validated
// build-side scanner. Drafts never receive a public import. Vite caches
// virtual modules; restart after content changes so SSR and client indexes agree.
export function magpieCaseFiles(): Plugin {
  const resolved = `\0${VIRTUAL_ID}`;
  return {
    name: "magpie-case-files",
    enforce: "pre",
    configureServer(server) {
      const contentDir = resolve(process.cwd(), "content/files");
      let timer: ReturnType<typeof setTimeout> | undefined;
      const refresh = (event: string, file: string) => {
        if (!["add", "change", "unlink"].includes(event)) return;
        if (dirname(resolve(file)) !== contentDir || !file.endsWith(".mdx")) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          void server.restart().catch((error: unknown) => {
            server.config.logger.error(`Content refresh failed: ${String(error)}`);
          });
        }, 150);
      };
      server.watcher.on("all", refresh);
      server.httpServer?.once("close", () => {
        clearTimeout(timer);
        server.watcher.off("all", refresh);
      });
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return resolved;
      return null;
    },
    async load(id, options) {
      if (id !== resolved) return null;
      const articles = await scanArticles(resolve(process.cwd(), "content/files"));
      const published = articles.filter((article) => !article.frontmatter.draft);
      const metadata = published.map(({ slug, frontmatter, readingTimeMinutes }) => ({
        slug,
        frontmatter,
        readingTimeMinutes,
      }));
      const loaders = published.map(
        ({ slug }) =>
          `${JSON.stringify(slug)}: () => import(${JSON.stringify(`/content/files/${slug}.mdx`)})`,
      );
      const server = options?.ssr || this.environment.config.consumer === "server";
      const imports = server
        ? published
            .map(
              ({ slug }, index) =>
                `import Article${index} from ${JSON.stringify(`/content/files/${slug}.mdx`)};`,
            )
            .join("\n")
        : "";
      const components = server
        ? published.map(({ slug }, index) => `${JSON.stringify(slug)}: Article${index}`).join(",")
        : "";
      return `${imports}
export const publicComponents = {${components}};
export const publicArticles = ${JSON.stringify(metadata)};
export const articleLoaders = {${loaders.join(",")}};`;
    },
  };
}
