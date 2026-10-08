import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphDiagram, type GraphDiagramGroup, type GraphDiagramNode, type GraphDiagramProps } from "./GraphDiagram";

const ROW = 22;
const HEADER = 24;
const MEMBERS = Array.from({ length: 12 }, (_, index) => `c${index}`);

/** A root reading twelve AsPolicy columns, drawn as a record. */
function policyReads(props: Partial<GraphDiagramProps> = {}) {
  const nodes: GraphDiagramNode[] = [
    { id: "root", label: "Root", level: 0 },
    ...MEMBERS.map((id): GraphDiagramNode => ({ id, label: id.toUpperCase(), level: 1, group: "AsPolicy", size: "compact" })),
  ];
  const edges = MEMBERS.map((id) => ({ id: `root-${id}`, from: "root", to: id }));
  const groups: GraphDiagramGroup[] = [{ id: "AsPolicy", label: "AsPolicy", title: "AsPolicy", variant: "record" }];
  return render(
    <GraphDiagram nodes={nodes} edges={edges} groups={groups} layout="columns" zoomable wheelZoom="zoom" compactNodeHeight={ROW} recordHeaderHeight={HEADER} ariaLabel="Reads" {...props} />,
  );
}

const drawnMembers = (container: HTMLElement) => MEMBERS.filter((id) => container.querySelector(`[data-graph-node="${id}"]`));
const footer = (container: HTMLElement) => container.querySelector("[data-graph-window-footer]")?.textContent;
const stage = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-graph-stage]");

/** The y the edge's path ends at. */
function edgeEndY(container: HTMLElement, id: string): number {
  const d = container.querySelector(`[data-graph-edge="${id}"] path`)?.getAttribute("d") ?? "";
  return Number(d.trim().split(/\s+/).at(-1));
}

describe("GraphDiagram member windows", () => {
  it("draws ten of twelve members, says which rows show, and keeps every member's edge", () => {
    const { container } = policyReads();
    expect({ drawn: drawnMembers(container), footer: footer(container), edges: container.querySelectorAll("[data-graph-edge]").length })
      .toEqual({ drawn: MEMBERS.slice(0, 10), footer: expect.stringContaining("rows 1–10 of 12"), edges: 12 });
  });

  it("attaches a hidden member's edge to the window's bottom edge", () => {
    const { container } = policyReads();
    const box = container.querySelector<HTMLElement>("[data-graph-group]");
    expect(edgeEndY(container, "root-c11")).toBe(Number.parseFloat(box?.style.top ?? "") + HEADER + 10 * ROW);
  });

  it("scrolls the group a row per row of wheel travel over a member, without zooming", () => {
    const { container } = policyReads();
    const before = stage(container)?.style.transform;
    const member = container.querySelector("[data-graph-node='c4']");
    if (!member) throw new Error("c4 is not drawn");
    fireEvent.wheel(member, { deltaY: 2 * ROW });
    expect({ drawn: drawnMembers(container), footer: footer(container), transform: stage(container)?.style.transform })
      .toEqual({ drawn: MEMBERS.slice(2), footer: expect.stringContaining("rows 3–12 of 12"), transform: before });
  });

  it("still zooms on a wheel outside any windowed group", () => {
    const { container } = policyReads();
    const before = stage(container)?.style.transform;
    const root = container.querySelector("[data-graph-node='root']");
    if (!root) throw new Error("root is not drawn");
    fireEvent.wheel(root, { deltaY: -100 });
    expect(stage(container)?.style.transform).not.toBe(before);
  });

  it("pages the window from its footer buttons, stopping at either end", () => {
    const { container } = policyReads();
    fireEvent.click(screen.getByRole("button", { name: "Scroll AsPolicy down" }));
    const down = footer(container);
    fireEvent.click(screen.getByRole("button", { name: "Scroll AsPolicy up" }));
    expect([down, footer(container)]).toEqual([expect.stringContaining("rows 3–12 of 12"), expect.stringContaining("rows 1–10 of 12")]);
  });

  it("scrolls a selected member into view", () => {
    const { container, rerender } = policyReads();
    rerender(
      <GraphDiagram nodes={[{ id: "root", label: "Root", level: 0 }, ...MEMBERS.map((id): GraphDiagramNode => ({ id, label: id, level: 1, group: "AsPolicy", size: "compact" }))]}
        edges={MEMBERS.map((id) => ({ id: `root-${id}`, from: "root", to: id }))} groups={[{ id: "AsPolicy", label: "AsPolicy", variant: "record" }]}
        layout="columns" zoomable compactNodeHeight={ROW} recordHeaderHeight={HEADER} ariaLabel="Reads" selectedId="c11" />,
    );
    expect(drawnMembers(container)).toContain("c11");
  });
});

describe("GraphDiagram group collapse", () => {
  it("offers a chevron on a collapsible group's header that asks to collapse it", () => {
    const onGroupToggle = vi.fn();
    policyReads({ groups: [{ id: "AsPolicy", label: "AsPolicy", title: "AsPolicy", variant: "record", collapsed: false }], onGroupToggle });
    const chevron = screen.getByRole("button", { name: "Collapse AsPolicy" });
    fireEvent.click(chevron);
    expect({ expanded: chevron.getAttribute("aria-expanded"), calls: onGroupToggle.mock.calls }).toEqual({ expanded: "true", calls: [["AsPolicy"]] });
  });

  it("draws a collapsed group as its header with its count, its stand-in selectable from the header and not drawn as a node", () => {
    const onGroupToggle = vi.fn();
    const onNodeSelect = vi.fn();
    const { container } = render(
      <GraphDiagram layout="columns" ariaLabel="Reads" recordHeaderHeight={HEADER} onGroupToggle={onGroupToggle} onNodeSelect={onNodeSelect}
        nodes={[{ id: "root", label: "Root", level: 0 }, { id: "group:AsPolicy", label: "AsPolicy", level: 1, group: "AsPolicy", size: "compact" }]}
        edges={[{ id: "merged", from: "root", to: "group:AsPolicy", label: "12 columns" }]}
        groups={[{ id: "AsPolicy", label: "AsPolicy", title: "AsPolicy", variant: "record", collapsed: true, aside: "12 columns" }]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select AsPolicy" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand AsPolicy" }));
    const box = container.querySelector<HTMLElement>("[data-graph-group]");
    expect({
      height: box?.style.height,
      collapsed: box?.hasAttribute("data-graph-group-collapsed"),
      text: box?.textContent,
      standInDrawn: container.querySelector("[data-graph-node='group:AsPolicy']") !== null,
      selected: onNodeSelect.mock.calls,
      toggled: onGroupToggle.mock.calls,
    }).toEqual({ height: `${HEADER}px`, collapsed: true, text: "AsPolicy12 columns", standInDrawn: false, selected: [["group:AsPolicy"]], toggled: [["AsPolicy"]] });
  });

  it("draws a node's mark beside its label", () => {
    const { container } = render(
      <GraphDiagram layout="columns" ariaLabel="Marks" nodes={[{ id: "a", label: "A", level: 0, size: "compact", mark: <span data-testid="mark">RW</span> }]} edges={[]} />,
    );
    expect(container.querySelector("[data-graph-node='a'] [data-graph-node-mark]")?.textContent).toBe("RW");
  });
});
