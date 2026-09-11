import { describe, expect, it } from "vitest";
import { Clicky, type ClickyRowDetailRenderer } from "./clicky";

// A host wiring `renderRowDetail` (OperationCatalog -> Clicky) needs to name
// the callback's type without reaching past the public barrel into
// `data/Clicky` directly. It was added to ClickyProps/ClickyTableProps but
// missed from this barrel's re-export list — a gap the trace-results
// playground prototype hit while typing its own row-detail renderers. This
// guards the regression: it fails to type-check (`tsc -b`) if the export is
// dropped again.
describe("clicky.ts barrel", () => {
  it("exports ClickyRowDetailRenderer alongside Clicky/ClickyTable", () => {
    const renderRowDetail: ClickyRowDetailRenderer = (row) => String(row.name);
    expect(renderRowDetail({ name: "widget" })).toBe("widget");
    expect(typeof Clicky).toBe("function");
  });
});
