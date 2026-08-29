import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { Plugin } from "vite";
import { scanArticles } from "../src/lib/content-index";
import { buildRssXml, type RssPost } from "../src/lib/rss";
import { site } from "../src/lib/site";
import { buildRobotsTxt, buildSitemapXml, type SitemapEntry } from "../src/lib/sitemap";

const CLIENT_DIR = resolve(process.cwd(), "build/client");

type CardPalette = { bg: string; fg: string; accent: string; rule: string };

// Palette law (SKILL.md §2): physical token values only — black world gets the
// ink card, red world the paper card, accents stay within the two stamp reds.
const CARD_PALETTES: Record<"red" | "black", CardPalette> = {
  red: { bg: "#f3eee3", fg: "#17120c", accent: "#c8281e", rule: "#17120c" },
  black: { bg: "#14100b", fg: "#f3eee3", accent: "#e03a24", rule: "#f3eee3" },
};

type SatoriChild = SatoriNode | string;

type SatoriNode = {
  type: string;
  props: { style: Record<string, string | number>; children?: SatoriChild | SatoriChild[] };
};

async function loadFonts(): Promise<
  {
    name: string;
    data: Buffer;
    weight: 400;
    style: "normal";
  }[]
> {
  const read = (path: string) => readFile(resolve(process.cwd(), path));
  const [anton, courier] = await Promise.all([
    read("node_modules/@fontsource/anton/files/anton-latin-400-normal.woff"),
    read("node_modules/@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff"),
  ]);
  return [
    { name: "Anton", data: anton, weight: 400, style: "normal" },
    { name: "Courier Prime", data: courier, weight: 400, style: "normal" },
  ];
}

function ogCard(input: {
  kicker: string;
  title: string;
  world: "red" | "black";
  numeral: string;
}): SatoriNode {
  const palette = CARD_PALETTES[input.world];
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: palette.bg,
        color: palette.fg,
        padding: "72px",
        position: "relative",
      },
      children: [
        {
          // Chapter-numeral watermark. satori 0.33 renders neither textStroke
          // nor WebkitTextStroke through resvg, so the "stroke" intent lands
          // as a low-alpha fill of the accent red (visually equivalent).
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-40px",
              right: "0px",
              fontFamily: "Anton",
              fontSize: "430px",
              lineHeight: "1",
              color: `${palette.accent}26`,
            },
            children: input.numeral,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              position: "relative",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Courier Prime",
                    fontSize: "26px",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: palette.accent,
                  },
                  children: input.kicker,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Anton",
                    fontSize: "92px",
                    lineHeight: "1.05",
                    textTransform: "uppercase",
                    maxWidth: "940px",
                  },
                  children: input.title,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Courier Prime",
              fontSize: "22px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              borderTop: `2px solid ${palette.rule}`,
              paddingTop: "24px",
              position: "relative",
            },
            children: [
              {
                type: "div",
                props: { style: {}, children: site.author },
              },
              {
                type: "div",
                props: { style: {}, children: site.title },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderPng(node: SatoriNode, fonts: Awaited<ReturnType<typeof loadFonts>>) {
  // Satori's element type is React's ReactNode; the hand-built tree is
  // structurally compatible, bridged with a single boundary cast.
  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}

// Build-time OG cards + RSS feed (spec §4.4). closeBundle writes into the
// static output; the `written` flag guards the client/server double pass.
export function magpiePipeline(): Plugin {
  let written = false;
  return {
    name: "magpie-pipeline",
    apply: "build",
    closeBundle: {
      order: "post",
      handler: async () => {
        if (written) return;
        written = true;
        const articles = (await scanArticles(resolve(process.cwd(), "content/files"))).filter(
          (article) => !article.frontmatter.draft,
        );

        const fonts = await loadFonts();
        await mkdir(resolve(CLIENT_DIR, "og"), { recursive: true });

        const cards = [
          {
            file: "og/index.png",
            card: ogCard({
              kicker: "Case Index · 1954-PYE",
              title: site.title,
              world: "red",
              numeral: "1954",
            }),
          },
          ...articles.map((article, index) => ({
            file: `og/${article.slug}.png`,
            card: ogCard({
              kicker: article.frontmatter.kicker,
              title: article.frontmatter.title,
              world: article.frontmatter.world,
              numeral: String(index + 1).padStart(2, "0"),
            }),
          })),
        ];
        for (const { file, card } of cards) {
          const png = await renderPng(card, fonts);
          await writeFile(resolve(CLIENT_DIR, file), png);
        }

        const posts: RssPost[] = articles.map((article) => ({
          slug: article.slug,
          title: article.frontmatter.title,
          summary: article.frontmatter.summary,
          date: article.frontmatter.date,
        }));
        await writeFile(resolve(CLIENT_DIR, "rss.xml"), buildRssXml(posts, site), "utf8");

        // Sitemap mirrors the prerender manifest one-to-one; article pages use
        // their frontmatter date as lastmod, fixed routes the build day.
        const buildDay = new Date().toISOString().slice(0, 10);
        const sitemapEntries: SitemapEntry[] = [
          { path: "/", lastmod: buildDay },
          { path: "/files", lastmod: buildDay },
          { path: "/lab", lastmod: buildDay },
          { path: "/about", lastmod: buildDay },
          ...articles.map((article) => ({
            path: `/files/${article.slug}`,
            lastmod: article.frontmatter.date,
          })),
        ];
        await writeFile(
          resolve(CLIENT_DIR, "sitemap.xml"),
          buildSitemapXml(sitemapEntries, site),
          "utf8",
        );
        await writeFile(resolve(CLIENT_DIR, "robots.txt"), buildRobotsTxt(site), "utf8");

        // The framework emits a modulepreload link for every chunk in each
        // prerendered route's graph. Thirteen high-priority preloads contend
        // with the render-blocking CSS for the critical window and push FCP
        // past 3s on slow connections (LH mobile: 85 → 92 without them). The
        // inline route-import module re-discovers the same URLs right after
        // first paint, and the Veil covers navigation latency, so nothing of
        // value is lost — strip them from the static HTML.
        const prerendered = await readdir(CLIENT_DIR, { recursive: true });
        for (const entry of prerendered) {
          if (extname(entry) !== ".html") continue;
          const file = resolve(CLIENT_DIR, entry);
          const html = await readFile(file, "utf8");
          const stripped = html.replaceAll(/<link rel="modulepreload"[^>]*\/>/g, "");
          if (stripped !== html) {
            await writeFile(file, stripped, "utf8");
          }
        }
      },
    },
  };
}
