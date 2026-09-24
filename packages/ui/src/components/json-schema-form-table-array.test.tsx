import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { unmatchedFormErrors } from "./json-schema-form-errors";
import type { JsonSchemaObject } from "./json-schema-form-types";

function tableHeaders(): string[] {
  return within(screen.getByRole("table"))
    .getAllByRole("columnheader")
    .map((header) => header.textContent ?? "")
    .filter(Boolean);
}

describe("JsonSchemaForm table arrays", () => {
  it("honors the item schema x-order", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            "x-order": ["port", "name"],
            properties: {
              name: { type: "string", title: "Name" },
              port: { type: "integer", title: "Port" },
            },
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{ name: "api", port: 8080 }] }}
        onChange={vi.fn()}
      />,
    );
    expect(tableHeaders()).toEqual(["Port", "Name"]);
  });

  it("honors per-property x-clicky-order", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Name", "x-clicky-order": 1 },
              type: { type: "string", title: "Type", "x-clicky-order": 2 },
              label: { type: "string", title: "Label", "x-clicky-order": 0 },
            },
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{}] }}
        onChange={vi.fn()}
      />,
    );
    expect(tableHeaders()).toEqual(["Label", "Name", "Type"]);
  });

  it("lets the item schema x-order override x-clicky-order for the keys it lists", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            "x-order": ["port", "name"],
            properties: {
              name: { type: "string", title: "Name", "x-clicky-order": 1 },
              port: { type: "integer", title: "Port", "x-clicky-order": 2 },
              label: { type: "string", title: "Label", "x-clicky-order": 0 },
            },
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{}] }}
        onChange={vi.fn()}
      />,
    );
    // x-order fixes Port before Name; Label, which x-order omits, keeps its
    // x-clicky-order position among the leftovers.
    expect(tableHeaders()).toEqual(["Port", "Name", "Label"]);
  });

  it("drops an x-hidden column, header and cells alike", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Name" },
              secret: { type: "string", title: "Secret", "x-hidden": true },
            },
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{ name: "api", secret: "s3" }] }}
        onChange={vi.fn()}
      />,
    );
    expect(tableHeaders()).toEqual(["Name"]);
    expect(within(screen.getByRole("table")).getAllByRole("cell")).toHaveLength(2);
    expect(screen.queryByDisplayValue("s3")).toBeNull();
  });

  it("renders a column an items allOf member contributes, with that member's schema", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            properties: { name: { type: "string", title: "Name" } },
            allOf: [
              { properties: { port: { type: "integer", title: "Port" } } },
              { properties: { name: { type: "string", title: "Host name" } } },
            ],
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{ name: "api", port: 8080 }] }}
        onChange={vi.fn()}
      />,
    );
    expect(tableHeaders()).toEqual(["Host name", "Port"]);
    expect(screen.getByDisplayValue("8080")).toBeInTheDocument();
  });

  describe("items made only of allOf members", () => {
    const allOfRows: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            allOf: [
              { properties: { host: { type: "string", title: "Host" } } },
              { properties: { port: { type: "integer", title: "Port" } } },
            ],
          },
        },
      },
    };
    const portError = { instancePath: "/rows/0/port", message: "out of range" };

    it("renders as a table", () => {
      render(<JsonSchemaForm schema={allOfRows} value={{ rows: [{ host: "api", port: 99999 }] }} onChange={vi.fn()} />);
      expect(tableHeaders()).toEqual(["Host", "Port"]);
    });

    it("reports a cell's error on that cell, not in the form summary", () => {
      render(
        <JsonSchemaForm
          schema={allOfRows}
          value={{ rows: [{ host: "api", port: 99999 }] }}
          errors={[portError]}
          onChange={vi.fn()}
        />,
      );
      const table = screen.getByRole("table");
      expect(within(table).getByDisplayValue("99999")).toHaveAttribute("aria-invalid", "true");
      expect(within(table).getByDisplayValue("api")).not.toHaveAttribute("aria-invalid", "true");
      expect(
        unmatchedFormErrors({
          schema: allOfRows,
          value: { rows: [{ host: "api", port: 99999 }] },
          errors: [portError],
          viewOnly: false,
          hideReadOnlyFields: false,
          hideEmpty: false,
          pre: [],
        }),
      ).toEqual([]);
    });
  });

  it("shows merged description and x-help from a focusable header", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        rows: {
          type: "array",
          "x-layout": "table",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                title: "Type",
                description: "Controls the value shape.",
                "x-help": { body: "It is independent from Role." },
              },
            },
          },
        },
      },
    };

    render(
      <JsonSchemaForm
        schema={schema}
        value={{ rows: [{}] }}
        onChange={vi.fn()}
      />,
    );
    fireEvent.focus(screen.getByRole("button", { name: "Type help" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Controls the value shape. It is independent from Role.",
    );
  });

  // An array whose length its producer owns — a proposed journal's two lines,
  // say — needs its cells editable and its length fixed. readOnly would give
  // the second by taking the first, so the bounds do it instead.
  describe("minItems/maxItems", () => {
    const boundedSchema = (
      bounds: { minItems?: number; maxItems?: number },
    ): JsonSchemaObject => ({
      type: "object",
      properties: {
        lines: {
          type: "array",
          "x-layout": "table",
          ...bounds,
          items: {
            type: "object",
            properties: { account: { type: "string", title: "Account" } },
          },
        },
      },
    });

    const twoLines = { lines: [{ account: "a" }, { account: "b" }] };

    it("offers neither add nor remove on an array pinned to its length", () => {
      render(
        <JsonSchemaForm
          schema={boundedSchema({ minItems: 2, maxItems: 2 })}
          value={twoLines}
          onChange={vi.fn()}
        />,
      );

      expect(screen.queryByRole("button", { name: "Add item" })).toBeNull();
      expect(screen.queryByRole("button", { name: /Remove item/ })).toBeNull();
      // The point of pinning the length rather than marking it read-only.
      expect(screen.getAllByRole("textbox")).toHaveLength(2);
    });

    it("keeps remove while the array is above minItems", () => {
      render(
        <JsonSchemaForm
          schema={boundedSchema({ minItems: 1 })}
          value={twoLines}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getAllByRole("button", { name: /Remove item/ })).toHaveLength(2);
      expect(screen.getByRole("button", { name: "Add item" })).toBeVisible();
    });

    it("leaves an unbounded array alone", () => {
      render(
        <JsonSchemaForm schema={boundedSchema({})} value={twoLines} onChange={vi.fn()} />,
      );

      expect(screen.getByRole("button", { name: "Add item" })).toBeVisible();
      expect(screen.getAllByRole("button", { name: /Remove item/ })).toHaveLength(2);
    });

    // A value that arrives shorter than minItems must not be a dead end: the
    // bounds gate the controls, they do not validate what is already there.
    it("still offers add to an array below minItems", () => {
      render(
        <JsonSchemaForm
          schema={boundedSchema({ minItems: 3, maxItems: 3 })}
          value={twoLines}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getByRole("button", { name: "Add item" })).toBeVisible();
      expect(screen.queryByRole("button", { name: /Remove item/ })).toBeNull();
    });
  });
});

// Every way a table cell becomes read-only — the whole array, one column (on
// the item schema or patched through a listener path), or the whole form —
// renders the same cell: the value as text, as a readOnly field does anywhere.
describe("JsonSchemaForm read-only table cells", () => {
  const RATE = 4.5;
  const TERM = 12;
  const rows = { mf: { G: [{ Term: TERM, Rate: RATE }] } };

  function ratesSchema({
    table = {},
    rate = {},
  }: {
    table?: Partial<JsonSchemaObject>;
    rate?: Partial<JsonSchemaObject>;
  } = {}): JsonSchemaObject {
    return {
      type: "object",
      properties: {
        mf: {
          type: "object",
          properties: {
            G: {
              type: "array",
              "x-layout": "table",
              ...table,
              items: {
                type: "object",
                properties: {
                  Term: { type: "integer", title: "Term" },
                  Rate: { type: "number", title: "Rate", ...rate },
                },
              },
            },
          },
        },
      },
    };
  }

  function renderRates(schema: JsonSchemaObject, props: { readOnly?: boolean; hideReadOnlyFields?: boolean } = {}) {
    return render(<JsonSchemaForm schema={schema} value={rows} onChange={vi.fn()} showPreferencesMenu={false} {...props} />);
  }

  // cellHtml is the DOM of one column's first-row cell, which must match
  // byte-for-byte across the read-only sources (the id is the instance path,
  // so it matches too).
  function cellHtml(column: "Term" | "Rate"): string {
    const table = screen.getByRole("table");
    const index = within(table).getAllByRole("columnheader").findIndex((th) => th.textContent === column);
    const cell = within(table).getAllByRole("cell")[index];
    if (!cell) throw new Error(`no ${column} cell`);
    return cell.innerHTML;
  }

  function readOnlyCell(column: "Term" | "Rate"): HTMLElement {
    const table = screen.getByRole("table");
    const index = within(table).getAllByRole("columnheader").findIndex((th) => th.textContent === column);
    const span = within(table).getAllByRole("cell")[index]?.querySelector<HTMLElement>("[data-jsf-readonly]");
    if (!span) throw new Error(`${column} cell is not a read-only value`);
    return span;
  }

  const listenerPatch = ratesSchema();
  listenerPatch.properties!.lock = {
    type: "string",
    "x-on-change": [{ patch: { "mf/G/Rate": { readOnly: true } } }],
  };

  it("renders a whole read-only array's cells as values, with no add or remove", () => {
    renderRates(ratesSchema({ table: { readOnly: true } }));
    expect(screen.queryByRole("button", { name: "Add item" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove item/ })).toBeNull();
    expect(within(screen.getByRole("table")).queryAllByRole("textbox")).toHaveLength(0);
    expect([readOnlyCell("Term").textContent, readOnlyCell("Rate").textContent]).toEqual([String(TERM), String(RATE)]);
  });

  it.each<[string, JsonSchemaObject, { readOnly?: boolean }]>([
    ["a column readOnly on the item schema", ratesSchema({ rate: { readOnly: true } }), {}],
    ["a column patched readOnly through a listener path", listenerPatch, {}],
    ["a read-only form", ratesSchema(), { readOnly: true }],
  ])("renders %s exactly like a whole read-only array", (_name, schema, props) => {
    const whole = renderRates(ratesSchema({ table: { readOnly: true } }));
    const expected = cellHtml("Rate");
    whole.unmount();

    renderRates(schema, props);
    expect(readOnlyCell("Rate").textContent).toBe(String(RATE));
    expect(cellHtml("Rate")).toBe(expected);
  });

  it("leaves the other columns editable when only one column is read-only", () => {
    renderRates(ratesSchema({ rate: { readOnly: true } }));
    const term = screen.getByDisplayValue(String(TERM));
    expect(term.tagName).toBe("INPUT");
    expect(term).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Add item" })).toBeVisible();
  });

  it("keeps editable cells as enabled inputs", () => {
    renderRates(ratesSchema());
    expect(screen.getByDisplayValue(String(RATE))).not.toBeDisabled();
    expect(screen.queryByText(String(RATE))).toBeNull();
  });

  it("keeps an x-disabled table's cells as disabled inputs, since disabled is not read-only", () => {
    renderRates(ratesSchema({ table: { "x-disabled": true } }));
    expect(screen.getByDisplayValue(String(RATE))).toBeDisabled();
    expect(screen.getByRole("table").querySelector("[data-jsf-readonly]")).toBeNull();
  });

  it("drops a readOnly column, header and cells, under hideReadOnlyFields, but keeps a read-only form's other columns", () => {
    renderRates(ratesSchema({ rate: { readOnly: true } }), { readOnly: true, hideReadOnlyFields: true });
    expect(tableHeaders()).toEqual(["Term"]);
    expect(readOnlyCell("Term").textContent).toBe(String(TERM));
  });

  it("drops a writeOnly column from a read-only table, header and cells", () => {
    renderRates(ratesSchema({ table: { readOnly: true }, rate: { writeOnly: true } }));
    expect(tableHeaders()).toEqual(["Term"]);
    expect(screen.queryByText(String(RATE))).toBeNull();
  });
});
