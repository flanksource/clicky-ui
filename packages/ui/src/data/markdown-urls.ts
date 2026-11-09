type Node = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[] };
export function rehypeDocumentUrls(resolve: (url: string, kind: "link" | "image") => string) {
  return () => (tree: Node) => {
    const visit = (node: Node) => {
      const key = node.tagName === "a" ? "href" : node.tagName === "img" ? "src" : null;
      if (key && node.properties && typeof node.properties[key] === "string") node.properties[key] = resolve(node.properties[key], key === "href" ? "link" : "image");
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}
