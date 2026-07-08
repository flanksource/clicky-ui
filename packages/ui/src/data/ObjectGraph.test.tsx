import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ObjectGraph, type ObjectGraphNode } from "./ObjectGraph";

describe("ObjectGraph", () => {
  it("renders a node's label, type annotation, scalar value and nested children", () => {
    const roots: ObjectGraphNode[] = [
      {
        id: "r",
        label: "bean",
        type: "Foo",
        kind: "object",
        children: [{ id: "r.s", label: "status", type: "String", value: "RUNNING", kind: "scalar" }],
      },
    ];
    render(<ObjectGraph roots={roots} />);
    expect(screen.getByText("bean")).toBeTruthy();
    expect(screen.getByText("@Foo")).toBeTruthy();
    // child is open by default (depth < 2)
    expect(screen.getByText("status")).toBeTruthy();
    expect(screen.getByText("RUNNING")).toBeTruthy();
  });

  it("renders an opaque node's raw preview when it has no value or children", () => {
    render(<ObjectGraph roots={[{ id: "r", label: "proxy", raw: "Proxy@1a2b" }]} />);
    expect(screen.getByText("Proxy@1a2b")).toBeTruthy();
  });

  it("uses a custom renderLabel when provided", () => {
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean" }]}
        renderLabel={(n) => <span>custom:{n.label}</span>}
      />,
    );
    expect(screen.getByText("custom:bean")).toBeTruthy();
  });

  it("renders the label as a plain span (not a button) when onNodeSelect is omitted", () => {
    render(<ObjectGraph roots={[{ id: "r", label: "bean" }]} />);
    expect(screen.queryByRole("button", { name: "bean" })).toBeNull();
    expect(screen.getByText("bean")).toBeTruthy();
  });

  it("calls onNodeSelect with the clicked node without loading its lazy children", () => {
    const onNodeSelect = vi.fn();
    const loadChildren = vi.fn(async () => []);
    const child: ObjectGraphNode = { id: "r.cycle", label: "cycle", expandable: true };
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean", children: [child] }]}
        onNodeSelect={onNodeSelect}
        loadChildren={loadChildren}
      />,
    );
    // Click the child's label button — selecting must not toggle/expand it.
    fireEvent.click(screen.getByRole("button", { name: "cycle" }));
    expect(onNodeSelect).toHaveBeenCalledTimes(1);
    expect(onNodeSelect).toHaveBeenCalledWith(child);
    expect(loadChildren).not.toHaveBeenCalled();
  });

  it("highlights the label whose id matches selectedId", () => {
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean" }]}
        onNodeSelect={() => {}}
        selectedId="r"
      />,
    );
    expect(screen.getByRole("button", { name: "bean" }).className).toContain("bg-primary/15");
  });
});
