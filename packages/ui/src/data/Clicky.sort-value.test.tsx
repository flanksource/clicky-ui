import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClickyTable } from "./Clicky";

/**
 * A duration cell renders its own units, so its text does not order the way its
 * value does. The server sends the raw scalar alongside the text for exactly
 * this reason, and the sort has to read it.
 */
const rows = [
  {
    cells: {
      span: { kind: "text" as const, text: "1.5s", filterValue: 1500 },
      label: { kind: "text" as const, text: "slow" },
    },
  },
  {
    cells: {
      span: { kind: "text" as const, text: "900ms", filterValue: 900 },
      label: { kind: "text" as const, text: "quick" },
    },
  },
  {
    cells: {
      span: { kind: "text" as const, text: "10ms", filterValue: 10 },
      label: { kind: "text" as const, text: "fastest" },
    },
  },
];

function labelColumn(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1].textContent ?? "");
}

describe("ClickyTable client-side sort value", () => {
  it("orders a formatted numeric column by its value, not its text", () => {
    render(
      <ClickyTable
        columns={[
          { name: "span", label: "Span" },
          { name: "label", label: "Label" },
        ]}
        rows={rows}
        pagination={{ page: 0, pageSize: 25 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /span/i }));

    // Lexically "10ms" < "1.5s" < "900ms"; by value it is 10 < 900 < 1500.
    expect(labelColumn()).toEqual(["fastest", "quick", "slow"]);
  });

  it("falls back to the rendered text for a cell carrying no scalar", () => {
    render(
      <ClickyTable
        columns={[{ name: "span", label: "Span" }, { name: "label", label: "Label" }]}
        rows={[
          { cells: { span: { kind: "text" as const, text: "beta" }, label: { kind: "text" as const, text: "second" } } },
          { cells: { span: { kind: "text" as const, text: "alpha" }, label: { kind: "text" as const, text: "first" } } },
        ]}
        pagination={{ page: 0, pageSize: 25 }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /span/i }));
    expect(labelColumn()).toEqual(["first", "second"]);
  });
});
