# 《喜鹊档案》The Magpie Files —— 个人博客宇宙设计文档

- **日期**: 2026-08-26
- **状态**: 已获批准（口头逐节确认）
- **作者署名**: Orion Arch
- **基础仓库**: `xique-react`（React 19 · Vite 7 · TS strict · Biome · Vitest · Tailwind v4 · motion/react）
- **治理规范**: `.opencode/skills/magpie-design/SKILL.md` 全部法则继续有效（三色、无渐变/模糊/圆角、转场只用擦除、入场 ≤800ms、交互 ≤240ms、每屏纪念碑元素 ≤2）

## 0. 背景与目标

现有仓库是 Magpie Murders 片头美学的设计系统演示页。目标是将其演化为 Orion Arch（Golang / Python 后端工程师 × 神经网络算法工程师）的个人博客宇宙，同时把"艺术级"交互动效（横向滑行、滚动叙事、路由擦除等）做成一级公民。既是一份个人影响力资产，也是一份作品集。

## 1. 已确认决策

| # | 决策点 | 结论 |
|---|--------|------|
| D1 | 产品形态 | **融合单站**：现有 showcase 演化为博客封面序章；两世界 = 内容双轨 |
| D2 | 渲染形态 | **RRv7 framework 模式 + 构建期预渲染**（`ssr:false` + prerender），静态托管、完整 SEO、保留 SSR 开关 |
| D3 | 内容语言 | **英文为主**；不引入 CJK 字体管线，「喜鹊档案」四个汉字作为装饰性刊名用系统字体渲染 |
| D4 | 动态功能边界 | **纯静态起步 + `/api/*` 缝隙**：giscus 评论、pagefind 搜索、RSS/OG 构建期生成；封装层返回本地 mock/禁用态 |
| D5 | 署名 | Colophon 页与 OG 卡片署名 **Orion Arch**（经 `site.author` 配置项承载） |

## 2. 创意主线 —— "两个世界"从主题升格为信息架构

| 世界 | 身份映射 | 内容轨 | 视觉锚点 |
|------|----------|--------|----------|
| RED WORLD（现实 / 作者 Susan Ryeland） | 工程师本体 | **Engineering Notes**：Go/Python 后端、系统设计、基础设施手记 | paper 底、stamp 红强调 |
| BLACK WORLD（虚构 / 侦探 Atticus Pünd） | 算法侦探 | **Algorithm Files**：神经网络专题写成探案（如 *The Case of the Vanishing Gradient*） | ink 底、red-bright 强调 |

- 每篇文章以 frontmatter `world` 字段归属世界。
- 首页 WorldDivider 开关升级为**内容视角切换**：切换世界时首页/档案墙对两个内容轨排序加权并同步全局配色。
- About 页写为 **Colophon**（版权页/版本记录），正合印刷装帧气质。

## 3. 信息架构与路由（RRv7 framework 文件路由）

```
routes/
  _seo.tsx              layout：RunningHead + Footer + Lenis mount + Veil 转场挂载
  _seo._index.tsx       /                    封面 = showcase 序章 + 最新档案入口
  _seo.files.tsx        /files               档案墙（archive index，按世界分组）
  _seo.files.$slug.tsx  /files/:slug         章节正文
  _seo.lab.tsx          /lab                 Evidence Lab 动效陈列室（作品集活体展示）
  _seo.about.tsx        /about               Colophon（含署名 Orion Arch）
```

SEO 契约：

- 每路由导出 `meta()`：title / description / canonical / OG 标签。
- `react-router.config.ts` 中 prerender 清单由构建脚本扫描 `content/files/**` 自动生成（防遗漏），额外固定包含 `/`, `/files`, `/lab`, `/about`。
- `/rss.xml` 与 sitemap 由构建脚本产出至静态产物根目录。

## 4. 内容管线

### 4.1 文章源

MDX via `@mdx-js/rollup`，存放于 `content/files/*.mdx`。frontmatter schema（Zod 校验，构建期报错）：

```yaml
title: The Case of the Vanishing Gradient   # 必填
kicker: Algorithm Files · Case No. 017      # 必填 Courier 眉线
world: black                                 # 必填 red | black
tags: [deep-learning, optimization]         # 必填 ≥1
summary: A detective story about a loss…    # 必填 ≤160 chars，喂 meta/RSS/OG
draft: false                                 # 可选，true 则不进 prerender/档案墙
date: 2026-08-26                             # 必填 ISO 日期
```

### 4.2 代码高亮

Shiki 构建期高亮，自定义双主题 `paper`（纸上墨字）与 `ink`（墨上纸字）。两套主题仅使用三色 token 的明度阶（paper/paper-dim/ink 各透明度 + stamp 红）；正文页随 `data-world` 以 CSS 变量域自动翻转主题类名，无重绘闪烁。行号用 CSS counter 实现。

### 4.3 MDX 写作词汇表（组件映射）

| 组件 | 用途 |
|------|------|
| `<Redacted>` | 剧透遮罩段落，hover 揭示 |
| `<ClueChip>` | 术语注解 chip（证据标签样式） |
| `<HalftoneImage>` | 所有插图必须经过的半调网点处理容器 |
| `<ExhibitCard>` | 示意/架构图卡片（evidence 卡变体） |

动效组件进入正文遵循运动预算：入场动画 ≤800ms 且仅在视口首现时播放一次。

### 4.4 OG 图与 RSS

- OG 图：satori 构建期渲染 1200×630——Anton 大标题 + 章节号描边水印 + 三色构图，随文章 slug 存入 build 产物；RSS 与 og:image 引用它。
- RSS：构建脚本由同一 frontmatter 数据源生成 `/rss.xml`。
- 阅读时长：`reading-time`（英文口径；中文混排支持登记为未来项，见 §10 范围外）。

## 5. 动效系统规格（子项目 A）

**滚动引擎选型（已定）：Lenis**（~2KB，RAF 同步惯性，进度值直接供 Motion `useScroll` 消费）。否决纯 Motion 自写平滑滚动（wheel/touch 归一化深坑）与 GSAP ScrollTrigger（第二动画心智，维护成本 > 收益）。

八项原语（机制 + 降级）：

1. **HorizontalRail `<HorizontalRail>`** —— 横向滑行主体。section sticky 钉住，垂直滚动进度经 `useScroll({target})` 映射为横排证物卡 `translateX`，EASE_PRINT 缓动 scrub。
    降级：`prefers-reduced-motion` → 原生 `overflow-x` scroll-snap 轮播。
2. **Center-Seam Drag** —— 首屏红黑分界的中央缝合线可拖拽，两侧世界宽度实时让渡（指针零延迟跟随）；松手弹性 snap 归位或驻留（snap 过渡 ≤240ms）。
3. **Veil（路由擦除转场）** —— `WorldWipe` 泛化为导航遮幅组件：550ms 盖下 → 切页 → 揭开。浏览器支持时以 View Transitions API 增强，否则组件内状态机兜底。法则：路由转场永远擦除、禁止淡出。
4. **Press Tape Marquee** —— 章节(Section)间报纸快讯滚动带（Courier 大写字距 +0.28em，纯 CSS 无限循环）。hover 暂停；reduced-motion 时整条移除。
5. **Scrub Chapter Numerals** —— 巨型描边罗马数字背景随滚动轻视差（占用每屏 ≤2 的纪念碑配额，仅位移/缩放变换）。
6. **Reading Folio** —— 正文页左下外缘 folio 数字 = 阅读进度（"Folio 03 ∕ 12"），配 2px 墨色发丝进度线；印刷装帧逻辑充当阅读器 chrome。
7. **Halftone Reveal** —— 插图 hover 时 CSS 变量驱动网点间距插值（7px→3px，"对焦"效果）。纯 CSS 实现。
8. **Smooth Scroll Mount** —— Lenis 挂载于 `_seo.tsx`；页面内锚点统一改走 Lenis `scrollTo(offset)`，禁用原生 jump。

通用约束：所有原语共用 `src/lib/motion.ts` 的时长/缓动 token；不新增第四色；reduced-motion 全局 kill-switch（`index.css`）兜底且各原语自带退化形态声明。

## 6. 技术架构变化清单

| 动作 | 内容 |
|------|------|
| RRv7 framework 迁移 | 新增 `@react-router/dev`、`react-router.config.ts`（`ssr:false` + prerender）、`routes.ts`、`root.tsx`；`App.tsx`/`main.tsx` 逻辑拆入 routes 结构。现有组件**零破坏复用**：ui/magpie 层原样保留；motion 层仅新增 `Veil`（由 `WorldWipe` 泛化而来，后者行为不变） |
| 新增依赖 | `lenis`；`@mdx-js/rollup`；`shiki`(build)；`reading-time`；`pagefind`(devDep，postbuild 索引)；giscus（运行时 script，无 npm 包）；`satori`+`resvg`(build，OG)。明确拒绝：gsap、three.js、CMS |
| 目录增量 | `content/files/*.mdx`、`src/routes/**`、`scripts/`(rss/og/prerender 清单)；现有结构不动 |
| `/api/*` 缝隙 | `src/lib/api.ts` 封装层：函数签名即未来 Go 服务契约，现在返回 mock 或优雅降级禁用态 |
| 部署 | 静态产物 → Cloudflare Pages / Vercel |

## 7. 风险与对策

1. **SSG × 随机数水合错位**：`AnagramText` 改为每次挂载确定性种子洗牌（seeded shuffle），保证预渲染 HTML 与客户端一致。
2. **Lenis × 锚点**：原生锚点被劫持穿帮 → 全部收敛到 Lenis `scrollTo` 封装。
3. **giscus 主题漂移**：iframe 评论皮肤需监听世界切换 postMessage 同步，否则黑世界嵌白纸。
4. **prerender 清单遗忘新文章**：构建脚本扫 content 目录自动生成，禁止人肉维护。
5. **Vite 7 × @react-router-dev 版本兼容**：锁定 minor 版本；CI 构建 + 冒烟测试先行验证。
6. **Vitest 兼容**：framework 模式迁移不得破坏现有 jsdom 测试；`vite.config.ts` 别名与 setup 保持不动。

## 8. 测试与验收标准

- 单测：Rail 进度映射数学、Veil 状态机、frontmatter Zod schema、seeded shuffle 确定性；MDX 渲染 snapshot；prerender 冒烟（断言产物 HTML 含 h1/meta description）。
- Lighthouse（文章页基线）：Performance ≥90（mobile）· Accessibility ≥95 · Best Practices ≥95 · SEO = 100。
- reduced-motion 审计：关闭动画后全站可完整阅读与导航。
- 内容量化验收：≥3 篇真实文章（2 世界轨至少各 1 篇）跑通全管线后方可发布 P4。

## 9. 里程碑路线图

| 阶段 | 交付物 | 预估 |
|------|--------|------|
| P0 底座迁移 | framework mode 落地 + Lenis + Veil 路由转场 + seeded AnagramText | 2–3 会话 |
| P1 动效库 | HorizontalRail · Center-Seam Drag · Press Tape · Halftone Reveal | 2 会话 |
| P2 内容管线 | MDX + Shiki 双主题 + OG/RSS + frontmatter 校验 | 2–3 会话 |
| P3 页面层 | 档案墙 / 正文模板（Folio 进度）/ Lab / Colophon | 2 会话 |
| P4 发布打磨 | giscus 重肤 + pagefind UI + Lighthouse 达标 + 上线 | 1–2 会话 |
| 二期独立项目 | Go API 服务（浏览量/订阅/点赞），另立 spec，作为独立作品 | 不在本期 |

## 10. 明确的范围外（Non-goals）

- Go 后端服务实现（二期独立 spec）。
- CJK 字体子集管线 / 中文排版支持（决策 D3 英文为主；装饰性刊名除外）。
- CMS、数据库、服务端评论自建、Newsletter 发送服务。
- WebGL/three.js 视觉、任何渐变或模糊效果（违背 SKILL.md 法则）。
- 双语 locale 路由（未来若需要，内容模型已可用 frontmatter 扩展字段承接）。

## 11. 架构自评

**结论：完美设计（perfectly engineered），偏保守侧。**每个新增件都对应已确认需求（D2→prerender、"横向滑行"→HorizontalRail、身份双轨→two-world IA），拒绝了投机性抽象（GSAP/WebGL/CMS）；`/api/*` 缝隙与 draft/locale 预留以一行接口成本买断返工风险。已知张力点：§5 的 8 个原语一次性铺开略激进，已获用户确认全保留；实施中若某原语与性能预算冲突，按规格表内降级策略执行而非砍功能。
