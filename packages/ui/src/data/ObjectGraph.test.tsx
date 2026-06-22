import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
