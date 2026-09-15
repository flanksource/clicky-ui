import { describe, expect, it } from "vitest";
import { ringLayout, routeEdges, type GraphLayoutPosition } from "./graph-layout";

function distance(a: GraphLayoutPosition, b: GraphLayoutPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function makeNodes(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `n${i}` }));
}

describe("ringLayout", () => {
  it("centres a single node with zero radius", () => {
    const { positions, width, height } = ringLayout(makeNodes(1), { nodeWidth: 100, nodeHeight: 40 });

    expect(positions.n0.x).toBeCloseTo(width / 2);
    expect(positions.n0.y).toBeCloseTo(height / 2);
  });

  it("places two nodes left/right rather than 12-and-6 o'clock", () => {
    const { positions } = ringLayout(makeNodes(2), { nodeWidth: 100, nodeHeight: 40 });

    expect(positions.n0.y).toBeCloseTo(positions.n1.y);
    expect(positions.n0.x).toBeLessThan(positions.n1.x);
  });

  it("starts the first node at 12 o'clock (directly above centre) for n >= 3", () => {
    const nodeWidth = 100;
    const nodeHeight = 40;
    const { positions, width, height } = ringLayout(makeNodes(4), { nodeWidth, nodeHeight });
    const cx = width / 2;
    const cy = height / 2;

    expect(positions.n0.x).toBeCloseTo(cx);
    expect(positions.n0.y).toBeLessThan(cy);
  });

  it("runs clockwise: the second node lands to the right of centre before the third lands below", () => {
    const { positions, width, height } = ringLayout(makeNodes(4), { nodeWidth: 100, nodeHeight: 40 });
    const cx = width / 2;
    const cy = height / 2;

    expect(positions.n1.x).toBeGreaterThan(cx);
    expect(positions.n1.y).toBeCloseTo(cy);
    expect(positions.n2.y).toBeGreaterThan(cy);
    expect(positions.n3.x).toBeLessThan(cx);
  });

  it("keeps adjacent nodes from overlapping as the ring grows", () => {
    const nodeWidth = 120;
    const nodeHeight = 50;
    const gap = 30;

    for (const count of [3, 5, 8, 13]) {
      const { positions } = ringLayout(makeNodes(count), { nodeWidth, nodeHeight, gap });
      const ids = Object.keys(positions);
      for (let i = 0; i < ids.length; i++) {
        const next = ids[(i + 1) % ids.length];
        expect(distance(positions[ids[i]], positions[next])).toBeGreaterThanOrEqual(nodeWidth + gap - 1e-6);
      }
    }
  });

  it("grows the radius (and thus the bounding box) as node count increases", () => {
    const options = { nodeWidth: 120, nodeHeight: 50, gap: 30 };
    const small = ringLayout(makeNodes(4), options);
    const large = ringLayout(makeNodes(12), options);

    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });

  it("applies a sensible minimum radius even for a tiny ring", () => {
    const { positions, width, height } = ringLayout(makeNodes(3), {
      nodeWidth: 10,
      nodeHeight: 10,
      gap: 2,
      padding: 0,
    });
    const cx = width / 2;
    const cy = height / 2;
    const radius = distance(positions.n0, { x: cx, y: cy });

    expect(radius).toBeGreaterThanOrEqual(96);
  });

  it("is deterministic across repeated calls with the same input", () => {
    const nodes = makeNodes(6);
    const first = ringLayout(nodes, { nodeWidth: 100, nodeHeight: 40 });
    const second = ringLayout(nodes, { nodeWidth: 100, nodeHeight: 40 });

    expect(second).toEqual(first);
  });
});

describe("routeEdges", () => {
  const dims = { nodeWidth: 100, nodeHeight: 40 };

  it("routes a lone edge as a straight line", () => {
    const positions = { a: { x: 0, y: 0 }, b: { x: 300, y: 0 } };
    const routes = routeEdges([{ id: "e1", from: "a", to: "b" }], positions, dims);

    expect(routes.e1.path).toMatch(/^M .* L .*$/);
  });

  it("places the label at the straight edge's midpoint", () => {
    const positions = { a: { x: 0, y: 0 }, b: { x: 300, y: 0 } };
    const routes = routeEdges([{ id: "e1", from: "a", to: "b" }], positions, dims);

    expect(routes.e1.labelX).toBeCloseTo(150);
    expect(routes.e1.labelY).toBeCloseTo(0);
  });

  it("curves reciprocal edges to opposite sides of the straight line", () => {
    const positions = { a: { x: 0, y: 0 }, b: { x: 300, y: 0 } };
    const routes = routeEdges(
      [
        { id: "holds", from: "a", to: "b" },
        { id: "wants", from: "b", to: "a" },
      ],
      positions,
      dims,
    );

    expect(routes.holds.path).toMatch(/^M .* Q .* .*$/);
    expect(routes.wants.path).toMatch(/^M .* Q .* .*$/);
    // Both curve away from the straight line (y=0) but on opposite sides.
    expect(Math.sign(routes.holds.labelY)).not.toBe(0);
    expect(Math.sign(routes.holds.labelY)).toBe(-Math.sign(routes.wants.labelY));
  });

  it("gives parallel duplicate edges distinct offsets", () => {
    const positions = { a: { x: 0, y: 0 }, b: { x: 300, y: 0 } };
    const routes = routeEdges(
      [
        { id: "dup1", from: "a", to: "b" },
        { id: "dup2", from: "a", to: "b" },
        { id: "dup3", from: "a", to: "b" },
      ],
      positions,
      dims,
    );

    const labelYs = [routes.dup1.labelY, routes.dup2.labelY, routes.dup3.labelY];
    expect(new Set(labelYs.map((y) => y.toFixed(4))).size).toBe(3);
  });

  it("is deterministic across repeated calls with the same input", () => {
    const positions = { a: { x: 0, y: 0 }, b: { x: 300, y: 0 }, c: { x: 150, y: 260 } };
    const edges = [
      { id: "e1", from: "a", to: "b" },
      { id: "e2", from: "b", to: "a" },
      { id: "e3", from: "b", to: "c" },
    ];

    expect(routeEdges(edges, positions, dims)).toEqual(routeEdges(edges, positions, dims));
  });

  it("throws, naming the edge id, when an edge references an unknown node", () => {
    const positions = { a: { x: 0, y: 0 } };

    expect(() => routeEdges([{ id: "bad-edge", from: "a", to: "missing" }], positions, dims)).toThrow(
      /bad-edge/,
    );
  });
});
