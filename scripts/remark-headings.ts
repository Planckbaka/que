// Assign stable, unique heading anchors at build time; no browser-only IDs.
type Node = {
  type: string;
  value?: string;
  depth?: number;
  children?: Node[];
  data?: { hProperties?: Record<string, unknown> };
};
function textOf(node: Node): string {
  return node.value ?? node.children?.map(textOf).join("") ?? "";
}
export default function remarkHeadings() {
  return (tree: Node) => {
    const counts = new Map<string, number>();
    function visit(node: Node) {
      if (node.type === "heading") {
        const base =
          textOf(node)
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .trim()
            .replace(/\s+/g, "-") || "section";
        const count = counts.get(base) ?? 0;
        counts.set(base, count + 1);
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: count ? `${base}-${count + 1}` : base },
        };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
