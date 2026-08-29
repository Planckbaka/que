# Magpie P2 内容管线 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 spec §4 的内容管线——MDX 源、frontmatter Zod 构建期校验、Shiki 双主题构建期高亮、OG 图与 RSS 构建期生成、prerender 清单自动化——并以 ≥3 篇真实种子文章（red/black 两轨各 ≥1）跑通全管线。

**Architecture:** 内容单一事实源 = `content/files/*.mdx`。构建期两条读取路径共享同一 schema：① Node 侧 `content-index.ts`（fs 扫描，供 react-router.config.ts 的 prerender 清单与 OG/RSS 脚本）；② 客户端侧 `content.ts`（`import.meta.glob` eager 收集，prerender 渲染与浏览器 hydration 同源）。MDX 经 `@mdx-js/rollup` 在 Vite 内联编译（含 remark frontmatter 导出与 @shikijs/rehype 双主题高亮）；OG/RSS 由自定义 Vite 插件在 closeBundle 写入静态产物。P1 教训（single-source convergence）落实为：slug 规则与 schema 只在 `frontmatter.ts` 定义一次，两条路径各自消费。

**Tech Stack:** @mdx-js/rollup · remark-frontmatter + remark-mdx-frontmatter · shiki + @shikijs/rehype · zod · reading-time · yaml · satori + @resvg/resvg（全部构建期，无浏览器运行时负担；zod/reading-time 随客户端 bundle 进 prerender，属 spec §6 明示新增）

## Global Constraints

- 三色法则扩展到 Shiki 主题与 OG 图：仅 paper/paper-dim/ink 各明度阶 + stamp 红；T2 附调色审计测试。
- 运动预算不变；P2 不新增动效（正文入场动画留给 P3 正文模板）。
- 内容语言英文（D3）；中文仅装饰性刊名。
- TS strict 全家桶 + erasableSyntaxOnly 不变（scripts 同样受限，禁止 enum/namespace）。
- 测试禁 test.skip/.only 与占位实现；Biome 2 空格、行宽 ≤100、`import type`。
- **prerender 清单本阶段 = `["/", ...published slugs]`**；`/files`、`/lab`、`/about` 与 `_seo` layout 属 P3，路由落地时再进固定清单（spec §3 的固定四项在 P3 激活）。
- site 域名占位 `https://themagpiefiles.pages.dev`（P4 上线时定稿），author = "Orion Arch"（D5）。

---

## Task 总览

| # | 任务 | 性质 |
|---|------|------|
| T1 | 依赖安装 + frontmatter schema + content-index | 纯函数 TDD |
| T2 | MDX 管线接入 + Shiki 双主题 | Vite 装配 + 主题数据 |
| T3 | 种子文章 ×3 | 内容 |
| T4 | content 集合 + 最小文章路由 + prerender 自动化 | 路由层 |
| T5 | OG 图 + RSS 构建期生成 | 自定义 Vite 插件 |
| T6 | 整备验收门 + PR | 门禁五连 |

---

### Task 1: 依赖安装 + frontmatter schema + content-index

**Files:**
- Modify: `package.json`
- Create: `src/lib/frontmatter.ts` / `src/lib/content-index.ts` / `src/lib/site.ts`
- Test: `src/__tests__/frontmatter.test.ts` / `src/__tests__/content-index.test.ts`

**Interfaces:**
- Produces:
  - `FileFrontmatterSchema`（zod）：`title` `kicker` 非空、`world: "red"|"black"`、`tags: string[] ≥1`、`summary: 1..160`、`date: ISO 日期串`、`draft?: boolean`（不 transform，保持 optional）。
  - `slugFromFile(filename: string): string` —— 去 `.mdx` 后缀即 slug（禁止路径分隔符）。
  - `scanArticles(contentDir: string): Promise<ScannedArticle[]>` —— Node 侧 fs 扫描：剥 `---` 头、yaml 解析、schema 校验（非法即 throw，文件名入错误信息）、`reading-time` 计算分钟数；按 date 降序；导出 `{ slug, frontmatter, body, readingTimeMinutes }`。
  - `site`（`src/lib/site.ts`）：`{ url, title, author, description }`。

**清单：**

- [x] **Step 1** 安装依赖：
```bash
npm i zod reading-time
npm i -D @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter shiki @shikijs/rehype yaml satori @resvg/resvg-js
```
- [x] **Step 2** 写失败测试：schema 三态（合法通过 / 缺 tags 抛错 / summary>160 抛错）；`slugFromFile("the-case-of-x.mdx")`；`scanArticles` 在 `fs.mkdtemp` 临时目录写入两篇（一篇合法、一篇缺 title）断言 throw 且消息含文件名；合法篇字段与 readingTime > 0。
- [x] **Step 3** 确认红灯后实现 `frontmatter.ts` / `content-index.ts` / `site.ts`，测试全绿。
- [x] **Step 4** 门禁四连（build/typecheck/test/lint），提交 `feat(content): frontmatter schema and build-side index (P2/T1)`。

### Task 2: MDX 管线接入 + Shiki 双主题

**Files:**
- Modify: `vite.config.ts`（mdx 插件，vitest 与 build 都启用）
- Create: `src/lib/code-themes.ts` / `src/types/mdx.d.ts`
- Test: `src/__tests__/code-themes.test.ts`

**Interfaces:**
- Produces:
  - `paperTheme` / `inkTheme`（Shiki `ThemeRegistration`）：paper=纸上墨字、ink=墨上纸字；仅三色明度阶 + stamp 红。
  - `*.mdx` 模块类型：default `MDXContent({ components? })` + `export const frontmatter: Record<string, unknown>`。
  - MDX 编译词表（components 注入点在 T4）：`Redacted` / `ClueChip` / `HalftoneImage` / `ExhibitCard`（新建 `src/components/magpie/ExhibitCard.tsx`，evidence 卡变体：2px 边框 + shadow-print-sm + Courier 标注行）。

**清单：**

- [x] **Step 1** 写失败测试（调色审计）：遍历两主题全部 `settings[].settings` 的 color/background/fontColor 等 hex，归一化小写后断言 ∈ 允许集——白名单以 tokens.css 实值为准：`#f3eee3` `#e7dfcc` `#17120c` `#c8281e` `#e03a24` + `#rrggbbaa` 形式的 ink/paper alpha 变体。
- [x] **Step 2** `code-themes.ts` 实现：scope 覆盖 keyword/storage/type/string/comment/function/constant/entity 等；`bg` 置 `transparent`（页面底色由世界 token 决定）。
- [x] **Step 3** `vite.config.ts` 接入（reactRouter 条件加载逻辑不动）：
```ts
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeShiki from "@shikijs/rehype/core";
import { createHighlighter } from "shiki";
// highlighter 单例（buildStart 前惰性创建），themes:{light:paperTheme,dark:inkTheme}, defaultColor:"light"
plugins: [ ...(process.env.VITEST ? [] : [reactRouter()]), mdx({...}), tailwindcss() ]
```
- [x] **Step 4** `src/types/mdx.d.ts` 环境声明；确认 `npx vitest run src/__tests__/code-themes.test.ts` 绿。
- [x] **Step 5** 门禁四连，提交 `feat(content): mdx pipeline with dual-theme shiki (P2/T2)`。

### Task 3: 种子文章 ×3

**Files:**
- Create: `content/files/the-case-of-the-vanishing-gradient.mdx`（black / Algorithm Files，含 shiki 代码块 ≥2 语言、`<Redacted>`、`<ClueChip>`）
- Create: `content/files/one-for-sorrow-attention-is-a-witness.mdx`（black / Algorithm Files，含 `<ExhibitCard>`）
- Create: `content/files/the-case-of-the-blazing-build.mdx`（red / Engineering Notes，Go 构建基建手记，含代码块）

**Interfaces:**
- Produces: 三篇英文真实文章（各 ≥500 词），frontmatter 全字段合法（date 2026 年内、summary ≤160、tags ≥1）；black 轨侦探叙事包裹算法专题，red 轨工程手记——两轨文风按 spec §2。

- [x] **Step 1** 撰写三篇（正文真实有货：梯度消失一案给出链式法则证词与残差连接的破案陈述；快讯带文案押 nursery rhyme 韵）。
- [x] **Step 2** `node -e` 冒烟：`scanArticles` 全绿（借 T1 模块）。
- [x] **Step 3** 提交 `feat(content): three seed case files across both worlds (P2/T3)`。

### Task 4: content 集合 + 最小文章路由 + prerender 自动化

**Files:**
- Create: `src/lib/content.ts`（客户端集合）/ `src/pages/FilePage.tsx`
- Modify: `app/routes.ts` / `react-router.config.ts` / `src/index.css`（shiki 双主题翻转 CSS + 行号 counter）
- Test: `src/__tests__/content.test.tsx` / `src/__tests__/filepage.test.tsx`

**Interfaces:**
- Produces:
  - `articles: Article[]` / `getArticle(slug)`：`Article = { slug, frontmatter: FileFrontmatter, Component, readingTimeMinutes }`，glob eager + `FileFrontmatterSchema.parse`（prerender 渲染即构建期门）；`publishedArticles` 过滤 draft。
  - `FilePage`：`meta()` 输出 title/description/canonical/og:title/og:description/og:image(`{site.url}/og/{slug}.png`)/og:type；页面 = `<div data-world={world}>` 域内 kicker + Anton h1 + `prose` 正文（Crimson Pro ≤68ch）+ MDX components 词表注入；draft 命中时渲染 SEALED FILE 告示。
  - `react-router.config.ts`：`prerender: async () => ["/", ...published.map(p => `/files/${p.slug}`)]`（`process.cwd()` 解析 content 目录）。
- CSS 契约（附录冻结）：`defaultColor:"light"` 输出内联色 + `--shiki-dark` 变量；`[data-world="black"] .shiki, … span { color: var(--shiki-dark) }` 翻转；行号 `.shiki .line::before` CSS counter + font-machine。

- [x] **Step 1** 失败测试：content.test（三篇被收集、slug/frontmatter/readingTime 就位、date 降序）；filepage.test（render FilePage with seed slug → h1 文本、`pre.shiki` 存在、span 带 `--shiki-dark`、Redacted 存在；draft slug → SEALED FILE；meta() 断言 og:image 拼接）。
- [x] **Step 2** 实现 content.ts / FilePage / routes.ts 注册（`route("files/:slug", …)` 置于 `route("*")` 前）/ index.css 契约块 / react-router.config.ts。
- [x] **Step 3** 门禁四连 + prerender 冒烟：`npm run build` 后断言 `build/client/files/the-case-of-the-vanishing-gradient/index.html` 存在且含 `<h1`、meta description、`/og/…png` 引用；draft slug 无产物目录。
- [x] **Step 4** 提交 `feat(content): article collection, minimal file page, auto prerender (P2/T4)`。

### Task 5: OG 图 + RSS 构建期生成

**Files:**
- Create: `scripts/magpie-pipeline.ts`（Vite 插件，closeBundle 幂等写盘）/ `src/lib/rss.ts`（纯函数 XML 构造）
- Modify: `vite.config.ts`（注册插件，`apply:"build"`）/ `tsconfig.node.json`（include 追加 `scripts/**/*.ts`）
- Test: `src/__tests__/rss.test.ts`

**Interfaces:**
- Produces:
  - `buildRssXml(posts, site): string` —— RSS 2.0，channel=site 元数据，item=title/link(`{url}/files/{slug}`)/guid/pubDate(RFC822)/description=summary；XML 转义完整。
  - 插件 closeBundle：写 `build/client/rss.xml`；satori 渲染 1200×630 SVG（paper 底 / ink 底按 world 翻转、Anton 大标题换行、kicker Courier 行、章节号 textStroke 描边水印、底部署名 "Orion Arch · The Magpie Files"）→ @resvg/resvg.js 转 PNG → `build/client/og/{slug}.png` + `build/client/og/index.png`（站卡）；字体从 `node_modules/@fontsource/{anton,courier-prime}/files/*-latin-400-normal.woff` 读取（satori 支持 woff；woff2 不支持）。
  - 幂等：`written` 标志防 client/server 双 pass 重复执行。

- [x] **Step 1** 失败测试：buildRssXml 三篇输入 → item 数、pubDate 格式、`&` 转义（summary 含 `&`）、draft 不进 feed。
- [x] **Step 2** 实现 rss.ts 与插件；`npm run build` 冒烟：`test -f build/client/rss.xml`、`og/*.png` 文件头为 PNG（`\x89PNG`）、`og/index.png` 存在。
- [x] **Step 3** 门禁四连，提交 `feat(content): og cards and rss feed at build time (P2/T5)`。

### Task 6: 整备验收门 + PR

- [x] **Step 1 验收门（P2 DoD，失败即回对应任务）**
```bash
npm run build
test -f build/client/rss.xml && test -f build/client/og/index.png && echo PIPELINE-OK
grep -q "<h1" build/client/files/the-case-of-the-vanishing-gradient/index.html && echo PRERENDER-OK
npm run typecheck && npm test && npm run lint
```
- [x] **Step 2** reduced-motion 审计不回归（现有 34 用例 + 新增全绿即可）。
- [x] **Step 3** 分支 `magpie-p2-content-pipeline` 推送并开 PR；合并后 `docs/plan` 记录勾选状态随 PR 入库。

---

## 附录 A：冻结接口契约（供 P3-P4 计划引用）

| 契约 | 值 |
|------|-----|
| `FileFrontmatter` | title/kicker/world(red\|black)/tags≥1/summary≤160/date(ISO)/draft? |
| slug 规则 | 文件名去 `.mdx`，仅 `content/files/*.mdx` |
| `Article`（content.ts） | `{ slug, frontmatter, Component, readingTimeMinutes }`，date 降序 |
| `ScannedArticle`（content-index） | `{ slug, frontmatter, body, readingTimeMinutes }` |
| `site` | `{ url: "https://themagpiefiles.pages.dev"(P4 定稿), title, author: "Orion Arch", description }` |
| prerender 清单 | `["/", ...published slugs→/files/:slug]`；P3 追加 `/files` `/lab` `/about` |
| Shiki 主题契约 | themes {light:paper,dark:ink} + defaultColor "light"；`[data-world="black"]` 经 CSS 变量翻转；行号 CSS counter |
| OG 产物 | `build/client/og/{slug}.png` 1200×630 + `og/index.png`；meta og:image = `{site.url}/og/{slug}.png` |
| RSS 产物 | `build/client/rss.xml`，item link `{site.url}/files/{slug}` |
| MDX 词表 | `<Redacted>` `<ClueChip>` `<HalftoneImage>` `<ExhibitCard>`（components prop 注入） |

---

## 附录 B：实施记录与偏差（P2 落地时回填）

- **依赖版本**：实际落位 shiki v4 / @shikijs/rehype v4 / remark-mdx-frontmatter v5 / zod v4 / satori 0.33，均高于计划预估的 API 世代，`themes:{light,dark}` + `defaultColor:"light"` 契约不变。
- **T3 冒烟**：`node -e` 原生加载 TS 需显式扩展名，与仓库 bundler 风格冲突；改为永久 vitest 守护测试（`seed-content.test.tsx`，同时覆盖 MDX 编译与 Shiki 产物断言）。
- **T4 读取时长单源**：vitest 的 vite-node 不支持 glob `query:"?raw"`；改为 `scripts/magpie-content.ts` 虚拟模块插件，由 content-index 扫描器一次性产出 `slug → readingTimeMinutes`，构建/prerender/vitest 三环境同源。
- **T4 SEO**：root 静态 `<title>`/description 与路由 meta 双写（React 19 只去重 title）；改为 root 仅保留默认 title，各叶子路由自带 title+description。
- **T5 水印**：satori 0.33 经 resvg 渲染时 `textStroke` 与 `WebkitTextStroke` 均不生效，章节号描边水印改为强调红低透明度实心（视觉等效，代码内已注明）；页脚两段署名需包 div 才能被 flex 分离。
- **T5 shiki v4**：输出以 `rgb()` 而非 hex 呈现主题色、`rgba(0,0,0,0.004)` 替代 `transparent` 背景，均无视觉影响；`.line` span 无内联样式，断言应落在 `pre` 上。
