import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphDiagram, type GraphDiagramEdge, type GraphDiagramNode } from "./GraphDiagram";

const nodes: GraphDiagramNode[] = [
  { id: "victim", label: "Session 93 · victim" },
  { id: "survivor", label: "Session 47 · survivor" },
  { id: "lock-a", label: "Lock A" },
];

const edges: GraphDiagramEdge[] = [
  { id: "holds", from: "lock-a", to: "victim", label: "holds X" },
  { id: "wants", from: "victim", to: "survivor", label: "wants S", dashed: true },
];

describe("GraphDiagram", () => {
  it("renders every node's label", () => {
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" />);

    expect(screen.getByText("Session 93 · victim")).toBeInTheDocument();
    expect(screen.getByText("Session 47 · survivor")).toBeInTheDocument();
    expect(screen.getByText("Lock A")).toBeInTheDocument();
  });

  it("renders every edge's label", () => {
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" />);

    expect(screen.getByText("holds X")).toBeInTheDocument();
    expect(screen.getByText("wants S")).toBeInTheDocument();
  });

  it("applies the ariaLabel to the svg", () => {
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" />);

    expect(screen.getByRole("img", { name: "Deadlock graph" })).toBeInTheDocument();
  });

  it("calls onNodeSelect when a node is clicked", () => {
    const onNodeSelect = vi.fn();
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" onNodeSelect={onNodeSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /victim/ }));

    expect(onNodeSelect).toHaveBeenCalledWith("victim");
  });

  it("calls onNodeSelect when Enter is pressed on a focused node", () => {
    const onNodeSelect = vi.fn();
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" onNodeSelect={onNodeSelect} />);

    fireEvent.keyDown(screen.getByRole("button", { name: /survivor/ }), { key: "Enter" });

    expect(onNodeSelect).toHaveBeenCalledWith("survivor");
  });

  it("calls onNodeSelect when Space is pressed on a focused node", () => {
    const onNodeSelect = vi.fn();
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" onNodeSelect={onNodeSelect} />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Lock A" }), { key: " " });

    expect(onNodeSelect).toHaveBeenCalledWith("lock-a");
  });

  it("marks the selected node via aria-pressed", () => {
    render(
      <GraphDiagram
        nodes={nodes}
        edges={edges}
        ariaLabel="Deadlock graph"
        onNodeSelect={() => {}}
        selectedId="victim"
      />,
    );

    expect(screen.getByRole("button", { name: /victim/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /survivor/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("does not make nodes keyboard targets when onNodeSelect is omitted", () => {
    render(<GraphDiagram nodes={nodes} edges={edges} ariaLabel="Deadlock graph" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("throws, naming the edge id, when an edge references an unknown node", () => {
    const badEdges: GraphDiagramEdge[] = [{ id: "bad-edge", from: "victim", to: "ghost" }];

    expect(() =>
      render(<GraphDiagram nodes={nodes} edges={badEdges} ariaLabel="Deadlock graph" />),
    ).toThrow(/bad-edge/);
  });
});
