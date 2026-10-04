import { describe, expect, it } from "vitest";
import { loopOverhang, pointOnCurve, routeEdges, spreadLabels } from "./graph-edge-routing";

const dims = { nodeWidth: 100, nodeHeight: 40 };
const side = { anchor: "side" as const };

describe("routeEdges with side anchors", () => {
  // a and d share a column; b is two columns to the right of a, near is adjacent to it.
  const positions = {
    a: { x: 100, y: 100 },
    b: { x: 400, y: 200 },
    d: { x: 100, y: 200 },
    near: { x: 230, y: 100 },
  };

  it("runs a forward edge from the source's right-middle to the target's left-middle", () => {
    const routes = routeEdges([{ id: "fwd", from: "a", to: "b" }], positions, dims, side);

    expect(routes.fwd).toEqual({
      path: "M 150 100 C 250 100 250 200 350 200",
      labelX: 250,
      labelY: 150,
      curve: [
        { x: 150, y: 100 },
        { x: 250, y: 100 },
        { x: 250, y: 200 },
        { x: 350, y: 200 },
      ],
    });
  });

  it("runs a backward edge from the source's left-middle to the target's right-middle", () => {
    const routes = routeEdges([{ id: "back", from: "b", to: "a" }], positions, dims, side);

    expect([routes.back?.path, routes.back?.labelX, routes.back?.labelY]).toEqual([
      "M 350 200 C 250 200 250 100 150 100",
      250,
      150,
    ]);
  });

  it("keeps a minimum horizontal control offset of 36 between adjacent nodes", () => {
    const routes = routeEdges([{ id: "tight", from: "a", to: "near" }], positions, dims, side);

    expect(routes.tight?.path).toBe("M 150 100 C 186 100 144 100 180 100");
  });

  it("fans parallel edges between the same pair onto distinct paths", () => {
    const routes = routeEdges(
      [
        { id: "call", from: "a", to: "b" },
        { id: "dispatch", from: "a", to: "b" },
      ],
      positions,
      dims,
      side,
    );

    expect([routes.call?.path, routes.dispatch?.path]).toEqual([
      "M 150 89 C 250 89 250 189 350 189",
      "M 150 111 C 250 111 250 211 350 211",
    ]);
  });

  it("fans parallel edges no wider than the shorter of the two nodes allows", () => {
    // b is 20px tall: the fan step is its height less the 12px port inset.
    const routes = routeEdges(
      [
        { id: "read", from: "a", to: "b" },
        { id: "write", from: "a", to: "b" },
      ],
      positions,
      { ...dims, nodeHeights: { b: 20 } },
      side,
    );

    expect([routes.read?.path, routes.write?.path]).toEqual([
      "M 150 96 C 250 96 250 196 350 196",
      "M 150 104 C 250 104 250 204 350 204",
    ]);
  });

  it("fans a reciprocal pair so the forward and backward edges do not overlap", () => {
    const routes = routeEdges(
      [
        { id: "out", from: "a", to: "b" },
        { id: "back", from: "b", to: "a" },
      ],
      positions,
      dims,
      side,
    );

    expect([routes.out?.path, routes.back?.path]).toEqual([
      "M 150 89 C 250 89 250 189 350 189",
      "M 350 211 C 250 211 250 111 150 111",
    ]);
  });

  it("throws, naming the edge id, when an edge references an unknown node", () => {
    expect(() => routeEdges([{ id: "bad-edge", from: "a", to: "missing" }], positions, dims, side)).toThrow(
      /bad-edge/,
    );
  });
});

describe("routeEdges loops", () => {
  // One column at x=100, its right side at x=150. A loop's control points sit
  // 24 + 18% of the height it spans past that side, and no nearer than 36.
  const column = {
    top: { x: 100, y: 100 },
    mid: { x: 100, y: 200 },
    low: { x: 100, y: 500 },
  };

  it("arcs an edge between two nodes of a lone column out of its right side and back", () => {
    const routes = routeEdges([{ id: "down", from: "top", to: "mid" }], column, dims, side);

    expect(routes.down).toEqual({
      path: "M 150 100 C 192 100 192 200 150 200",
      labelX: 181.5,
      labelY: 150,
      labelAnchor: "start",
    });
  });

  it("arcs a loop further the more height it spans, so a long loop clears a short one", () => {
    const routes = routeEdges(
      [
        { id: "short", from: "top", to: "mid" },
        { id: "long", from: "top", to: "low" },
      ],
      column,
      dims,
      side,
    );

    expect([routes.short?.path, routes.long?.path]).toEqual([
      "M 150 100 C 192 100 192 200 150 200",
      "M 150 100 C 246 100 246 500 150 500",
    ]);
  });

  it("stops a loop's reach growing at 240", () => {
    const tall = { top: { x: 100, y: 0 }, bottom: { x: 100, y: 2000 } };
    const routes = routeEdges([{ id: "tall", from: "top", to: "bottom" }], tall, dims, side);

    expect(routes.tall?.path).toBe("M 150 0 C 390 0 390 2000 150 2000");
  });

  it("draws a self-edge as a visible loop beside its node", () => {
    const routes = routeEdges([{ id: "self", from: "top", to: "top" }], column, dims, side);

    expect(routes.self).toEqual({
      path: "M 150 90 C 186 90 186 110 150 110",
      labelX: 177,
      labelY: 100,
      labelAnchor: "start",
    });
  });

  it("gives parallel same-column edges distinct arcs", () => {
    const routes = routeEdges(
      [
        { id: "inner", from: "top", to: "mid" },
        { id: "outer", from: "top", to: "mid" },
      ],
      column,
      dims,
      side,
    );

    expect([routes.inner?.path, routes.outer?.path]).toEqual([
      "M 150 100 C 192 100 192 200 150 200",
      "M 150 100 C 214 100 214 200 150 200",
    ]);
  });

  it("bulges a column's loops on the side with fewer edges to other columns", () => {
    // The column's only other edge leaves its right side, so the loop takes the left.
    const routes = routeEdges(
      [
        { id: "away", from: "top", to: "callee" },
        { id: "down", from: "top", to: "mid" },
      ],
      { ...column, callee: { x: 400, y: 150 } },
      dims,
      side,
    );

    expect(routes.down).toEqual({
      path: "M 50 100 C 8 100 8 200 50 200",
      labelX: 18.5,
      labelY: 150,
      labelAnchor: "end",
    });
  });

  it("keeps a loop within 60% of the gap to the next column on its side", () => {
    // Columns at -100, 100 and 300 leave 100px gaps. The loop goes right, where nothing attaches, and
    // may peak 60px into that gap: control points 80px out, against the 96 its 400px span asks for.
    const routes = routeEdges(
      [
        { id: "in", from: "caller", to: "top" },
        { id: "down", from: "top", to: "low" },
      ],
      { ...column, caller: { x: -100, y: 100 }, callee: { x: 300, y: 100 } },
      dims,
      side,
    );

    expect(routes.down?.path).toBe("M 150 100 C 230 100 230 500 150 500");
  });
});

describe("loopOverhang", () => {
  const column = { top: { x: 100, y: 100 }, low: { x: 100, y: 500 } };

  it("is how far the loops peak past the outermost columns on each side", () => {
    // Right: control points at 246, so the loop peaks at 150 + 0.75 * 96 = 222, 72 past the column.
    const right = loopOverhang([{ id: "down", from: "top", to: "low" }], column, dims);
    const left = loopOverhang(
      [
        { id: "away", from: "top", to: "callee" },
        { id: "down", from: "top", to: "low" },
      ],
      { ...column, callee: { x: 400, y: 150 } },
      dims,
    );

    expect([right, left]).toEqual([
      { left: 0, right: 72 },
      { left: 72, right: 0 },
    ]);
  });

  it("is zero without loops", () => {
    const positions = { a: { x: 100, y: 100 }, b: { x: 400, y: 100 } };

    expect(loopOverhang([{ id: "a-b", from: "a", to: "b" }], positions, dims)).toEqual({ left: 0, right: 0 });
  });
});

describe("pointOnCurve", () => {
  it("walks a cubic from its start to its end", () => {
    const curve = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 200 },
      { x: 200, y: 200 },
    ] as const;

    expect([0, 0.5, 1].map((t) => pointOnCurve(curve, t))).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 200 },
    ]);
  });
});

describe("spreadLabels with an end anchor", () => {
  it("treats an end-anchored label as running left of its point", () => {
    const size = { width: 80, height: 18 };
    const ys = spreadLabels([
      { id: "left-of-point", x: 100, y: 100, anchor: "end", ...size },
      // Spans 0–80: under the first label (20–100), so it drops one row.
      { id: "covered", x: 40, y: 104, ...size },
      // Spans 110–190: right of the point, so clear of both.
      { id: "clear", x: 150, y: 102, ...size },
    ]);

    expect(ys).toEqual({ "left-of-point": 100, covered: 120, clear: 102 });
  });
});
