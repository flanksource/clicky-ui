import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GraphDiagram, type GraphDiagramEdge, type GraphDiagramNode, type GraphDiagramProps } from "./GraphDiagram";
import { DENSE_EDGE_COUNT, focusedEdgeIds } from "./graph-diagram-model";

/** A root calling `spokes` leaves, every edge labelled `guard <n>`. */
function hub(spokes: number): { nodes: GraphDiagramNode[]; edges: GraphDiagramEdge[] } {
  const leaves = Array.from({ length: spokes }, (_, index) => `leaf-${index}`);
  return {
    nodes: [{ id: "root", label: "Root", level: 0 }, ...leaves.map((id) => ({ id, label: id, level: 1 }))],
    edges: leaves.map((id, index) => ({ id: `root-${id}`, from: "root", to: id, label: `guard ${index}` })),
  };
}

function renderHub(spokes: number, props: Partial<GraphDiagramProps> = {}) {
  const { container } = render(<GraphDiagram {...hub(spokes)} layout="columns" ariaLabel="Hub" {...props} />);
  return {
    container,
    pills: () => Array.from(container.querySelectorAll("[data-graph-edge-label]")).map((pill) => pill.textContent),
    dimmed: () => container.querySelectorAll("[data-graph-edge-dimmed]").length,
  };
}

const DENSE = DENSE_EDGE_COUNT + 1;

describe("focusedEdgeIds", () => {
  const edges = [
    { id: "a-b", from: "a", to: "b" },
    { id: "b-c", from: "b", to: "c" },
    { id: "c-d", from: "c", to: "d" },
  ];

  it("collects the named edges and every edge attached to a named node", () => {
    expect([...focusedEdgeIds(edges, { nodes: ["b"], edges: ["c-d"] })].sort()).toEqual(["a-b", "b-c", "c-d"]);
  });

  it("is empty when nothing is named", () => {
    expect(focusedEdgeIds(edges, { nodes: [undefined], edges: [undefined] }).size).toBe(0);
  });
});

describe("GraphDiagram edge focus", () => {
  it("shows every pill and dims nothing at the dense threshold, whatever is selected", () => {
    const { pills, dimmed } = renderHub(DENSE_EDGE_COUNT, { selectedId: "leaf-3" });

    expect([pills().length, dimmed()]).toEqual([DENSE_EDGE_COUNT, 0]);
  });

  it("past the dense threshold shows no pill and dims nothing until something is in focus", () => {
    const { pills, dimmed } = renderHub(DENSE);

    expect([pills(), dimmed()]).toEqual([[], 0]);
  });

  it("shows only the pills of the selected node's edges and dims every other edge", () => {
    const { pills, dimmed } = renderHub(DENSE, { selectedId: "leaf-3" });

    expect([pills(), dimmed()]).toEqual([["guard 3"], DENSE - 1]);
  });

  it("brings the selected edge into focus", () => {
    const { pills, dimmed } = renderHub(DENSE, { selectedEdgeId: "root-leaf-7" });

    expect([pills(), dimmed()]).toEqual([["guard 7"], DENSE - 1]);
  });

  it("brings a hovered node's edges into focus until the pointer leaves it", () => {
    const { container, pills } = renderHub(DENSE);
    const leaf = container.querySelector('[data-graph-node="leaf-5"]');
    if (!leaf) throw new Error("no leaf-5 node rendered");

    fireEvent.mouseEnter(leaf);
    const hovered = pills();
    fireEvent.mouseLeave(leaf);

    expect([hovered, pills()]).toEqual([["guard 5"], []]);
  });

  it("brings a hovered edge into focus", () => {
    const { container, pills } = renderHub(DENSE);
    const edge = container.querySelector('[data-graph-edge="root-leaf-2"]');
    if (!edge) throw new Error("no root-leaf-2 edge rendered");

    fireEvent.mouseEnter(edge);

    expect(pills()).toEqual(["guard 2"]);
  });

  it("brings the node or edge that has keyboard focus into focus, until it loses it", () => {
    const { container, pills } = renderHub(DENSE, { onNodeSelect: () => {}, onEdgeSelect: () => {} });
    const leaf = container.querySelector('[data-graph-node="leaf-5"] [role=button]');
    const edge = container.querySelector('[data-graph-edge="root-leaf-2"] [role=button]');
    if (!leaf || !edge) throw new Error("no focusable leaf-5 node or root-leaf-2 edge rendered");

    fireEvent.focus(leaf);
    const onNode = pills();
    fireEvent.blur(leaf);
    fireEvent.focus(edge);
    const onEdge = pills();
    fireEvent.blur(edge);

    expect([onNode, onEdge, pills()]).toEqual([["guard 5"], ["guard 2"], []]);
  });

  it("lets the pointer through a pill shown only by hover, and not through a selected one", () => {
    const { container } = renderHub(DENSE, { selectedEdgeId: "root-leaf-7", onEdgeSelect: () => {} });
    const leaf = container.querySelector('[data-graph-node="leaf-5"]');
    if (!leaf) throw new Error("no leaf-5 node rendered");

    fireEvent.mouseEnter(leaf);

    expect(
      ["root-leaf-5", "root-leaf-7"].map((id) =>
        container.querySelector(`[data-graph-edge-label="${id}"]`)?.classList.contains("pointer-events-none"),
      ),
    ).toEqual([true, false]);
  });

  it("slides the pills of a focused node's edges toward their far ends, where a fan has spread out", () => {
    // Root's right side is at x=192 and the leaves' left side at 288, so an edge's midpoint is at 240.
    const midpoint = 240;
    const pillX = (selectedId: string) => {
      const { container } = renderHub(DENSE, { selectedId });
      const pill = container.querySelector<HTMLElement>('[data-graph-edge-label="root-leaf-3"]');
      if (!pill) throw new Error("no root-leaf-3 pill rendered");
      return Number.parseFloat(pill.style.left);
    };

    const [fromRoot, fromLeaf] = [pillX("root"), pillX("leaf-3")];

    expect([fromRoot > midpoint, fromLeaf < midpoint]).toEqual([true, true]);
  });

  it("keeps a slid pill between the two nodes of its edge", () => {
    const label = "a guard long enough to fill the gap";
    const { nodes, edges } = hub(1);
    const { container } = render(
      <GraphDiagram
        nodes={nodes}
        edges={edges.map((edge) => ({ ...edge, label }))}
        layout="columns"
        edgeFocus="on"
        selectedId="root"
        columnGap={240}
        ariaLabel="Hub"
      />,
    );
    const pill = container.querySelector<HTMLElement>("[data-graph-edge-label]");
    if (!pill) throw new Error("no pill rendered");
    // The pill is 35 characters, so about 203px wide; the leaf's left side is at 192 + 240 = 432.
    const halfWidth = 101.5;

    expect(Number.parseFloat(pill.style.left) + halfWidth).toBeLessThanOrEqual(432);
  });

  it("ends the pill of a loop on the left of its column at the loop, so it runs away from the node", () => {
    const { container } = render(
      <GraphDiagram
        nodes={[
          { id: "a", label: "A", level: 0 },
          { id: "b", label: "B", level: 0 },
          { id: "c", label: "C", level: 1 },
        ]}
        edges={[
          { id: "a-b", from: "a", to: "b", label: "loop" },
          { id: "a-c", from: "a", to: "c" },
        ]}
        layout="columns"
        ariaLabel="Loop"
      />,
    );

    expect(
      container.querySelector('[data-graph-edge-label="a-b"]')?.classList.contains("-translate-x-[calc(100%+0.375rem)]"),
    ).toBe(true);
  });

  it('edgeFocus "off" shows every pill of a dense diagram', () => {
    const { pills, dimmed } = renderHub(DENSE, { edgeFocus: "off", selectedId: "leaf-3" });

    expect([pills().length, dimmed()]).toEqual([DENSE, 0]);
  });

  it('edgeFocus "on" hides the pills of a small diagram until something is in focus', () => {
    const { pills } = renderHub(2, { edgeFocus: "on" });

    expect(pills()).toEqual([]);
  });
});
