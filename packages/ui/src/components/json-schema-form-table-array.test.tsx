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
});
