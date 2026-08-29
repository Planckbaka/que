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

- [ ] **Step 1** 失败测试：URL 全量含首页与文章、XML 转义、lastmod 取文章 date、robots 含 sitemap 行。
- [ ] **Step 2** 实现 + closeBundle 写 `build/client/sitemap.xml`、`robots.txt`；门禁四连；提交 `feat(release): sitemap and robots at build time (P4/T1)`。

### Task 2: /api/* 缝隙封装层

**Files:**
- Create: `src/lib/api.ts`
- Test: `src/__tests__/api.test.ts`

**Interfaces:**
- 未来 Go 服务契约的 TypeScript 镜像（D4）：`getViews(slug): Promise<{ slug, count }>`、`like(slug): Promise<{ ok }>`、`subscribe(email): Promise<{ ok }>`——现返回本地 mock/禁用态（views=确定性伪计数、like/subscribe 返回 `{ ok: false, reason: "api-not-in-service" }`），集中在一个模块，未来切真实现零调用点改动。

- [ ] **Step 1** 失败测试：契约形状、禁用态 reason、views 对同一 slug 确定性。
- [ ] **Step 2** 实现；门禁四连；提交 `feat(release): api seam with mock bindings (P4/T2)`。

### Task 3: giscus 评论区

**Files:**
- Create: `src/components/comments/GiscusComments.tsx`
- Modify: `src/lib/site.ts`（`comments?: { repo, repoId, category, categoryId }`——P4 默认不配置）
- Modify: `src/pages/FilePage.tsx`（正文尾部挂载）
- Test: `src/__tests__/giscus-comments.test.tsx`

**Interfaces:**
- 未配置（默认）：渲染 "Comments arrive in a later printing" 禁用态，不注入 script。
- 已配置：注入 giscus script（crossorigin async，`data-*` 配置），容器监听世界态——`useWorld()` 变化时 postMessage 更新 giscus 主题（light → light_high_contrast? 用 `noborder_light`/`noborder_dark` 映射 red/black）。

- [ ] **Step 1** 失败测试：未配置 → 禁用文案且无 iframe/script；配置后 → 容器带 data-giscus-repo；世界切换后 postMessage 被以正确 payload 调用（stub iframe contentWindow）。
- [ ] **Step 2** 实现；门禁四连；提交 `feat(release): giscus comments behind config gate (P4/T3)`。

### Task 4: pagefind 索引 + 搜索 UI

**Files:**
- Modify: `package.json`（devDep pagefind；`"postbuild": "npm run build:pagefind"`? 谨慎——build 脚本内追加，保持 `npm run build` 一条龙）
- Create: `src/components/search/ArchiveSearch.tsx`
- Modify: `src/pages/FilesPage.tsx`（挂搜索）
- Test: `src/__tests__/archive-search.test.tsx`

**Interfaces:**
- 构建期：`pagefind --site build/client`（产 `build/client/pagefind/`）。
- UI：Courier typewriter 输入 + 结果列表（evidence 卡样式）；pagefind chunk 加载失败/不可用 → 降级提示（"Index unavailable in this printing"），dev 与 vitest 天然走降级。

- [ ] **Step 1** 失败测试：渲染输入框；无 pagefind 时降级文案出现。
- [ ] **Step 2** 实现 + 接线 + build 产索引冒烟；门禁四连；提交 `feat(release): pagefind index and archive search (P4/T4)`。

### Task 5: Lighthouse 基线

- [ ] **Step 1** `npx lighthouse` 对 preview 产物跑移动端审计（Performance ≥90 · Accessibility ≥95 · Best Practices ≥95 · SEO = 100，spec §8）。
- [ ] **Step 2** 不达标项修复（预期候选：meta description 齐全 ✓、tap targets、contrast）；复跑至达标；结果记入附录 B；提交 `chore(release): lighthouse baseline pass (P4/T5)`（如有修复）。

### Task 6: 验收门 + PR

- [ ] **Step 1 验收门（P4 DoD）**
```bash
npm run build
test -f build/client/sitemap.xml && test -f build/client/robots.txt && test -d build/client/pagefind && echo RELEASE-OK
npm run typecheck && npm test && npm run lint
```
- [ ] **Step 2** reduced-motion 全站审计不回归（全量测试 + 视觉抽查）。
- [ ] **Step 3** 分支 `magpie-p4-release` 推送开 PR；合并后勾选状态入库。**上线待办移交用户**：生产域名（site.url 定稿）、Cloudflare Pages/Vercel 账号接线、giscus repo 凭证。

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
