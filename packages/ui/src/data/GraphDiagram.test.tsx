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
  it("renders a record header and flush selectable rows with types and an inset selection", () => {
    const row: GraphDiagramNode = { id: "customer-id", label: "ID", group: "Customers", level: 0, size: "compact", aside: "uniqueidentifier", tone: "info" };
    const props = { nodes: [row], edges: [], groups: [{ id: "Customers", label: "Customers", title: "dbo.Customers", variant: "record" as const }], layout: "columns" as const, ariaLabel: "Records", onNodeSelect: vi.fn() };
    const { container, rerender } = render(<GraphDiagram {...props} />);
    const card = container.querySelector('[data-graph-group="0:Customers"]');
    expect(card?.getAttribute("data-graph-group-variant")).toBe("record");
    expect(card?.querySelector('[data-graph-record-header]')?.textContent).toBe("Customers");
    expect(card?.querySelector('[data-graph-record-header]')?.getAttribute("title")).toBe("dbo.Customers");
    const button = screen.getByRole("button", { name: "ID uniqueidentifier" });
    expect(button.className).not.toMatch(/rounded|shadow|border-sky/);
    expect(button).toHaveClass("border-t", "bg-sky-500/10");
    fireEvent.keyDown(button, { key: "Enter" });
    expect(props.onNodeSelect).toHaveBeenCalledWith(row.id);
    rerender(<GraphDiagram {...props} selectedId={row.id} />);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("ring-inset", "bg-primary/10");
    expect(button.className).not.toContain("ring-offset");
  });
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

const callNodes: GraphDiagramNode[] = [
  { id: "run", label: "RunModules", level: 0, group: "query" },
  { id: "load", label: "Load", level: 1, group: "storage", expandCount: 3 },
  { id: "walk", label: "Walk", level: 1, group: "graph" },
];

const callEdges: GraphDiagramEdge[] = [
  { id: "run-load", from: "run", to: "load", label: "limit > 0", title: "ctx != nil ∧ limit > 0" },
  { id: "run-walk", from: "run", to: "walk" },
];

function columns(props: Partial<Parameters<typeof GraphDiagram>[0]> = {}) {
  return render(
    <GraphDiagram nodes={callNodes} edges={callEdges} layout="columns" ariaLabel="Call graph" {...props} />,
  );
}

describe("GraphDiagram columns layout", () => {
  it("draws a compact node on one line at the compact height, and a regular node at the node height", () => {
    const { container } = columns({
      nodes: [...callNodes, { id: "status", label: "STATUSCODE", level: 1, group: "AsPolicy", size: "compact" }],
      nodeHeight: 32,
      compactNodeHeight: 22,
    });
    const box = (id: string) => container.querySelector<HTMLElement>(`[data-graph-node="${id}"]`);

    expect([box("status")?.style.height, box("status")?.getAttribute("data-graph-node-size"), box("walk")?.style.height, box("walk")?.getAttribute("data-graph-node-size")])
      .toEqual(["22px", "compact", "32px", "regular"]);
  });

  it("renders every node and a caption per group, falling back to the group id", () => {
    columns({ groups: [{ id: "query", label: "uir/query" }] });

    expect(
      ["RunModules", "Load", "Walk", "uir/query", "storage", "graph"].map(
        (text) => screen.getByText(text).textContent,
      ),
    ).toEqual(["RunModules", "Load", "Walk", "uir/query", "storage", "graph"]);
  });

  it("shows a group's title as the tooltip of its caption", () => {
    const fullPath = "github.com/flanksource/uir/query";
    columns({ groups: [{ id: "query", label: "uir/query", title: fullPath }] });

    expect([screen.getByText("uir/query").getAttribute("title"), screen.getByText("storage").getAttribute("title")]).toEqual([
      fullPath,
      null,
    ]);
  });

  it("lets the pointer through the edge layer to the group captions, except on an edge's own stroke", () => {
    const { container } = columns({ onEdgeSelect: () => {} });
    const svg = container.querySelector("svg");

    expect([
      svg?.classList.contains("pointer-events-none"),
      svg?.querySelector("path[marker-end]")?.getAttribute("pointer-events"),
      svg?.querySelector("path[role=button]")?.getAttribute("pointer-events"),
    ]).toEqual([true, "visibleStroke", "stroke"]);
  });

  it("lets the pointer through a group box to the edges inside it, and keeps its caption's tooltip", () => {
    columns({ onEdgeSelect: () => {}, groups: [{ id: "query", label: "uir/query", title: "github.com/flanksource/uir/query" }] });
    const caption = screen.getByText("uir/query");
    const box = caption.closest("[data-graph-group]");

    expect([box?.classList.contains("pointer-events-none"), caption.classList.contains("pointer-events-auto")]).toEqual([true, true]);
  });

  it("sizes the stage to the layout and positions a node in the same pixel space", () => {
    const stageWidth = 148;
    const stageHeight = 88;
    const { container } = render(
      <GraphDiagram
        nodes={[{ id: "only", label: "Only", level: 0 }]}
        edges={[]}
        layout="columns"
        nodeWidth={100}
        nodeHeight={40}
        ariaLabel="Single column"
      />,
    );

    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");
    const node = container.querySelector<HTMLElement>('[data-graph-node="only"]');
    expect([stage?.style.width, stage?.style.height, node?.style.left, node?.style.top]).toEqual([
      `${stageWidth}px`,
      `${stageHeight}px`,
      `${stageWidth / 2}px`,
      `${stageHeight / 2}px`,
    ]);
  });

  it("throws, naming the node, when a columns node has no level", () => {
    const missingLevel: GraphDiagramNode[] = [{ id: "adrift", label: "Adrift" }];

    expect(() =>
      render(<GraphDiagram nodes={missingLevel} edges={[]} layout="columns" ariaLabel="Call graph" />),
    ).toThrow(/"adrift".*level/);
  });

  it("calls onNodeExpand, and not onNodeSelect, when the +N button is clicked", () => {
    const onNodeExpand = vi.fn();
    const onNodeSelect = vi.fn();
    columns({ onNodeExpand, onNodeSelect });

    fireEvent.click(screen.getByRole("button", { name: "Expand 3 more from Load" }));

    expect([onNodeExpand.mock.calls, onNodeSelect.mock.calls]).toEqual([[["load"]], []]);
  });

  it("shows the hidden count as plain text when no onNodeExpand is given", () => {
    columns();

    expect(screen.getByText("+3").closest("button")).toBeNull();
  });

  it("calls onEdgeSelect when an edge's hit path is clicked", () => {
    const onEdgeSelect = vi.fn();
    columns({ onEdgeSelect });

    fireEvent.click(screen.getByRole("button", { name: "RunModules to Load: limit > 0" }));

    expect(onEdgeSelect).toHaveBeenCalledWith("run-load");
  });

  it("calls onEdgeSelect when an edge's label pill is clicked", () => {
    const onEdgeSelect = vi.fn();
    columns({ onEdgeSelect });

    fireEvent.click(screen.getByText("limit > 0"));

    expect(onEdgeSelect).toHaveBeenCalledWith("run-load");
  });

  it.each(["Enter", " "])("calls onEdgeSelect when %j is pressed on a focused edge", (key) => {
    const onEdgeSelect = vi.fn();
    columns({ onEdgeSelect });

    fireEvent.keyDown(screen.getByRole("button", { name: "RunModules to Walk" }), { key });

    expect(onEdgeSelect).toHaveBeenCalledWith("run-walk");
  });

  it("marks only the selected edge as pressed", () => {
    columns({ onEdgeSelect: () => {}, selectedEdgeId: "run-walk" });

    expect(
      ["RunModules to Walk", "RunModules to Load: limit > 0"].map((name) =>
        screen.getByRole("button", { name }).getAttribute("aria-pressed"),
      ),
    ).toEqual(["true", "false"]);
  });

  it("exposes an edge's title as the tooltip of both its path and its label pill", () => {
    const fullGuards = "ctx != nil ∧ limit > 0";
    const { container } = columns();

    expect([
      container.querySelector("svg g > title")?.textContent,
      screen.getByText("limit > 0").getAttribute("title"),
    ]).toEqual([fullGuards, fullGuards]);
  });

  it("does not make edges keyboard targets when onEdgeSelect is omitted", () => {
    columns();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("gives two diagrams on one page distinct arrow marker ids that their own edges reference", () => {
    const { container } = render(
      <>
        <GraphDiagram nodes={callNodes} edges={callEdges} layout="columns" ariaLabel="First" />
        <GraphDiagram nodes={callNodes} edges={callEdges} layout="columns" ariaLabel="Second" />
      </>,
    );

    const svgs = Array.from(container.querySelectorAll("svg"));
    const markerIds = svgs.map((svg) => svg.querySelector("marker")?.id);
    const referenced = svgs.map((svg) => svg.querySelector("path[marker-end]")?.getAttribute("marker-end"));
    expect(new Set(markerIds).size).toBe(2);
    expect(referenced).toEqual(markerIds.map((id) => `url(#${id})`));
  });
});

describe("GraphDiagram zoomable", () => {
  it("offers no zoom controls unless zoomable", () => {
    columns();

    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
  });

  it("scales the stage when the zoom controls are used and resets it on fit", () => {
    const { container } = columns({ zoomable: true });
    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const zoomedIn = stage?.style.transform;
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    const zoomedOut = stage?.style.transform;
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));

    expect([zoomedIn, zoomedOut, stage?.style.transform]).toEqual([
      "translate(0px, 0px) scale(1.25)",
      "translate(0px, 0px) scale(0.8)",
      "translate(0px, 0px) scale(1)",
    ]);
  });

  function zoomableStage() {
    const { container } = columns({ zoomable: true });
    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");
    if (!stage?.parentElement) throw new Error("zoomable diagram rendered no stage");
    return { stage, viewport: stage.parentElement };
  }

  // jsdom ships no PointerEvent, so fireEvent.pointer* carries no coordinates.
  function pointer(type: "pointerdown" | "pointermove" | "pointerup", target: Element, at: { x: number; y: number }) {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: at.x, clientY: at.y });
    Object.defineProperty(event, "pointerId", { value: 1 });
    fireEvent(target, event);
  }

  it("pans by the drag distance once the pointer passes the click threshold, until it is released", () => {
    const { stage, viewport } = zoomableStage();

    pointer("pointerdown", viewport, { x: 100, y: 100 });
    pointer("pointermove", viewport, { x: 102, y: 100 });
    const withinThreshold = stage.style.transform;
    pointer("pointermove", viewport, { x: 130, y: 80 });
    pointer("pointerup", viewport, { x: 130, y: 80 });
    pointer("pointermove", viewport, { x: 300, y: 300 });

    expect([withinThreshold, stage.style.transform]).toEqual([
      "translate(0px, 0px) scale(1)",
      "translate(30px, -20px) scale(1)",
    ]);
  });

  it("fits content that overflows the stage, such as a label hanging off its right edge", () => {
    const { container } = render(
      <GraphDiagram
        nodes={[{ id: "only", label: "Only", level: 0 }]}
        edges={[]}
        layout="columns"
        nodeWidth={100}
        nodeHeight={40}
        zoomable
        ariaLabel="Single column"
      />,
    );
    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");
    if (!stage?.parentElement) throw new Error("zoomable diagram rendered no stage");
    // jsdom lays nothing out: an 88px-tall stage whose content reaches 792px wide (800 with the
    // 8px fitting margin), in a 400x300 viewport.
    Object.defineProperties(stage.parentElement, { clientWidth: { value: 400 }, clientHeight: { value: 300 } });
    Object.defineProperties(stage, { scrollWidth: { value: 792 }, scrollHeight: { value: 88 } });

    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));

    expect(stage.style.transform).toBe("translate(0px, 128px) scale(0.5)");
  });

  it("offers Reset view only with a minimum fit scale", () => {
    columns({ zoomable: true });

    expect(screen.queryByRole("button", { name: "Reset view" })).not.toBeInTheDocument();
  });

  it("resets to the minimum fit scale centred on the focus node, while Fit to view still shows everything", () => {
    // A 344x88 stage in a 172x300 viewport: fitting it takes 0.5. The leaf is centred at x=270.
    const { container } = render(
      <GraphDiagram
        nodes={[
          { id: "root", label: "Root", level: 0 },
          { id: "leaf", label: "Leaf", level: 1 },
        ]}
        edges={[]}
        layout="columns"
        nodeWidth={100}
        nodeHeight={40}
        zoomable
        fitMinScale={1}
        focusId="leaf"
        ariaLabel="Two columns"
      />,
    );
    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");
    if (!stage?.parentElement) throw new Error("zoomable diagram rendered no stage");
    Object.defineProperties(stage.parentElement, { clientWidth: { value: 172 }, clientHeight: { value: 300 } });

    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    const reset = stage.style.transform;
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));

    expect([reset, stage.style.transform]).toEqual([
      "translate(-172px, 106px) scale(1)",
      "translate(0px, 128px) scale(0.5)",
    ]);
  });

  it("zooms on ctrl + wheel up to the maximum scale and ignores an unmodified wheel", () => {
    const { stage, viewport } = zoomableStage();

    fireEvent.wheel(viewport, { deltaY: -1000 });
    const unmodified = stage.style.transform;
    fireEvent.wheel(viewport, { deltaY: -1000, ctrlKey: true });

    expect([unmodified, stage.style.transform]).toEqual([
      "translate(0px, 0px) scale(1)",
      "translate(0px, 0px) scale(4)",
    ]);
  });

  it("zooms on an unmodified wheel with wheelZoom zoom, one notch a button step", () => {
    const { container } = columns({ zoomable: true, wheelZoom: "zoom" });
    const stage = container.querySelector<HTMLElement>("[data-graph-stage]");
    if (!stage?.parentElement) throw new Error("zoomable diagram rendered no stage");

    fireEvent.wheel(stage.parentElement, { deltaY: -1000 });

    expect(stage.style.transform).toBe("translate(0px, 0px) scale(1.25)");
  });
});
