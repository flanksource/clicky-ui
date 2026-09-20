import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickyTable } from "./Clicky";

// A table cell carries its value either as `filterValue` (number/date columns,
// whose text is the formatted display) or as its text (string columns). A cell
// with neither holds no value at all — the server drops a nil filterValue — so
// what a host reads back for it has to depend on the column's declared type.
const rawValues = () => {
  const seen = vi.fn();
  render(
    <ClickyTable
      columns={[
        { name: "detail", label: "Detail", type: "string" },
        { name: "cycle", label: "Cycle", type: "string" },
        { name: "durationMs", label: "Duration", type: "number", unit: "ms" },
        { name: "endedAt", label: "Ended", type: "datetime" },
        { name: "wait", label: "Wait", type: "duration" },
        { name: "runtime", label: "Runtime", type: "number" },
      ]}
      rows={[
        {
          cells: {
            detail: { kind: "text", text: "B3E73BE6" },
            // The unattributed run's cycle: "" is its value, not its absence.
            cycle: { kind: "text" },
            durationMs: { kind: "text" },
            endedAt: { kind: "text" },
            wait: { kind: "text" },
            // A number column whose cell was built as display text only.
            runtime: { kind: "text", text: "4.3 s" },
            // A cell for a column the server did not declare.
            gridMember: { kind: "text", text: "cycle-0" },
          },
        },
      ]}
      cellRenderers={{ detail: (_value, row) => <span>{seen(row) ?? "detail"}</span> }}
    />,
  );
  return seen.mock.calls[0]![0] as Record<string, unknown>;
};

describe("ClickyTable raw cell values", () => {
  it("reads a valueless cell in a number, datetime or duration column as null", () => {
    const row = rawValues();
    expect([row.durationMs, row.endedAt, row.wait]).toEqual([null, null, null]);
  });

  it("keeps an empty string column's value, which is a value and not an absence", () => {
    expect(rawValues().cycle).toEqual("");
  });

  it("keeps the text of a typed cell that carries display text but no value", () => {
    expect(rawValues().runtime).toEqual("4.3 s");
  });

  it("keeps the text reading of a cell whose column the server never declared", () => {
    expect(rawValues().gridMember).toEqual("cycle-0");
  });
});
