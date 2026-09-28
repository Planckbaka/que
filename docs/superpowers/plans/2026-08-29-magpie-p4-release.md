# Magpie P4 发布打磨 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 spec §9 P4 的可自主实施部分——sitemap/robots 构建期生成、`/api/*` 缝隙封装层（D4 mock/禁用态）、giscus 评论区（未配置时的优雅禁用态 + 世界主题同步）、pagefind 构建期索引与档案墙搜索 UI、Lighthouse 基线达标。**部署与 giscus 真实凭证需要用户账号，留待上线任务**（见附录 B 待办）。

**Architecture:** 全部生成物走既有 `scripts/magpie-pipeline.ts` closeBundle（单一写入点）；动态功能一律经 `src/lib/api.ts` 与 `site.ts` 配置门控——未配置 = 禁用态而非报错。pagefind 索引在 closeBundle 之后由 npm postbuild 跑（索引需最终 HTML）；UI 组件对索引缺失做降级。

**Tech Stack:** pagefind(devDep) · giscus(运行时 script，无 npm 包) · 既有栈零新增其他依赖。

## Global Constraints

- 三色法则/运动预算/禁淡出不变；搜索与评论区也必须 print 风格（typewriter input、evidence 结果卡）。
- D4：`/api/*` 函数签名即未来 Go 服务契约，现在返回 mock 或优雅禁用态。
- spec §7.3：giscus iframe 皮肤监听世界切换 postMessage 同步。
- 测试禁 skip/.only；新增依赖仅 pagefind。

---

## Task 总览

| # | 任务 | 性质 |
|---|------|------|
| T1 | sitemap.xml + robots.txt（closeBundle 生成） | 构建管线 |
| T2 | `src/lib/api.ts` 缝隙封装层 | D4 契约 |
| T3 | GiscusComments 组件（配置门控 + 世界主题 postMessage 同步） | 组件 |
| T4 | pagefind 索引 + ArchiveSearch UI（档案墙降级态） | 搜索 |
| T5 | Lighthouse 基线审计 + 达标修复 | 审计 |
| T6 | 验收门 + PR + 部署待办移交 | 门禁 |

---

### Task 1: sitemap.xml + robots.txt

**Files:**
- Modify: `scripts/magpie-pipeline.ts`（closeBundle 追加两个文件）
- Test: `src/__tests__/sitemap.test.ts`

**Interfaces:**
- `buildSitemapXml(paths: string[], site): string`（纯函数，`src/lib/sitemap.ts`）——URL 集 = prerender 同源清单（/、/files、/lab、/about、published slugs），含 `<lastmod>`（文章 date）。
- `buildRobotsTxt(site): string` —— Allow all + `Sitemap: {site.url}/sitemap.xml`。

- [x] **Step 1** 失败测试：URL 全量含首页与文章、XML 转义、lastmod 取文章 date、robots 含 sitemap 行。
- [x] **Step 2** 实现 + closeBundle 写 `build/client/sitemap.xml`、`robots.txt`；门禁四连；提交 `feat(release): sitemap and robots at build time (P4/T1)`。

### Task 2: /api/* 缝隙封装层

**Files:**
- Create: `src/lib/api.ts`
- Test: `src/__tests__/api.test.ts`

**Interfaces:**
- 未来 Go 服务契约的 TypeScript 镜像（D4）：`getViews(slug): Promise<{ slug, count }>`、`like(slug): Promise<{ ok }>`、`subscribe(email): Promise<{ ok }>`——现返回本地 mock/禁用态（views=确定性伪计数、like/subscribe 返回 `{ ok: false, reason: "api-not-in-service" }`），集中在一个模块，未来切真实现零调用点改动。

- [x] **Step 1** 失败测试：契约形状、禁用态 reason、views 对同一 slug 确定性。
- [x] **Step 2** 实现；门禁四连；提交 `feat(release): api seam with mock bindings (P4/T2)`。

### Task 3: giscus 评论区

**Files:**
- Create: `src/components/comments/GiscusComments.tsx`
- Modify: `src/lib/site.ts`（`comments?: { repo, repoId, category, categoryId }`——P4 默认不配置）
- Modify: `src/pages/FilePage.tsx`（正文尾部挂载）
- Test: `src/__tests__/giscus-comments.test.tsx`

**Interfaces:**
- 未配置（默认）：渲染 "Comments arrive in a later printing" 禁用态，不注入 script。
- 已配置：注入 giscus script（crossorigin async，`data-*` 配置），容器监听世界态——`useWorld()` 变化时 postMessage 更新 giscus 主题（light → light_high_contrast? 用 `noborder_light`/`noborder_dark` 映射 red/black）。

- [x] **Step 1** 失败测试：未配置 → 禁用文案且无 iframe/script；配置后 → 容器带 data-giscus-repo；世界切换后 postMessage 被以正确 payload 调用（stub iframe contentWindow）。
- [x] **Step 2** 实现；门禁四连；提交 `feat(release): giscus comments behind config gate (P4/T3)`。

### Task 4: pagefind 索引 + 搜索 UI

**Files:**
- Modify: `package.json`（devDep pagefind；`"postbuild": "npm run build:pagefind"`? 谨慎——build 脚本内追加，保持 `npm run build` 一条龙）
- Create: `src/components/search/ArchiveSearch.tsx`
- Modify: `src/pages/FilesPage.tsx`（挂搜索）
- Test: `src/__tests__/archive-search.test.tsx`

**Interfaces:**
- 构建期：`pagefind --site build/client`（产 `build/client/pagefind/`）。
- UI：Courier typewriter 输入 + 结果列表（evidence 卡样式）；pagefind chunk 加载失败/不可用 → 降级提示（"Index unavailable in this printing"），dev 与 vitest 天然走降级。

- [x] **Step 1** 失败测试：渲染输入框；无 pagefind 时降级文案出现。
- [x] **Step 2** 实现 + 接线 + build 产索引冒烟；门禁四连；提交 `feat(release): pagefind index and archive search (P4/T4)`。

### Task 5: Lighthouse 基线

- [x] **Step 1** `npx lighthouse` 对 preview 产物跑移动端审计（Performance ≥90 · Accessibility ≥95 · Best Practices ≥95 · SEO = 100，spec §8）。
- [x] **Step 2** 不达标项修复（预期候选：meta description 齐全 ✓、tap targets、contrast）；复跑至达标；结果记入附录 B；提交 `chore(release): lighthouse baseline pass (P4/T5)`（如有修复）。

### Task 6: 验收门 + PR

- [x] **Step 1 验收门（P4 DoD）**
```bash
npm run build
test -f build/client/sitemap.xml && test -f build/client/robots.txt && test -d build/client/pagefind && echo RELEASE-OK
npm run typecheck && npm test && npm run lint
```
- [x] **Step 2** reduced-motion 全站审计不回归（全量测试 + 视觉抽查）。
- [x] **Step 3** 分支 `magpie-p4-release` 推送开 PR；合并后勾选状态入库。**上线待办移交用户**：生产域名（site.url 定稿）、Cloudflare Pages/Vercel 账号接线、giscus repo 凭证。

---

## 附录 A：冻结接口契约（供二期 Go API spec 引用）

| 契约 | 值 |
|------|-----|
| `getViews(slug)` | `Promise<{ slug: string; count: number }>`，mock 确定性 |
| `like(slug)` / `subscribe(email)` | `Promise<{ ok: false; reason: "api-not-in-service" }>` |
| `site.comments?` | `{ repo, repoId, category, categoryId }`；缺省 = 禁用态 |
| giscus 主题映射 | red world → `noborder_light`，black world → `noborder_dark` |
| 搜索降级 | pagefind 缺失 → "Index unavailable in this printing" |
| 生成物 | `build/client/{sitemap.xml, robots.txt, pagefind/}` |

## 附录 B：上线待办（需用户账号，超出本计划执行边界）

1. 生产域名定稿 → `src/lib/site.ts` 的 `site.url`（canonical/OG/RSS/sitemap 全部引用它）。
2. 静态托管接线（Cloudflare Pages / Vercel）：构建命令 `npm run build`，产物目录 `build/client`。
3. giscus 凭证（repo/repoId/category/categoryId）→ 填入 `site.comments`。
4. 真实 Go API 服务（二期独立 spec）。

---

## 附录 C：实施记录与达标证据（P4 落地回填）

- **构建链**：`npm run build` = `tsc -b && react-router build && pagefind --site build/client`，一条龙产出 prerender HTML + OG/RSS/sitemap/robots + 搜索索引。
- **pagefind**：`data-pagefind-body` 标在 FilePage 案卷卡片上 → 索引精确覆盖 3 篇文章（`Indexed 3 pages`）；UI 侧 `import(/* @vite-ignore */ chunk)` 从部署根懒加载，dev/vitest 无索引时走 "Index unavailable in this printing" 降级。
- **Lighthouse 达标轨迹（mobile，gzip 静态服务）**：初测 / 页 p85（favicon 404 + 全量字体子集 + 13 个 modulepreload 抢占关键窗口）。修复：内联 SVG favicon、字体裁到 latin 子集并删掉从未使用的 Crimson 600/700、Anton 预加载、管线 closeBundle 剥离 prerendered HTML 中的 `modulepreload`（Veil 本来就掩盖导航延迟，预加载只是重复发现机制，实测 FCP 3.3s→2.1s）。终测五页：/ p90 a96 · 文章页 p90 a96 · /files p92 a100 · /lab p91 a96 · /about p94 a100，全站 b100 s100 —— 满足 spec §8（Perf≥90 · A11y≥95 · BP≥95 · SEO=100）。
- **对比度**：红世界 `--muted-fg` 72% 纸色混红底只有 3.9:1 → 提为全不透明（4.9:1）；黑世界 65%→85%。根因之一是 FilesPage 世界轨 section 未刷 `bg-background`，浅色文字落在透出的红底上。
- **giscus**：配置门控走 `site.comments`（默认缺省 = "later printing" 禁用态）；世界切换经 postMessage 重涂主题（red→noborder_light，black→noborder_dark），测试用 stub iframe 验证 payload。
- **上线待办移交**（见附录 B）：生产域名、托管账号、giscus 凭证 —— 需要用户操作。

## 附录 D：2026-09-05 缺陷修复与发布门禁补强

- [x] 搜索异常处理：索引查询或结果片段请求失败时进入既有降级态；忽略过期请求的失败，查询变化时清除旧结果。
- [x] 搜索摘要：先识别真实高亮标签再解码实体，避免文章中的字面量 `<mark>` 被吞掉。
- [x] 转场链接：尊重调用方 `preventDefault()`、目标窗口与原生导航选项；Provider 卸载时清理延迟导航计时器。
- [x] 验收测试：hydration 测试改为真实执行 hydrateRoot 并断言无恢复错误、页面 DOM 被复用，不再依赖本机旧构建文件或仅打印差异。
- [x] 浏览器搜索门禁：生产环境必须输入关键词并检索到文章，不能再以“输入框存在或降级提示存在”代替索引验收。
- [x] lint 范围：排除未纳入版本控制的 `.claude/settings.local.json`，避免本机工具配置阻塞项目检查。
- [x] 验证：`npm test` 32 个文件 / 126 项通过；`npm run typecheck`、`npm run lint`、`npm run build` 通过，Pagefind 索引覆盖 3 篇文章；`npm run test:browser` 13 项通过，控制台无错误；开发模式首页、档案墙、实验室冒烟通过，缺少索引时正常降级，无浏览器错误。

本次未重新测量 Lighthouse 分数，附录 C 分数仍为历史基线。附录 B 的域名、托管、评论区配置及二期 Go API 仍待确定；本次未部署。

## 附录 E：2026-09-05 个人博客视觉与文案校正

用户补充：本轮重点为视觉和文案；产品是个人博客，借用《喜鹊谋杀案》的整体视觉风格。

- [x] 首页结构改为博客封面、最新文章、工程/算法两条写作方向、作者介绍。首页移除虚构剧情、嫌疑人、证物卡及无功能搜索框；动效演示继续保留在 Lab。
- [x] 导航改为 Articles / Lab / About，支持当前栏目标记；页脚改为作者署名、文章入口与 RSS，移除字体书脊演示。
- [x] 保留红黑双世界、纸张质感、半调剪影、描边大字、硬阴影、字母重排及报纸滚动带；阅读段落采用纸色与墨色，首页文章在封面后直接可见。
- [x] 关于页先介绍作者与写作方向，视觉来源放入独立版本说明；移除技术管线说明及过时的功能 pending 文案。
- [x] 归档说明、文章摘要、搜索空态与评论禁用态改为读者可以直接理解的内容。文章标题与正文保留原有技术探案写法，英文为主的语言决策不变。
- [x] 修复手机正文装饰编号覆盖标题、进度文字与正文叠在一起，以及 Lab 卡片背景和文字颜色不匹配的问题；消除首页和正文页嵌套 main。
- [x] 验收：32 个测试文件 / 121 项通过；生产构建、lint 通过；浏览器 13 项通过，无控制台错误。五个页面在 390px 和 1440px 下均无横向溢出，每页一个 main 和 h1；验证黑色首页与分类锚点跳转。截图位于 `output/playwright/`。

此记录覆盖早期计划中将首页视作完整 showcase 的展示要求；后续以个人博客的阅读路径和内容清晰度为优先。本轮没有重新运行 Lighthouse。

## 附录 F：Python / Go 后端定位、前沿文章与响应式验收

- 首页、作者页、页脚和 SEO 描述统一为 Python / Go 后端工程师博客；红轨为 Engineering Notes，黑轨为 Frontier Notes，覆盖 AI 基础设施、运行时和算法。
- 新增三篇完整文章：`go-container-cpu-budgets`、`python-free-threading-backend`、`bounded-ai-backend-pipelines`。每篇附适用版本、官方来源、独立代码示例、工程边界；无编造生产测量数据。现在共有 6 篇公开文章。
- 示例校验：Go 诊断程序和全部 Python 代码成功运行；asyncio 示例另验并发上限、顺序、空输入、参数校验、超时及任务清理。本机 Python 为普通 GIL 构建，不将运行结果当作自由线程性能验证；Go 运行于 macOS，不将输出当作 Linux cgroup 测试。
- 响应式门禁纳入 `npm run test:browser`：320 / 390 / 768 / 1024 / 1440px × 首页、归档及三篇新文章，检查标题/导航/正文/代码块边界和代码局部横向滚动，共 25 项。
- 移动代码阅读：长标识符可换行；代码保持格式并局部滚动；提供滚动提示、可聚焦代码区域，手机隐藏行号。修正 Shiki 行内换行与块级行叠加引起的重复行距。
- 验证：121 项单测通过；38 项浏览器检查（含新增 25 项）通过。布局截图位于 `output/playwright/backend-*`。源码摘要、首页最新列表、RSS、站点地图和 Pagefind 随统一内容管线生成。

## 附录 G：LLM 专题与开发内容刷新修复

- 新增 Attention、MoE、DSpark 三篇完整文章，公开文章总数为 9。DSpark 对应用户指定的 arXiv:2607.05147；论文摘要、作者报告结果与本站教学示例明确区分，附原始论文及实现入口。
- Attention 覆盖张量形状、因果掩码、KV Cache、GQA 与 FlashAttention；MoE 覆盖路由、稀疏计算、驻留权重和通信成本；DSpark 用独立预算示例解释条件存活概率与验证成本。
- 修正原 Attention 文章的 softmax 数值、加权输出、返回类型及关于梯度和幻觉的不准确断言。新 NumPy 示例和标准库调度示例已实际运行；未声称复现论文训练或性能结果。
- 修复新增 MDX 后开发服务器阅读时长索引滞留导致的运行时错误：监听内容新增、修改和删除，防抖重启开发服务器，使 SSR 与客户端索引同步。已用临时文章实测新增与修改刷新，临时文件已清理；三篇正式文章在开发环境无页面异常。
- 浏览器验收扩展至 53 项，其中 40 项覆盖 8 个页面 × 320 / 390 / 768 / 1024 / 1440px，验证标题、导航、正文、代码边界及局部滚动。桌面与手机文章截图已更新至 `output/playwright/`。
- 单测 32 个文件 / 121 项通过，类型检查、生产构建与 lint 通过；Pagefind 索引 9 篇文章。本轮未重新测量 Lighthouse，未部署或发布 GitHub 个人主页。

## 附录 H：GPT Image 文章机制配图

- Attention、MoE、DSpark 各新增一张原创机制示意图，使用内置 GPT Image 生成；原始 PNG 存于 `public/images/articles/`，完整提示词保存在 `docs/article-image-prompts.md`。
- 配图统一纸色、墨黑和暗红印刷风格。每张图添加等价替代文本、机制说明和概念边界；提供原图链接、延迟加载和固定宽高比例，移动端随正文缩放。
- 已逐图核对文字与箭头。三篇文章 × 320 / 768 / 1440px 共 9 项实际浏览器检查通过，图片正确加载且无页面横向溢出；生产构建和 lint 通过（保留原有 5 条信息级建议）。未部署。

## 附录 I：个人身份与博客入口完善

- 站点展示身份改为 Orion Arch · Engineering Notes；首页以作者姓名为主标题，导航、页脚、SEO 和 GitHub 主页 README 同步更新。
- 首页增加个人介绍、GitHub 入口及 Go / Python / LLM 三条推荐阅读路径，链接到已有文章。关于页以当前学习方向为主体，视觉出处缩减为简短说明。
- 保留喜鹊剪影、红黑纸张及印刷动效；未添加未经确认的职业经历、个人联系方式或项目成果，未修改部署域名。
- 121 项单测通过，生产构建与 lint 通过；首页、关于页、文章列表在 320 / 390 / 768 / 1440px 共 12 项浏览器检查通过，无横向溢出或页面异常。

## 附录 J：深度审查与局部修复

- 完整发现、证据及优先顺序见 `docs/deep-audit-2026-09-05.md`；移动网络样本保存于 `output/audit/`。
- 修复减少动态效果模式水合、遮挡文字键盘阅读、手机进度框遮挡、Lab 横轨滚动、分享卡虚构身份及旧梯度文章 float32 数值断言。
- 125 项单测、53 项浏览器回归及 8 项额外定向检查通过，构建与 lint 通过。尚未部署，发布完整性与内容按需加载留待下一轮管线调整。

## 附录 K：审查后优化落地

- 已完成公开内容清单、草稿构建隔离、正文按需加载、自动发布产物检查、响应式 WebP、文章目录/锚点/相关阅读、固定页面 canonical、404 页面及预览状态码、减少动态效果收尾。
- 详细架构、体积对比、复现命令与部署边界见 `docs/optimization-2026-09-05.md`。
- 127 项单测、57 项浏览器检查通过，类型检查/构建/lint 通过；Pagefind 保持 9 篇正文可检索。正式域名和线上托管404仍待部署时确定。
