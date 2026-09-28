# 博客优化实施记录 · 2026-09-05

依据 `docs/deep-audit-2026-09-05.md`，本轮完成发布边界、资源加载、长文阅读和剩余动态效果优化。未安装新依赖，未部署，未修改正式域名或托管配置。

## 完成项

- **草稿隔离**：构建扫描器在生成模块入口前排除草稿；客户端 metadata 和正文 import 均只包含公开文章。草稿地址只显示通用不存在页面，不输出草稿标题或摘要。
- **正文按需加载**：客户端路由只加载所选正文；首次文章访问在水合前准备正文模块，后续由 clientLoader 加载。服务端构建使用公开正文的静态 imports，保持预渲染文本完整、无 JavaScript 可读、Pagefind 可索引。
- **发布检查**：`npm run build` 自动运行 `scripts/check-publication.ts`，检查公开产物没有草稿标识，正文没有遗留异步占位，文章有锚点和 canonical。此次索引 9 篇文章、1733 个词。
- **图片优化**：三张配图提供 480 / 800 / 1254px WebP，正文使用 srcSet / sizes 自动选择；原 PNG 的查看入口保留，图内容没有重新生成。使用本机既有 cwebp，质量 82；无需在正常构建时安装或运行编码器。
- **阅读导航**：所有 Markdown 标题由构建插件生成稳定、去重的 ID；文章增加折叠目录，原生锚点会更新地址，可直接分享；按标签交集排序展示最多三篇相关阅读，排除当前文章和草稿。
- **SEO / 错误页面**：首页、列表、关于与 Lab 增加 canonical 和 og:url；未知地址不再强制跳首页，展示 404 页面及 noindex。独立静态预览返回 HTTP 404，并修复畸形 URL 和稳定文件缓存策略；线上状态仍取决于最终托管配置。
- **动态效果**：作者名稳定显示；MorphIn、StaggerList、PageFlutter 的减少动态效果终态由 CSS 和组件逻辑共同保证，Typewriter 首帧保持水合一致。Lab 的减少动态效果真实浏览器检查没有水合错误。

## 体积变化

| 项目 | 优化前 | 优化后 |
| --- | ---: | ---: |
| 共享内容 JS 原始体积 | 319,794 B | 5,751 B |
| 共享内容 JS gzip | 49,910 B | 2,038 B |
| Attention 配图（800px） | PNG 2,698,684 B | WebP 67,914 B |
| DSpark 配图（800px） | PNG 2,826,350 B | WebP 82,782 B |
| MoE 配图（800px） | PNG 2,737,936 B | WebP 82,238 B |

正文 JS 转移到了各自的独立模块，上表不把被拆出的正文误算成删除的内容。真实浏览器确认首页没有请求任何文章正文模块；390px、DPR 1 时 Attention 选择 480px WebP。体积是静态产物测量，不等同于公网加载时间或 Lighthouse 得分。

图片可复现编码示例：

```sh
cwebp -quiet -q 82 -resize 800 0 public/images/articles/attention-weighted-reading.png -o public/images/articles/attention-weighted-reading-800.webp
```

## 验证

- 35 个测试文件 / 127 项测试通过；新增锚点去重、打字机减少动态效果水合回归，更新公开内容与 metadata 断言。
- 类型检查、生产构建、lint 通过（保留原有 5 条信息级建议）。
- 57 项完整浏览器检查通过，包含首页不请求正文、目录 URL 锚点、无脚本正文和 Lab 静态终态。
- 另行验证客户端文章导航、直接访问、三类错误路径 HTTP 404 / noindex、响应式图片选择。
- 开发预览在 390 / 1440px 正常呈现文章目录；截图位于 `output/playwright/optimized-reading-*.png`。

## 部署前仍需确定

`site.url` 仍为原先注明的占位地址；正式域名确定后再更新。线上托管需配置不存在路径的 HTTP 404，本轮验证的是本地静态预览。未部署或发布 GitHub 主页 README。
