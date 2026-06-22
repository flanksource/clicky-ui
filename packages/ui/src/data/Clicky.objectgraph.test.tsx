import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Clicky, type ClickyDocument } from "./Clicky";

// The Clicky renderer routes the "object-graph" / "execution-tree" node kinds to
// the dedicated <ObjectGraph> / <ExecutionTree> inspectors (not the generic Tree),
// so a backend that emits those kinds (e.g. `arthas parse ... -o html-react`)
// gets the rich rendering the live web UI uses.
describe("Clicky object-graph / execution-tree kinds", () => {
  it("renders an object-graph node via <ObjectGraph>", () => {
    const doc: ClickyDocument = {
      version: 1,
      node: {
        kind: "object-graph",
        objects: [
          {
            id: "frame-1",
            label: "AtExit doMath",
            kind: "object",
            children: [
              { id: "frame-1.v", label: "result", type: "String", value: "OK", kind: "scalar" },
            ],
          },
        ],
      },
    };
    render(<Clicky data={doc} />);
    expect(screen.getByText("AtExit doMath")).toBeTruthy();
    // child renders (ObjectGraph opens depth < 2 by default), proving it is the
    // ObjectGraph inspector and not the JSON fallback <pre>.
    expect(screen.getByText("result")).toBeTruthy();
    expect(screen.getByText("@String")).toBeTruthy();
    expect(screen.getByText("OK")).toBeTruthy();
  });

  it("renders an execution-tree node via <ExecutionTree>", () => {
    const doc: ClickyDocument = {
      version: 1,
      node: {
        kind: "execution-tree",
        executionRoots: [
          {
            id: "0",
            label: "processActivitySequence",
            cost: 12.3,
            unit: "ms",
            className: "ActivitySequenceTaskBll",
          },
        ],
      },
    };
    render(<Clicky data={doc} />);
    expect(screen.getByText("processActivitySequence")).toBeTruthy();
  });
});
