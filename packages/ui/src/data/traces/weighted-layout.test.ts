import { describe, expect, it } from "vitest";
import { flameLayout, treemapLayout, type WeightedNode } from "./weighted-layout";

const root: WeightedNode = { id: "root", label: "All", self: 0, total: 10, children: [
  { id: "recursive", label: "work", self: 2, total: 6, children: [
    { id: "recursive/recursive", label: "work", self: 4, total: 4, children: [] },
  ] },
  { id: "other", label: "work", self: 4, total: 4, children: [] },
] };

describe("weighted profile layout", () => {
  it("preserves recursive paths and cumulative widths in a flamegraph", () => {
    const layout = flameLayout(root);
    expect(layout.map(rect => [rect.node.id, rect.width, rect.depth])).toEqual([
      ["root", 1, 0], ["recursive", 0.6, 1], ["recursive/recursive", 0.4, 2], ["other", 0.4, 1],
    ]);
  });

  it("assigns each exclusive byte once in a memory treemap", () => {
    const layout = treemapLayout(root);
    expect(layout.reduce((sum, rect) => sum + rect.width * rect.height, 0)).toBeCloseTo(1);
    expect(layout.map(rect => rect.node.id)).toEqual(["recursive", "recursive/recursive", "other"]);
  });

  it("rejects inconsistent totals and negative weights", () => {
    expect(() => flameLayout({ ...root, total: 9 })).toThrow(/total/);
    expect(() => treemapLayout({ ...root, self: -1 })).toThrow(/weight/);
  });
});
