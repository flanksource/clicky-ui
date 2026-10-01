import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UiInterface, UiMethod } from "../icons";
import { GraphDiagram, type GraphDiagramEdge, type GraphDiagramNode } from "./GraphDiagram";
import { GraphDiagramEdgeLabels } from "./GraphDiagramEdges";

const METHOD = "method";
const VIA_INTERFACE = "via interface";
const GUARD = "limit > 0";
const RUN_TOOLTIP = "method RunModules in uir/query";

const nodes: GraphDiagramNode[] = [
  { id: "run", label: "RunModules", level: 0, icon: <UiMethod title={METHOD} />, title: RUN_TOOLTIP },
  { id: "load", label: "Load", level: 1 },
  { id: "walk", label: "Walk", level: 1 },
];

const dispatch = { icon: <UiInterface title={VIA_INTERFACE} />, iconLabel: VIA_INTERFACE };
const edges: GraphDiagramEdge[] = [
  { id: "run-load", from: "run", to: "load", label: GUARD, ...dispatch },
  { id: "run-walk", from: "run", to: "walk", ...dispatch },
];

function diagram(props: Partial<Parameters<typeof GraphDiagram>[0]> = {}) {
  return render(<GraphDiagram nodes={nodes} edges={edges} layout="columns" ariaLabel="Call graph" {...props} />);
}

describe("GraphDiagram node icon", () => {
  it("names a selectable node by its icon followed by its label", () => {
    diagram({ onNodeSelect: () => {} });

    expect(screen.getByRole("button", { name: `${METHOD} RunModules` })).toBeInTheDocument();
  });

  it("draws an icon slot only on the node that has an icon", () => {
    const { container } = diagram();

    expect(
      Array.from(container.querySelectorAll("[data-graph-node-icon]")).map(
        (slot) => slot.closest<HTMLElement>("[data-graph-node]")?.dataset.graphNode,
      ),
    ).toEqual(["run"]);
  });

  it("shows a node's title as its native tooltip", () => {
    diagram({ onNodeSelect: () => {} });

    expect(screen.getByRole("button", { name: `${METHOD} RunModules` })).toHaveAttribute("title", RUN_TOOLTIP);
  });

  // Two 15px label lines, 12px of padding and a 2px border need 44px.
  it.each([
    { nodeHeight: 43, clamp: ["truncate", "truncate"] },
    { nodeHeight: 44, clamp: ["line-clamp-2", "line-clamp-2"] },
  ])("keeps the label to one line only on a node too short for two: $nodeHeight px", ({ nodeHeight, clamp }) => {
    diagram({ nodeHeight });

    expect(
      ["RunModules", "Load"].map((label) =>
        ["truncate", "line-clamp-2"].find((name) => screen.getByText(label).classList.contains(name)),
      ),
    ).toEqual(clamp);
  });
});

describe("GraphDiagram edge icon", () => {
  it("draws the icon inside the pill, ahead of the label text", () => {
    diagram();
    const pill = screen.getByText(GUARD);
    const icon = within(pill).getByRole("img", { name: VIA_INTERFACE });

    expect([pill.firstElementChild?.contains(icon), pill.lastChild?.textContent]).toEqual([true, GUARD]);
  });

  it("draws a pill for an edge that has an icon and no label", () => {
    const { container } = diagram();

    expect(
      Array.from(container.querySelectorAll<HTMLElement>("[data-graph-edge-label]")).map((pill) => [
        pill.dataset.graphEdgeLabel,
        pill.textContent,
      ]),
    ).toEqual([
      ["run-load", GUARD],
      ["run-walk", ""],
    ]);
  });

  it("names a selectable edge with the icon's label ahead of the pill text", () => {
    diagram({ onEdgeSelect: () => {} });

    expect(
      [`RunModules to Load: ${VIA_INTERFACE} ${GUARD}`, `RunModules to Walk: ${VIA_INTERFACE}`].map((name) =>
        screen.getByRole("button", { name }).tagName,
      ),
    ).toEqual(["path", "path"]);
  });

  // Two "ab" pills 30px apart: 24.8px wide as text they clear each other; the 14px icon and its
  // 4px gap make them 42.8px wide, so the second drops a pill height (19) plus the 2px gap.
  it.each([
    { icons: false, tops: ["50px", "50px"] },
    { icons: true, tops: ["50px", "71px"] },
  ])("spreads pills by their width with the icon counted: icons $icons", ({ icons, tops }) => {
    const pair: GraphDiagramEdge[] = ["a", "b"].map((id) => ({
      id,
      from: "run",
      to: "load",
      label: "ab",
      ...(icons ? dispatch : {}),
    }));
    const { container } = render(
      <GraphDiagramEdgeLabels
        edges={pair}
        routes={{ a: { path: "", labelX: 100, labelY: 50 }, b: { path: "", labelX: 130, labelY: 50 } }}
        place={({ x, y }) => ({ left: x, top: y })}
        spread
        selectedEdgeId={undefined}
        onEdgeSelect={undefined}
      />,
    );

    expect(
      Array.from(container.querySelectorAll<HTMLElement>("[data-graph-edge-label]")).map((pill) => pill.style.top),
    ).toEqual(tops);
  });
});
