# Magpie P3 页面层 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 spec §3 的页面层——`_seo` 布局（RunningHead + Footer）、档案墙 `/files`（按世界分组 + 世界加权排序）、正文模板升级（Reading Folio + Scrub Chapter Numerals）、Evidence Lab `/lab`、Colophon `/about`，并给封面接入最新档案入口；prerender 固定清单激活 `/files` `/lab` `/about`。

**Architecture:** 全部页面挂在 `layout()` 路由下共享页框；ShowcasePage 的局部 RunningHead/Footer 提取为 magpie 共享件并升级为站内导航（LinkUnderVeil 擦除转场）。两个新动效原语（ReadingFolio、ChapterNumeral）进 `src/components/motion/`，映射逻辑为 `src/lib/motion.ts` 纯函数。档案数据一律走 P2 冻结契约（`articles` / `publishedArticles` / `groupByWorld`）。

**Tech Stack:** 既有栈零新增依赖（motion/react · RRv7 framework routes · Tailwind v4 · Vitest）。

## Global Constraints

- 三色法则 / 运动预算不变；每屏纪念碑元素 ≤2（正文页 = ChapterNumeral ×1 + folio chrome）。
- ReadingFolio 是功能性 chrome：reduced-motion 下仍然工作（scrub 由滚动驱动，非自主动画）；ChapterNumeral 视差在 reduced-motion 下退化为静态描边数字。
- 页面 meta 沿用 P2 口径：每路由自带 title + description，root 只留默认 title。
- 内容语言英文；「喜鹊档案」仅装饰。
- TS strict 全家桶、Biome 2 空格 ≤100 列、测试禁 skip/.only。

---

## Task 总览

| # | 任务 | 性质 |
|---|------|------|
| T1 | 共享页框：RunningHead/Footer 提取 + SeoLayout + 路由重构 + prerender 固定四路由 | 结构 |
| T2 | ReadingFolio + ChapterNumeral 原语（folioPage/romanNumeral 纯函数） | 动效 TDD |
| T3 | FilePage 正文模板升级（folio + 章节数字 + 版式） | 页面 |
| T4 | FilesPage 档案墙（groupByWorld + 世界加权排序 + evidence 卡） | 页面 TDD |
| T5 | LabPage 动效陈列室 | 页面 |
| T6 | AboutPage Colophon | 页面 |
| T7 | 封面最新档案入口 + 局部页框退役 | 页面 |
| T8 | 验收门 + PR | 门禁 |

---

### Task 1: 共享页框 + 路由重构

**Files:**
- Create: `src/components/magpie/RunningHead.tsx` / `src/components/magpie/SiteFooter.tsx` / `src/pages/SeoLayout.tsx`
- Modify: `app/routes.ts`（`layout()` 包裹五路由）/ `react-router.config.ts`（固定清单 + `/files` `/lab` `/about`）/ `src/pages/ShowcasePage.tsx`（删局部件，T7 完成内容增量）
- Test: `src/__tests__/seo-layout.test.tsx`

**Interfaces:**
- `SeoLayout`：RunningHead + `<Outlet />` + SiteFooter；不钉 data-world（跟随全局世界态）。
- SiteFooter：站内导航（Cover `/` · Archive `/files` · Lab `/lab` · Colophon `/about`，LinkUnderVeil）+ RSS 外链 + 版权署名 Orion Arch + folio 玩笑行。
- prerender 清单 = `["/", "/files", "/lab", "/about", ...published slugs]`。

- [x] **Step 1** 失败测试：render SeoLayout（MemoryRouter + index route stub）→ RunningHead 文案与 Footer 导航链接（/files /lab /about）存在。
- [x] **Step 2** 实现三组件 + routes.ts 重构 + prerender 固定路由；ShowcasePage 切换到布局共享件（局部 RunningHead/Footer 删除，Footer 文案并入 SiteFooter）。
- [x] **Step 3** 门禁四连 + build 冒烟（8 页 prerender）；提交 `feat(pages): shared seo layout, running head, site footer (P3/T1)`。

### Task 2: ReadingFolio + ChapterNumeral

**Files:**
- Modify: `src/lib/motion.ts`（`folioPage(progress, total)` / `romanNumeral(n)`）
- Create: `src/components/motion/ReadingFolio.tsx` / `src/components/motion/ChapterNumeral.tsx`
- Test: `src/__tests__/reading-folio.test.tsx`

**Interfaces:**
- `folioPage(progress, total)`：钳制 [0,1] → 页码 [1,total]，total<1 → 1。
- `romanNumeral(n)`：标准罗马数字（1→I … 2026→MMXXVI），n<1 → "I"。
- `ReadingFolio({ total })`：`useScroll()` 全局进度 → "Folio 03 ∕ 12"（Courier 大写，padStart 2）+ 2px 墨色发丝线 scaleX 同步；fixed 左下外缘；aria-label 读出进度。
- `ChapterNumeral({ numeral, className })`：巨型描边数字（text-outline + font-display），`useScroll` y ∈ [60,-60] 轻视差；`prefersReducedMotion()` 命中 → 静态。

- [x] **Step 1** 失败测试：folioPage 七态（0/0.5/1/负值/超1/total=0/取整边界）；romanNumeral（1/4/9/14/40/90/400/2026）；渲染断言（folio 文本格式、aria-label；ChapterNumeral 带 text-outline 类且 aria-hidden）。
- [x] **Step 2** 实现；门禁四连；提交 `feat(motion): reading folio and chapter numeral primitives (P3/T2)`。

### Task 3: FilePage 正文模板

**Files:**
- Modify: `src/pages/FilePage.tsx`
- Test: `src/__tests__/filepage.test.tsx`（扩展）

**Interfaces:**
- 正文页组合：kicker → Anton 标题 → Filed 行（date · N min read）→ 正文 → `ReadingFolio total={readingTimeMinutes}`；`ChapterNumeral numeral={romanNumeral(文章序号)}` 绝对定位右上；行高版式沿用 P2 case-file CSS。

- [x] **Step 1** 扩展测试：folio 文本出现且 total 正确（3 min read → "∕ 03"）；numeral 罗马字匹配该文序号。
- [x] **Step 2** 实现；门禁四连；提交 `feat(pages): case-file reading template with folio chrome (P3/T3)`。

### Task 4: FilesPage 档案墙

**Files:**
- Create: `src/pages/FilesPage.tsx`
- Modify: `src/lib/content.ts`（`groupByWorld`）
- Test: `src/__tests__/files-page.test.tsx`

**Interfaces:**
- `groupByWorld(articles): { red: Article[]; black: Article[] }`（各自保持 date 降序）。
- 页面：kicker "The Archive · 档案墙" + Anton 标题；两个世界轨 section（`data-world` 钉各自世界），`useWorld()` 当前世界轨排前（世界加权排序）；文章卡 = evidence 卡（kicker/Anton 标题/summary/date·时长/ClueChip tags），LinkUnderVeil 包卡；draft 不出现。

- [x] **Step 1** 失败测试：groupByWorld 归组与排序；渲染 → 3 张已发布卡、draft 缺席、卡链接 href 正确、world=red 时 RED WORLD 轨标题在前。
- [x] **Step 2** 实现；门禁四连；提交 `feat(pages): the archive wall grouped by world (P3/T4)`。

### Task 5: LabPage 动效陈列室

**Files:**
- Create: `src/pages/LabPage.tsx`
- Test: `src/__tests__/lab-page.test.tsx`

**Interfaces:**
- 单页陈列全部八原语（每件 = Courier 标注 + 活体演示）：AnagramText / TypewriterText / MorphIn+StaggerList / PressTape / HalftoneImage+HalftoneReveal / HorizontalRail（迷你）/ CenterSeam（迷你）/ Veil（travel 按钮）+ 世界切换开关 + ReadingFolio（本页 live 于左下）。纪念碑配额自守。

- [x] **Step 1** 结构测试：页标题、"EVIDENCE LAB" 文案、关键演示位锚点（aria-label/文案）存在。
- [x] **Step 2** 实现；门禁四连；提交 `feat(pages): evidence lab motion showroom (P3/T5)`。

### Task 6: AboutPage Colophon

**Files:**
- Create: `src/pages/AboutPage.tsx`
- Test: `src/__tests__/about-page.test.tsx`

**Interfaces:**
- Colophon 页：COLOPHON kicker + Anton 标题 + Orion Arch 双身份简介 + 版本记录表（字体/三色/引擎/构建/未来印刷项 giscus+pagefind）+ 署名行 + RSS 链接 + 喜鹊彩蛋。数据（author/title/description）一律读 `site.ts`。

- [x] **Step 1** 测试：标题与署名 "Orion Arch"、版本表键值、RSS 链接。
- [x] **Step 2** 实现；门禁四连；提交 `feat(pages): colophon about page (P3/T6)`。

### Task 7: 封面最新档案入口

**Files:**
- Modify: `src/pages/ShowcasePage.tsx`
- Test: `src/__tests__/showcase.test.tsx`（扩展）

**Interfaces:**
- CounterSection 之后新增 "From the Archive" section：`publishedArticles` 前 3 篇迷你卡（LinkUnderVeil → /files/:slug）+ "Open the archive" 入口链接 /files。

- [x] **Step 1** 扩展 showcase 测试：3 篇标题与 archive 链接出现。
- [x] **Step 2** 实现；门禁四连；提交 `feat(pages): cover gets latest-files entry (P3/T7)`。

### Task 8: 验收门 + PR

- [x] **Step 1 验收门（P3 DoD）**
```bash
npm run build
test -f build/client/files/index.html && test -f build/client/lab/index.html && test -f build/client/about/index.html && echo ROUTES-OK
npm run typecheck && npm test && npm run lint
```
- [x] **Step 2** 视觉抽查：/files 两世界分组、正文页 folio + 数字幕、/lab 演示位、/about 署名。
- [x] **Step 3** 分支 `magpie-p3-pages` 推送开 PR；合并后勾选状态随 PR 入库。

---

## 附录 A：冻结接口契约（供 P4 计划引用）

| 契约 | 值 |
|------|-----|
| `SeoLayout` | 所有内容路由的共享页框；RunningHead/SiteFooter 为 magpie 共享件 |
| `folioPage(progress,total)` | [0,1] → [1,total]，total<1 → 1 |
| `romanNumeral(n)` | n<1 → "I"；标准规则 |
| `ReadingFolio({total})` | fixed 左下；Folio 0X ∕ 0Y + 2px scaleX 发丝线 |
| `ChapterNumeral({numeral})` | 描边数字轻视差；reduced → 静态 |
| `groupByWorld(articles)` | `{ red, black }` 各自 date 降序 |
| 路由表 | layout( index, files, files/:slug, lab, about ) + catch-all |
| prerender | `["/", "/files", "/lab", "/about", ...published]` |

---

## 附录 B：实施记录与偏差（P3 落地时回填）

- **T1 路由分批**：`/files` `/lab` `/about` 的路由注册与 prerender 固定项随各自页面任务落地（T4-T6），而非 T1 一次接入——保证每个提交独立可构建。
- **T2 a11y**：ReadingFolio 采用 `role="progressbar"` + aria-valuenow/max（Biome 禁止裸 div 挂 aria-label），语义也更准。
- **T2 SSR**：`prefersReducedMotion()` 裸访问 `window` 在 prerender 的 Node 环境崩溃（ChapterNumeral 渲染期调用所致）——已加 `typeof window` 守卫。
- **T4/T8 token 冻结**：Tailwind `@theme inline` 的主题变量在 `:root` 处完成 var() 替换后继承（CSS 自定义属性按声明元素求值），自定义 CSS 引用 `--color-card-foreground`/`--color-line` 会拿到红世界冻结值——必须引用底层 token（`--on-surface`/`--line`/`--accent`）才能随 `data-world` 翻转。卡片内 muted 文案统一走 `.on-card` 作用域。
- **T5**：Veil 演示位为 LinkUnderVeil（非按钮）；测试环境需 Router > WorldProvider > VeilProvider 的嵌套顺序。
