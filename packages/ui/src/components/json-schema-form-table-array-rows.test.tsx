import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { unmatchedFormErrors } from "./json-schema-form-errors";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// A multifield-shaped group: each row shows, hides and patches its own cells
// through the item schema's listeners, so the grid evaluates them per row.

const REVEAL = "loan";
const LOCK = "fixed";

const ITEMS: JsonSchemaProperty = {
  type: "object",
  properties: {
    Kind: {
      type: "string",
      title: "Benefit type",
      "x-on-change": [
        { when: { const: REVEAL }, show: ["LoanAmount"] },
        { when: { const: LOCK }, patch: { Rate: { readOnly: true } } },
      ],
    },
    LoanAmount: { type: "string", title: "Loan amount", "x-hidden": true },
    Rate: { type: "string", title: "Rate" },
    Internal: { type: "string", title: "Internal", "x-hidden": true },
  },
};

function schemaOf(items: JsonSchemaProperty = ITEMS): JsonSchemaObject {
  return { type: "object", properties: { Group: { type: "array", title: "Benefits", "x-layout": "table", items } } };
}

function Harness({ initial }: { initial: Record<string, unknown>[] }) {
  const [value, setValue] = useState<Record<string, unknown>>({ Group: initial });
  return <JsonSchemaForm schema={schemaOf()} value={value} onChange={setValue} showPreferencesMenu={false} />;
}

function headers(): string[] {
  return within(screen.getByRole("table"))
    .getAllByRole("columnheader")
    .map((header) => header.textContent ?? "")
    .filter(Boolean);
}

function row(index: number): HTMLElement {
  return within(screen.getByRole("table")).getAllByRole("row")[index + 1]!;
}

function cellOf(rowIndex: number, header: string): HTMLElement {
  const column = headers().indexOf(header);
  if (column < 0) throw new Error(`no "${header}" column in ${headers().join(", ")}`);
  return within(row(rowIndex)).getAllByRole("cell")[column]!;
}

describe("row-level errors of an object array with no display hint", () => {
  // A grid has no row header to carry an error at the item's own path, so it
  // is left for the form summary; the item list's row header shows it.
  const rowError = { instancePath: "/Group/0", message: "must have required property 'Rate'" };

  function unmatchedFor(columns: number) {
    const properties = Object.fromEntries(
      Array.from({ length: columns }, (_, i) => [`c${i + 1}`, { type: "string" } as JsonSchemaProperty]),
    );
    return unmatchedFormErrors({
      schema: { type: "object", properties: { Group: { type: "array", items: { type: "object", properties } } } },
      value: { Group: [{}] },
      errors: [rowError],
      viewOnly: false,
      hideReadOnlyFields: false,
      hideEmpty: false,
      pre: [],
    });
  }

  it("leaves it unmatched when the array opens as a grid", () => {
    expect(unmatchedFor(2)).toEqual([rowError]);
  });

  it("matches it when the array opens as the item list", () => {
    expect(unmatchedFor(7)).toEqual([]);
  });
});

describe("TableArray per-row listener state", () => {
  it("labels every column with its title", () => {
    render(<Harness initial={[{ Kind: "other" }]} />);
    expect(headers()).toEqual(["Benefit type", "Rate"]);
  });

  it("does not render a column hidden in every row", () => {
    render(<Harness initial={[{ Kind: "other" }, { Kind: LOCK }]} />);
    expect(headers()).not.toContain("Internal");
    expect(headers()).not.toContain("Loan amount");
  });

  it("renders a column one row reveals, with an empty placeholder in the rows that hide it", () => {
    render(<Harness initial={[{ Kind: "other" }, { Kind: REVEAL, LoanAmount: "900" }]} />);
    expect(headers()).toEqual(["Benefit type", "Loan amount", "Rate"]);
    expect(within(cellOf(0, "Loan amount")).queryByRole("textbox")).toBeNull();
    expect(cellOf(0, "Loan amount").querySelector("[data-jsf-cell-placeholder]")).not.toBeNull();
    expect(within(cellOf(1, "Loan amount")).getByRole("textbox")).toHaveValue("900");
  });

  it("reveals a column when a row's own edit shows it", () => {
    render(<Harness initial={[{ Kind: "other" }]} />);
    fireEvent.change(within(cellOf(0, "Benefit type")).getByRole("textbox"), { target: { value: REVEAL } });
    expect(headers()).toEqual(["Benefit type", "Loan amount", "Rate"]);
  });

  it("applies a row's readOnly patch to that row's cell only", () => {
    render(<Harness initial={[{ Kind: LOCK, Rate: "4" }, { Kind: "other", Rate: "5" }]} />);
    expect(within(cellOf(0, "Rate")).queryByRole("textbox")).toBeNull();
    expect(cellOf(0, "Rate")).toHaveTextContent("4");
    expect(within(cellOf(1, "Rate")).getByRole("textbox")).toHaveValue("5");
  });

  it("commits a cell edit through the row's value listeners", () => {
    const items: JsonSchemaProperty = {
      type: "object",
      properties: {
        Kind: { type: "string", title: "Kind", "x-on-change": [{ when: { const: LOCK }, set: { Rate: "0" } }] },
        Rate: { type: "string", title: "Rate" },
      },
    };
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schemaOf(items)}
        value={{ Group: [{ Kind: "", Rate: "5" }, { Kind: "", Rate: "6" }] }}
        onChange={onChange}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.change(within(cellOf(1, "Kind")).getByRole("textbox"), { target: { value: LOCK } });
    expect(onChange).toHaveBeenLastCalledWith({ Group: [{ Kind: "", Rate: "5" }, { Kind: LOCK, Rate: "0" }] });
  });
});
