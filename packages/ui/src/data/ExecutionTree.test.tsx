import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutionTree, type ExecutionNode } from "./ExecutionTree";

describe("ExecutionTree", () => {
  it("renders label, formatted ms cost, invocation count, class:line and detail chips", () => {
    const roots: ExecutionNode[] = [
      {
        id: "0",
        label: "doMath",
        cost: 12.3,
        unit: "ms",
        times: 3,
        status: "error",
        className: "com.Foo",
        lineNumber: 42,
        detail: { throwExp: "Boom" },
      },
    ];
    render(<ExecutionTree roots={roots} />);
    expect(screen.getByText("doMath")).toBeTruthy();
    expect(screen.getByText("12.300ms")).toBeTruthy();
    expect(screen.getByText("×3")).toBeTruthy();
    expect(screen.getByText("com.Foo:42")).toBeTruthy();
    expect(screen.getByText("throwExp=Boom")).toBeTruthy();
  });

  it("renders nested children open at the default depth and non-ms units verbatim", () => {
    const roots: ExecutionNode[] = [
      {
        id: "0",
        label: "outer",
        cost: 5,
        unit: "count",
        children: [{ id: "0.0", label: "inner", cost: 1 }],
      },
    ];
    render(<ExecutionTree roots={roots} defaultOpenDepth={2} />);
    expect(screen.getByText("5 count")).toBeTruthy();
    expect(screen.getByText("inner")).toBeTruthy();
  });

  it("uses a custom renderRow when provided", () => {
    render(
      <ExecutionTree
        roots={[{ id: "0", label: "m" }]}
        renderRow={(n) => <span>row:{n.label}</span>}
      />,
    );
    expect(screen.getByText("row:m")).toBeTruthy();
  });
});
