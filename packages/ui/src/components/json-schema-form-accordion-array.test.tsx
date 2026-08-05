import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  JsonSchemaObject,
  JsonSchemaProperty,
  PreExtension,
} from "./json-schema-form-types";

const PARAM_ITEM: JsonSchemaProperty = {
  type: "object",
  title: "Parameter",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name" },
    label: { type: "string", title: "Label" },
    field: { type: "string", title: "Field" },
    required: { type: "boolean", title: "Required" },
    type: {
      type: "string",
      title: "Type",
      enum: ["string", "list"],
      "x-enum-labels": { list: "List (multi-select)" },
      "x-enum-tones": { string: "slate", list: "indigo" },
      "x-enum-display": "combobox",
    },
    role: {
      type: "string",
      title: "Role",
      enum: ["filter", "limit"],
      "x-enum-labels": { filter: "filters" },
      "x-enum-display": "combobox",
    },
  },
};

const X_ITEM = {
  title: ["label", "name"],
  summary: [{ property: "name", pattern: "{{.params.{}}}" }, { property: "field" }],
  glyph: "type",
  badge: "role",
  flag: "required",
  noun: "parameter",
  nounPlural: "parameters",
  empty: "A parameter turns a fixed query into a reusable one.",
};

const SAMPLE = [
  {
    name: "service",
    label: "Service",
    field: "process.serviceName",
    type: "list",
    role: "filter",
    required: true,
  },
  { name: "since", label: "Since", type: "string" },
];

function schemaWith(extras: Partial<JsonSchemaProperty> = {}): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      params: {
        type: "array",
        title: "Params",
        items: PARAM_ITEM,
        "x-array-display": "accordion",
        "x-item": X_ITEM,
        ...extras,
      } as JsonSchemaProperty,
    },
  };
}

// A stateful host, because expansion state is keyed by index: proving that an
// open row follows its item through a move requires the list to actually
// reorder, which a stateless render can never show.
function Harness({
  initial,
  onChange,
  readOnly,
  extras,
  pre,
}: {
  initial: unknown[];
  onChange: (next: Record<string, unknown>) => void;
  readOnly: boolean;
  extras: Partial<JsonSchemaProperty>;
  pre?: PreExtension[];
}) {
  const [value, setValue] = useState<Record<string, unknown>>({ params: initial });
  return (
    <JsonSchemaForm
      schema={schemaWith(extras)}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      readOnly={readOnly}
      showPreferencesMenu={false}
      {...(pre ? { pre } : {})}
    />
  );
}

function renderAccordion({
  value = SAMPLE,
  readOnly = false,
  extras = {},
  pre,
}: {
  value?: unknown[];
  readOnly?: boolean;
  extras?: Partial<JsonSchemaProperty>;
  pre?: PreExtension[];
} = {}) {
  const onChange = vi.fn();
  render(
    <Harness
      initial={value}
      onChange={onChange}
      readOnly={readOnly}
      extras={extras}
      {...(pre ? { pre } : {})}
    />,
  );
  return { onChange };
}

function headers(): HTMLElement[] {
  return screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
}

function headerFor(title: string): HTMLElement {
  const found = headers().find((h) => h.textContent?.includes(title));
  if (!found) throw new Error(`no accordion header titled "${title}"`);
  return found;
}

function paramsFrom(onChange: ReturnType<typeof vi.fn>): unknown[] {
  const last = onChange.mock.calls.at(-1)?.[0] as Record<string, unknown>;
  return last.params as unknown[];
}

describe("JsonSchemaForm accordion array", () => {
  it("collapses each item to one row and hides its fields", () => {
    renderAccordion();
    expect(headers()).toHaveLength(2);
    for (const header of headers()) expect(header).toHaveAttribute("aria-expanded", "false");
    // The whole point: ten properties per item are not on screen at rest.
    expect(screen.queryByRole("textbox", { name: /^Name/ })).toBeNull();
  });

  it("identifies the row by the schema's chosen properties", () => {
    renderAccordion();
    const row = headerFor("Service");
    expect(within(row).getByText("Service")).toBeInTheDocument();
    expect(within(row).getByText("{{.params.service}} · process.serviceName")).toBeInTheDocument();
    expect(within(row).getByText("filters")).toBeInTheDocument();
    expect(within(row).getByTitle("Required")).toBeInTheDocument();
    expect(within(row).getByTitle("List (multi-select)")).toBeInTheDocument();
  });

  it("counts the items in the schema's own words", () => {
    renderAccordion();
    expect(screen.getByText("2 parameters")).toBeInTheDocument();
  });

  it("expands one item at a time", () => {
    renderAccordion();
    fireEvent.click(headerFor("Service"));
    expect(headerFor("Service")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: /^Name/ })).toBeInTheDocument();

    fireEvent.click(headerFor("Since"));
    expect(headerFor("Since")).toHaveAttribute("aria-expanded", "true");
    expect(headerFor("Service")).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses again when its own header is clicked", () => {
    renderAccordion();
    fireEvent.click(headerFor("Service"));
    fireEvent.click(headerFor("Service"));
    expect(headerFor("Service")).toHaveAttribute("aria-expanded", "false");
  });

  it("pairs each header with its panel for assistive tech", () => {
    renderAccordion();
    fireEvent.click(headerFor("Service"));
    const header = headerFor("Service");
    const panel = document.getElementById(header.getAttribute("aria-controls") ?? "");
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("aria-labelledby", header.id);
  });

  it("never nests the row actions inside the disclosure button", () => {
    // Interactive content inside a <button> is invalid DOM with undefined click
    // targeting — every action would also toggle the row.
    renderAccordion();
    expect(within(headerFor("Service")).queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Remove Service" })).toBeInTheDocument();
  });

  it("removes the item the action names", () => {
    const { onChange } = renderAccordion();
    fireEvent.click(screen.getByRole("button", { name: "Remove Service" }));
    expect(paramsFrom(onChange)).toEqual([SAMPLE[1]]);
  });

  it("reorders without disturbing the other items", () => {
    const { onChange } = renderAccordion();
    fireEvent.click(screen.getByRole("button", { name: "Move Service down" }));
    expect(paramsFrom(onChange)).toEqual([SAMPLE[1], SAMPLE[0]]);
  });

  it("disables the moves that would run off the ends", () => {
    renderAccordion();
    expect(screen.getByRole("button", { name: "Move Service up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Since down" })).toBeDisabled();
  });

  it("duplicates an item as a copy, not a shared reference", () => {
    const { onChange } = renderAccordion();
    fireEvent.click(screen.getByRole("button", { name: "Duplicate Service" }));
    const next = paramsFrom(onChange);
    expect(next).toHaveLength(3);
    expect(next[1]).toEqual(next[0]);
    expect(next[1]).not.toBe(next[0]);
  });

  it("keeps the open row open when it moves", () => {
    // The index is the key, so a mutator that forgets to follow the item would
    // silently expand whichever row took its place.
    renderAccordion();
    fireEvent.click(headerFor("Since"));
    fireEvent.click(screen.getByRole("button", { name: "Move Since up" }));
    expect(headerFor("Since")).toHaveAttribute("aria-expanded", "true");
    expect(headerFor("Service")).toHaveAttribute("aria-expanded", "false");
  });

  it("adds an item through the schema's noun", () => {
    const { onChange } = renderAccordion();
    fireEvent.click(screen.getByRole("button", { name: /Add parameter/ }));
    expect(paramsFrom(onChange)).toHaveLength(3);
  });

  it("makes the add row the empty state at zero items", () => {
    renderAccordion({ value: [] });
    expect(headers()).toHaveLength(0);
    expect(screen.getByText("No parameters yet")).toBeInTheDocument();
    const add = screen.getByRole("button", { name: /Add parameter/ });
    expect(add).toHaveTextContent("A parameter turns a fixed query into a reusable one.");
  });

  it("still identifies rows from conventional keys without an x-item", () => {
    renderAccordion({ extras: { "x-item": undefined } as Partial<JsonSchemaProperty> });
    // `name` is tried before `label` in the default candidate list.
    expect(headerFor("service")).toBeInTheDocument();
    // The add-row noun falls back to the item schema's own title.
    expect(screen.getByRole("button", { name: /Add Parameter/ })).toBeInTheDocument();
  });

  it("falls back to Item N when nothing in the item identifies it", () => {
    renderAccordion({
      value: [{ role: "filter" }],
      extras: { "x-item": undefined } as Partial<JsonSchemaProperty>,
    });
    expect(headerFor("Item 1")).toBeInTheDocument();
  });

  it("offers no editing affordances when read-only", () => {
    renderAccordion({ readOnly: true });
    expect(screen.queryByRole("button", { name: /Add parameter/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove Service" })).toBeNull();
    // Reading a read-only form must not be gated — rows still open.
    fireEvent.click(headerFor("Service"));
    expect(headerFor("Service")).toHaveAttribute("aria-expanded", "true");
  });

  it("lets a pre-extension replace the derived summary outright", () => {
    const pre: PreExtension = (field) =>
      field.arrayDisplay === "accordion"
        ? { ...field, itemSummary: ({ index }) => ({ title: `Row ${index}` }) }
        : field;
    renderAccordion({ pre: [pre] });
    expect(headerFor("Row 0")).toBeInTheDocument();
    expect(headerFor("Row 1")).toBeInTheDocument();
  });

  it("puts help behind a ? inside the expanded body, not under every control", () => {
    // The array resolves to hover; without pushing that into the child context
    // the fields inside a row keep the form default and stack a paragraph under
    // each control — the exact height the summary rows exist to reclaim.
    const withHelp: Partial<JsonSchemaProperty> = {
      items: {
        ...PARAM_ITEM,
        properties: {
          ...PARAM_ITEM.properties,
          name: { type: "string", title: "Name", description: "The parameter key." },
        },
      },
    };
    renderAccordion({ extras: withHelp });
    fireEvent.click(headerFor("Service"));
    expect(screen.queryByText("The parameter key.")).toBeNull();
    expect(screen.getByRole("button", { name: "About Name" })).toBeInTheDocument();
  });

  it("lets the array opt its subtree back into inline help", () => {
    const inlineHelp: Partial<JsonSchemaProperty> = {
      "x-help-display": "inline",
      items: {
        ...PARAM_ITEM,
        properties: {
          ...PARAM_ITEM.properties,
          name: { type: "string", title: "Name", description: "The parameter key." },
        },
      },
    };
    renderAccordion({ extras: inlineHelp });
    fireEvent.click(headerFor("Service"));
    expect(screen.getByText("The parameter key.")).toBeInTheDocument();
  });

  it("gives the list the full width, with the array title as a section header", () => {
    renderAccordion();
    // Not a FieldWrapper label crammed into the 600px value column.
    const title = screen.getByText("Params");
    expect(title.closest("label")).toBeNull();
  });
});
