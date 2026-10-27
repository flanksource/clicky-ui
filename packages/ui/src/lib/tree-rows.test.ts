import { collectTreeKeys, expandAllTree, visibleTreeRows } from "./tree-rows";

type Node = { id: string; children?: Node[] };
const accessors = { getChildren: (node: Node) => node.children, getKey: (node: Node) => node.id };
const roots: Node[] = [
  { id: "company", children: [{ id: "acme", children: [{ id: "policy" }, { id: "claim" }] }] },
  { id: "plan", children: [{ id: "gold" }] },
  { id: "loose" },
];

describe("visibleTreeRows", () => {
  it("walks depth-first and stops under closed parents", () => {
    const open = new Set(["company", "acme"]);
    expect(visibleTreeRows(roots, accessors, (_node, key) => open.has(key)).map((row) => [row.key, row.depth, row.hasChildren, row.open])).toEqual([
      ["company", 0, true, true],
      ["acme", 1, true, true],
      ["policy", 2, false, false],
      ["claim", 2, false, false],
      ["plan", 0, true, false],
      ["loose", 0, false, false],
    ]);
  });

  it("never reports a leaf as open, even when asked to open everything", () => {
    expect(visibleTreeRows(roots, accessors, () => true).filter((row) => row.open).map((row) => row.key)).toEqual(["company", "acme", "plan"]);
  });
});

describe("collectTreeKeys", () => {
  it("lists only parents, at every depth", () => {
    expect(collectTreeKeys(roots, accessors)).toEqual(["company", "acme", "plan"]);
    expect(expandAllTree(roots, accessors, false)).toEqual({ company: false, acme: false, plan: false });
  });
});
