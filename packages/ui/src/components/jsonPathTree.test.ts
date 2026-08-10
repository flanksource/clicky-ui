import { describe, expect, it } from "vitest";
import {
  appendJSONPath,
  buildJSONPathNode,
  createLazyJSONPathTree,
  literalSegments,
  type JSONPathNode,
} from "./jsonPathTree";

// A branch deeper than the eager walk's cap, so the two walks visibly disagree.
function nest(depth: number): unknown {
  let value: unknown = "leaf";
  for (let i = 0; i < depth; i += 1) value = { down: value };
  return value;
}

function open(tree: ReturnType<typeof createLazyJSONPathTree>, node: JSONPathNode): JSONPathNode[] {
  expect(tree.hasMoreChildren(node)).toBe(true);
  const children = node.children ?? [];
  void tree.loadChildren(node);
  return node.children ?? children;
}

function descend(tree: ReturnType<typeof createLazyJSONPathTree>, key: string): JSONPathNode {
  const [root] = tree.roots;
  let node = root!;
  for (let i = 0; i < 20; i += 1) {
    const next = open(tree, node).find((child) => child.path.endsWith(key));
    if (!next) throw new Error(`no ${key} under ${node.path}`);
    node = next;
  }
  return node;
}

describe("buildJSONPathNode", () => {
  it("stops at the depth cap so the dropdown opens without walking the document", () => {
    const node = buildJSONPathNode(nest(20), "$", 0);

    let deepest = node;
    let depth = 0;
    while (deepest.children?.length) {
      deepest = deepest.children[0]!;
      depth += 1;
    }
    expect(depth).toBe(12);
    expect(deepest.kind).toBe("object");
  });

  it("exposes only the first array element by default", () => {
    const node = buildJSONPathNode({ items: ["a", "b", "c"] }, "$", 0);

    expect(node.children?.[0]?.children?.map((child) => child.path)).toEqual(["$.items[0]"]);
    expect(node.children?.[0]?.childCount).toBe(3);
  });

  it("exposes every array element when asked", () => {
    const node = buildJSONPathNode({ items: ["a", "b", "c"] }, "$", 0, { arrayMode: "all" });

    expect(node.children?.[0]?.children?.map((child) => child.path)).toEqual([
      "$.items[0]",
      "$.items[1]",
      "$.items[2]",
    ]);
  });
});

describe("appendJSONPath", () => {
  it("brackets keys a dot cannot address", () => {
    expect(appendJSONPath("$", "tenant-id")).toBe('$["tenant-id"]');
    expect(appendJSONPath("$", "payload")).toBe("$.payload");
    expect(appendJSONPath("$.items", 2)).toBe("$.items[2]");
  });
});

describe("createLazyJSONPathTree", () => {
  it("descends past the eager walk's depth cap", () => {
    const tree = createLazyJSONPathTree(nest(20));

    const node = descend(tree, "down");
    expect(node.path).toBe(`$${".down".repeat(20)}`);
    expect(node.value).toBe("leaf");
    expect(tree.hasMoreChildren(node)).toBe(false);
  });

  it("materialises nothing until a branch is opened", () => {
    const tree = createLazyJSONPathTree(nest(20));

    expect(tree.getChildren(tree.roots[0]!)).toBeUndefined();
    expect(tree.hasMoreChildren(tree.roots[0]!)).toBe(true);
  });

  it("exposes every array element", () => {
    const tree = createLazyJSONPathTree({ items: ["a", "b", "c"] });
    const items = open(tree, tree.roots[0]!)[0]!;

    expect(open(tree, items).map((child) => child.path)).toEqual([
      "$.items[0]",
      "$.items[1]",
      "$.items[2]",
    ]);
  });

  it("reports the entries it stopped short of rather than dropping them silently", () => {
    const tree = createLazyJSONPathTree({ items: Array.from({ length: 12 }, (_, i) => i) }, { maxChildren: 10 });
    const children = open(tree, open(tree, tree.roots[0]!)[0]!);

    expect(children).toHaveLength(11);
    expect(children.at(-1)).toMatchObject({ kind: "more", childCount: 2 });
    expect(children.at(-1)?.summary).toContain("2 more not shown");
  });

  // Tree highlights the committed node by object identity, so a reopened branch
  // that handed back rebuilt nodes would silently lose the selection.
  it("returns the same node objects when a branch is read again", () => {
    const tree = createLazyJSONPathTree({ a: { b: 1 } });
    const first = open(tree, tree.roots[0]!)[0]!;

    expect(tree.hasMoreChildren(tree.roots[0]!)).toBe(false);
    expect(tree.getChildren(tree.roots[0]!)?.[0]).toBe(first);
    expect(tree.materializePath("$.a")).toBe(first);
  });

  it("descends into a column carrying JSON as text, rooted at that column", () => {
    const tree = createLazyJSONPathTree({ payload: '{"status":"OPEN","items":[{"sku":"a"}]}' });
    const payload = open(tree, tree.roots[0]!)[0]!;

    expect(payload.kind).toBe("scalar");
    const children = open(tree, payload);
    // Rooted at `$` because that is where the backend evaluates it from once the
    // column is named as the column's `source`.
    expect(children.map((child) => child.path)).toEqual(["$.status", "$.items"]);
    expect(children.every((child) => child.root === "payload")).toBe(true);
  });

  it("leaves a string that is not JSON as a leaf", () => {
    const tree = createLazyJSONPathTree({ note: "OPEN", empty: "{}" });
    const [note, empty] = open(tree, tree.roots[0]!);

    expect(tree.hasMoreChildren(note!)).toBe(false);
    expect(tree.hasMoreChildren(empty!)).toBe(false);
  });

  it("walks the branch a literal expression addresses", () => {
    const tree = createLazyJSONPathTree({ messages: [{ "tenant-id": 7 }] });

    expect(tree.materializePath('$.messages[0]["tenant-id"]')?.value).toBe(7);
    expect(tree.materializePath("$.messages[9]")).toBeUndefined();
  });

  it("refuses to walk an expression that selects rather than addresses", () => {
    const tree = createLazyJSONPathTree({ messages: [{ id: 1 }] });

    expect(tree.materializePath("$.messages[*].id")).toBeUndefined();
    expect(tree.materializePath("$..id")).toBeUndefined();
    expect(tree.materializePath("$.messages[?(@.id == 1)]")).toBeUndefined();
  });
});

describe("literalSegments", () => {
  it("reads dotted, bracketed and quoted chains", () => {
    expect(literalSegments("$")).toEqual([]);
    expect(literalSegments("$.a.b")).toEqual(["a", "b"]);
    expect(literalSegments('$["tenant-id"][0]')).toEqual(["tenant-id", 0]);
    expect(literalSegments("$['a'].b")).toEqual(["a", "b"]);
  });

  it("rejects anything that selects a set", () => {
    expect(literalSegments("$.*")).toBeUndefined();
    expect(literalSegments("$..a")).toBeUndefined();
    expect(literalSegments("$[?(@.a)]")).toBeUndefined();
    expect(literalSegments("$[1:2]")).toBeUndefined();
    expect(literalSegments("a.b")).toBeUndefined();
    expect(literalSegments("")).toBeUndefined();
  });
});
