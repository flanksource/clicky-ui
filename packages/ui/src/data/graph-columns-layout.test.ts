import { describe, expect, it } from "vitest";
import { columnsLayout } from "./graph-columns-layout";

describe("columnsLayout", () => {
  // Column pitch = nodeWidth + columnGap = 160; row pitch = nodeHeight + rowGap = 50.
  const metrics = {
    nodeWidth: 100,
    nodeHeight: 40,
    columnGap: 60,
    rowGap: 10,
    groupPadding: 8,
    padding: 20,
  };

  it("buckets nodes into columns by level, shifting a negative minimum level to the first column", () => {
    const layout = columnsLayout(
      [
        { id: "root", level: 0 },
        { id: "callee-a", level: 1 },
        { id: "callee-b", level: 1 },
        { id: "caller", level: -1 },
      ],
      [],
      metrics,
    );

    expect(layout).toEqual({
      width: 460,
      height: 130,
      positions: {
        caller: { x: 70, y: 65 },
        root: { x: 230, y: 65 },
        "callee-a": { x: 390, y: 40 },
        "callee-b": { x: 390, y: 90 },
      },
      groups: [],
    });
  });

  it("keeps each group's nodes contiguous and returns one padded rectangle per column group", () => {
    const layout = columnsLayout(
      [
        { id: "a", level: 0, group: "g1" },
        { id: "b", level: 0, group: "g2" },
        { id: "c", level: 0, group: "g1" },
      ],
      [],
      metrics,
    );

    expect(layout).toEqual({
      width: 156,
      height: 212,
      positions: {
        a: { x: 78, y: 48 },
        c: { x: 78, y: 98 },
        b: { x: 78, y: 164 },
      },
      groups: [
        { id: "0:g1", group: "g1", level: 0, x: 20, y: 20, width: 116, height: 106 },
        { id: "0:g2", group: "g2", level: 0, x: 20, y: 136, width: 116, height: 56 },
      ],
    });
  });

  it("stacks compact nodes at their own height and gap, and pads a group of only compact nodes tighter", () => {
    const layout = columnsLayout(
      [
        { id: "a", level: 0, group: "g1", compact: true },
        { id: "b", level: 0, group: "g1", compact: true },
        { id: "c", level: 0, group: "g2" },
      ],
      [],
      { ...metrics, compactNodeHeight: 20, compactRowGap: 4, compactGroupPadding: 6 },
    );

    expect(layout).toEqual({
      width: 156,
      height: 162,
      positions: {
        a: { x: 78, y: 36 },
        b: { x: 78, y: 60 },
        c: { x: 78, y: 114 },
      },
      groups: [
        { id: "0:g1", group: "g1", level: 0, x: 22, y: 20, width: 112, height: 56 },
        { id: "0:g2", group: "g2", level: 0, x: 20, y: 86, width: 116, height: 56 },
      ],
    });
  });

  it("keeps the regular gap between a compact node and a regular one in the same group", () => {
    const layout = columnsLayout(
      [
        { id: "a", level: 0, group: "g", compact: true },
        { id: "b", level: 0, group: "g" },
      ],
      [],
      { ...metrics, compactNodeHeight: 20, compactRowGap: 4, compactGroupPadding: 6 },
    );

    // Regular padding 8: a's centre 20 + 8 + 10; b's top after a's 20px and the regular 10px gap.
    expect([layout.positions.a, layout.positions.b, layout.groups[0]?.height]).toEqual([{ x: 78, y: 38 }, { x: 78, y: 78 }, 86]);
  });

  it("orders a column by its neighbours' positions in the column nearer level 0, uncrossing edges", () => {
    // Input order would draw p→y and q→x as a crossing; so would n→p and m→q.
    const layout = columnsLayout(
      [
        { id: "p", level: 0 },
        { id: "q", level: 0 },
        { id: "x", level: 1 },
        { id: "y", level: 1 },
        { id: "m", level: -1 },
        { id: "n", level: -1 },
      ],
      [
        { id: "p-y", from: "p", to: "y" },
        { id: "q-x", from: "q", to: "x" },
        { id: "m-q", from: "m", to: "q" },
        { id: "n-p", from: "n", to: "p" },
      ],
      metrics,
    );

    expect(layout.positions).toEqual({
      n: { x: 70, y: 40 },
      m: { x: 70, y: 90 },
      p: { x: 230, y: 40 },
      q: { x: 230, y: 90 },
      y: { x: 390, y: 40 },
      x: { x: 390, y: 90 },
    });
  });

  it("keeps input order for nodes whose neighbours tie, and puts nodes without neighbours last", () => {
    const layout = columnsLayout(
      [
        { id: "root", level: 0 },
        { id: "orphan", level: 1 },
        { id: "first", level: 1 },
        { id: "second", level: 1 },
      ],
      [
        { id: "root-first", from: "root", to: "first" },
        { id: "root-second", from: "root", to: "second" },
      ],
      metrics,
    );

    expect([layout.positions.first?.y, layout.positions.second?.y, layout.positions.orphan?.y]).toEqual([
      40, 90, 140,
    ]);
  });

  it("never lets the neighbour ordering pull a node out of its group", () => {
    // `late` is wired to the top of column 0, but its group first appears second.
    const layout = columnsLayout(
      [
        { id: "top", level: 0 },
        { id: "bottom", level: 0 },
        { id: "early", level: 1, group: "g1" },
        { id: "late", level: 1, group: "g2" },
      ],
      [
        { id: "top-late", from: "top", to: "late" },
        { id: "bottom-early", from: "bottom", to: "early" },
      ],
      metrics,
    );

    expect(layout.groups.map((box) => box.group)).toEqual(["g1", "g2"]);
  });

  it("centres a shorter column against the tallest column", () => {
    const layout = columnsLayout(
      [
        { id: "root", level: 0 },
        { id: "top", level: 1 },
        { id: "middle", level: 1 },
        { id: "bottom", level: 1 },
      ],
      [],
      metrics,
    );

    expect({ height: layout.height, root: layout.positions.root, middle: layout.positions.middle }).toEqual({
      height: 180,
      root: { x: 70, y: 90 },
      middle: { x: 230, y: 90 },
    });
  });

  it("reserves the room a loop needs on the right of the last column", () => {
    const nodes = [
      { id: "a", level: 0 },
      { id: "b", level: 0 },
    ];
    const plain = columnsLayout(nodes, [], metrics);
    // The loop spans one 50px row: control points 36 out, so it peaks 27 past the column.
    const looped = columnsLayout(nodes, [{ id: "a-b", from: "a", to: "b" }], metrics);

    expect([plain.width, looped.width, looped.positions.a?.x]).toEqual([140, 167, 70]);
  });

  it("reserves the room a loop needs on the left of the first column, moving every node right", () => {
    // The first column's other edge leaves its right side, so its loop takes the left.
    const layout = columnsLayout(
      [
        { id: "a", level: 0 },
        { id: "b", level: 0 },
        { id: "c", level: 1 },
      ],
      [
        { id: "a-b", from: "a", to: "b" },
        { id: "a-c", from: "a", to: "c" },
      ],
      metrics,
    );

    expect([layout.width, layout.positions.a?.x, layout.positions.c?.x]).toEqual([327, 97, 257]);
  });

  it("re-orders an inner column against the column beyond it when that removes a crossing", () => {
    // x and y are pinned top-to-bottom by their groups. Ordered against the root alone, a and b tie
    // and keep input order, which crosses a→y over b→x.
    const nodes = [
      { id: "root", level: 0 },
      { id: "a", level: 1 },
      { id: "b", level: 1 },
      { id: "x", level: 2, group: "g1" },
      { id: "y", level: 2, group: "g2" },
    ];
    const edges = [
      { id: "root-a", from: "root", to: "a" },
      { id: "root-b", from: "root", to: "b" },
      { id: "a-y", from: "a", to: "y" },
      { id: "b-x", from: "b", to: "x" },
    ];
    const ys = (sweeps?: number) => {
      const { positions } = columnsLayout(nodes, edges, { ...metrics, ...(sweeps !== undefined ? { sweeps } : {}) });
      return ["a", "b", "x", "y"].map((id) => positions[id]?.y);
    };

    expect({ firstPlacement: ys(0), swept: ys() }).toEqual({
      firstPlacement: [56, 106, 48, 114],
      swept: [106, 56, 48, 114],
    });
  });

  it("returns an empty, padding-only layout for no nodes", () => {
    expect(columnsLayout([], [], metrics)).toEqual({ width: 40, height: 40, positions: {}, groups: [] });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])("throws, naming the node, when its level is %s", (level) => {
    expect(() => columnsLayout([{ id: "lost", level }], [], metrics)).toThrow(/"lost".*level/);
  });

  it("throws, naming the edge id, when an edge references an unknown node", () => {
    expect(() =>
      columnsLayout([{ id: "a", level: 0 }], [{ id: "bad-edge", from: "a", to: "ghost" }], metrics),
    ).toThrow(/bad-edge/);
  });
});
