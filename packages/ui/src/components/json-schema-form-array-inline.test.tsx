import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// FieldWrapper's inline row is `col-span-2 grid grid-cols-subgrid`, which only
// means anything when its parent is the FieldsGrid that owns the label/value
// tracks. The default ArrayControl used to drop each item into a plain
// `min-w-0` div, so `subgrid` resolved to `none` and every array item collapsed
// into a stacked-looking column while the rest of the form stayed aligned.
const INLINE_TEMPLATE = "fit-content(40ch) minmax(0, 600px)";

function inlineForm(schema: JsonSchemaObject, value: Record<string, unknown>) {
  return render(
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={() => {}}
      layout={{ mode: "inline" }}
      showPreferencesMenu={false}
    />,
  );
}

// The row the renderer produced for one item, and the element it is parented to.
function subgridRowFor(labelText: string): { row: HTMLElement; parent: HTMLElement } {
  const row = screen.getByText(labelText).closest<HTMLElement>(".grid-cols-subgrid");
  if (!row) throw new Error(`no subgrid row around "${labelText}"`);
  const parent = row.parentElement;
  if (!parent) throw new Error(`subgrid row for "${labelText}" has no parent`);
  return { row, parent };
}

describe("array items in inline layout", () => {
  // The stacked opt-out is what still renders a row per item — the case where a
  // track-less subgrid would be visible.
  const stackedPorts: JsonSchemaObject = {
    type: "object",
    properties: {
      ports: {
        type: "array",
        title: "Ports",
        "x-array-display": "stacked",
        items: { type: "integer" },
      },
    },
  };

  it("gives a scalar item row the label/value tracks its subgrid inherits", () => {
    inlineForm(stackedPorts, { ports: [8080, 9090] });

    const { parent } = subgridRowFor("Item 1");
    expect(parent.style.gridTemplateColumns).toBe(INLINE_TEMPLATE);
  });

  it("aligns every item on the same tracks, not per-item grids", () => {
    inlineForm(stackedPorts, { ports: [8080, 9090] });

    const first = subgridRowFor("Item 1");
    const second = subgridRowFor("Item 2");
    // Each item keeps its own reorder/remove column, so the grids are siblings
    // rather than one shared node — but both must define the same tracks, which
    // is what makes the labels line up down the list.
    expect(first.parent.style.gridTemplateColumns).toBe(
      second.parent.style.gridTemplateColumns,
    );
    expect(first.parent.style.gridTemplateColumns).toBe(INLINE_TEMPLATE);
  });

  it("keeps an object item's section inside a grid so col-span-full applies", () => {
    // Object items render as an accordion unless asked otherwise, and the
    // accordion owns its own full-width row — the per-item section this covers
    // only exists on the stacked opt-out.
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        servers: {
          type: "array",
          title: "Servers",
          "x-array-display": "stacked",
          items: {
            type: "object",
            properties: { name: { type: "string", title: "Name" } },
          },
        },
      },
    };
    inlineForm(schema, { servers: [{ name: "api" }] });

    const section = screen.getByText("Item 1").closest<HTMLElement>(".col-span-full");
    if (!section) throw new Error("no col-span-full section around the item");
    expect(section.parentElement?.style.gridTemplateColumns).toBe(INLINE_TEMPLATE);
  });
});
