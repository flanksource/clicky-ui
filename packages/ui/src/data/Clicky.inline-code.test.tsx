import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClickyTable } from "./Clicky";

// A "code" ClickyNode (a SQL/JSON/etc. statement) used to render through the
// same <CodeBlock> the row-detail dialog uses: bordered, headered, and
// wrapping onto as many lines as the source needs — several lines tall in a
// grid where every other row is one line. A table cell renders it inline:
// single line, truncated, monospace, with the full text in a title tooltip.
describe("ClickyTable code column cell", () => {
  const columns = [
    { name: "seq", label: "Seq" },
    { name: "statement", label: "Statement" },
  ];

  it("renders a code cell as a single truncated inline line, not a bordered block", () => {
    const sql =
      "SELECT activityGUID, statusCode\nFROM AsActivity\nWHERE policyGUID = @P0";
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              seq: { kind: "text", text: "1", plain: "1" },
              statement: { kind: "code", language: "sql", source: sql, plain: sql },
            },
          },
        ]}
      />,
    );

    const cell = screen.getByText("1").closest("tr")?.querySelector("td:nth-child(2)");
    expect(cell).not.toBeNull();

    // No bordered/headered block (CodeBlock's default chrome) in the cell.
    expect(cell!.querySelector(".rounded-md.border")).toBeNull();

    const code = cell!.querySelector("code");
    expect(code).not.toBeNull();
    expect(code).toHaveClass("truncate");
    // Whitespace collapsed to one line, and held in full as the hover title.
    expect(code!.getAttribute("title")).toBe(
      "SELECT activityGUID, statusCode FROM AsActivity WHERE policyGUID = @P0",
    );
  });
});
