import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
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
