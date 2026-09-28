import { describe, expect, it } from "vitest";
import remarkHeadings from "../../scripts/remark-headings";

describe("article anchors", () => {
  it("creates stable unique anchors and ignores code blocks", () => {
    const tree: Parameters<ReturnType<typeof remarkHeadings>>[0] = {
      type: "root",
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "KV Cache: 内存" }] },
        { type: "code", value: "## This is code" },
        { type: "heading", depth: 2, children: [{ type: "text", value: "KV Cache: 内存" }] },
      ],
    };
    remarkHeadings()(tree);
    expect(tree.children?.[0].data?.hProperties?.id).toBe("kv-cache-内存");
    expect(tree.children?.[1].data).toBeUndefined();
    expect(tree.children?.[2].data?.hProperties?.id).toBe("kv-cache-内存-2");
  });
});
