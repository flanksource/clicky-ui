import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// One card per parameter, headed by what the parameter is rather than "Item 3".
// `x-item` is the only place the schema says how to summarize an item, so these
// tests drive the cards display entirely through it.
const PARAM_ITEM = {
  type: "object" as const,
  properties: {
    name: { type: "string" as const, title: "Name" },
    kind: {
      type: "string" as const,
      title: "Kind",
      enum: ["string", "number", "list"],
      "x-enum-tones": { string: "slate", number: "violet", list: "indigo" },
    },
    required: { type: "boolean" as const, title: "Required" },
    field: { type: "string" as const, title: "Field" },
  },
  required: ["name"],
};

const CARDS_SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    params: {
      type: "array",
      title: "Parameters",
      "x-array-display": "cards",
      "x-item": {
        title: ["name"],
        fallback: "Untitled parameter",
        summary: [{ property: "field" }],
        glyph: "kind",
        flag: "required",
        noun: "parameter",
        nounPlural: "parameters",
      },
      items: PARAM_ITEM,
    },
  },
};

const SAMPLE = [
  { name: "namespace", kind: "string", required: true, field: "metadata.namespace" },
  { name: "limit", kind: "number", required: false, field: "spec.limit" },
];

function ControlledForm({ initial }: { initial: Record<string, unknown> }) {
  const [value, setValue] = useState(initial);
  return (
    <JsonSchemaForm
      schema={CARDS_SCHEMA}
      value={value}
      onChange={setValue}
      showPreferencesMenu={false}
    />
  );
}

function cards(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>("article")];
}

describe("x-array-display: cards", () => {
  it("renders one card per item, titled from x-item rather than Item N", () => {
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    expect(cards()).toHaveLength(2);
    expect(screen.getByText("namespace")).toBeInTheDocument();
    expect(screen.getByText("limit")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("falls back to the declared fallback title when the title property is empty", () => {
    render(<ControlledForm initial={{ params: [{ kind: "string" }] }} />);
    expect(screen.getByText("Untitled parameter")).toBeInTheDocument();
  });

  it("carries the item's tone on the card's left edge", () => {
    // The hue is what makes a long stack scannable before it is read; it comes
    // from x-enum-tones via the x-item glyph property, not from the display.
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    const [first, second] = cards();
    expect(first?.className).toContain("border-l-slate-400");
    expect(second?.className).toContain("border-l-violet-400");
  });

  it("shows the summary line and the required flag from x-item", () => {
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    const first = cards()[0]!;
    expect(within(first).getByText("metadata.namespace")).toBeInTheDocument();
    expect(within(first).getByTitle("Required")).toBeInTheDocument();
    expect(within(cards()[1]!).queryByTitle("Required")).not.toBeInTheDocument();
  });

  it("keeps every item's fields open and editable", () => {
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    // Both cards are expanded at once — that is the difference from the
    // accordion, which opens one row at a time.
    expect(screen.getAllByLabelText("Field")).toHaveLength(2);

    fireEvent.change(within(cards()[1]!).getByLabelText("Field"), {
      target: { value: "spec.max" },
    });
    expect(within(cards()[1]!).getByLabelText("Field")).toHaveValue("spec.max");
  });

  it("adds an item using the noun the schema declared", () => {
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    fireEvent.click(screen.getByRole("button", { name: "Add parameter" }));
    expect(cards()).toHaveLength(3);
  });

  it("removes and reorders by item title, not by index", () => {
    render(<ControlledForm initial={{ params: SAMPLE }} />);
    fireEvent.click(screen.getByRole("button", { name: "Move limit up" }));
    expect(cards()[0]).toHaveTextContent("limit");

    fireEvent.click(screen.getByRole("button", { name: "Remove limit" }));
    expect(cards()).toHaveLength(1);
    expect(screen.queryByText("limit")).not.toBeInTheDocument();
  });

  it("offers no mutation controls when the form is read-only", () => {
    render(
      <JsonSchemaForm
        schema={CARDS_SCHEMA}
        value={{ params: SAMPLE }}
        onChange={() => {}}
        readOnly
        showPreferencesMenu={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Add parameter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove namespace" })).not.toBeInTheDocument();
  });

  it("ignores the cards display for a plain string array", () => {
    // A list of bare strings has no properties to summarize, so it stays on the
    // compact tag editor rather than becoming a stack of untitled cards.
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        tags: {
          type: "array",
          title: "Tags",
          "x-array-display": "cards",
          items: { type: "string" },
        },
      },
    };
    render(
      <JsonSchemaForm schema={schema} value={{ tags: ["a", "b"] }} onChange={() => {}} showPreferencesMenu={false} />,
    );
    expect(cards()).toHaveLength(0);
    expect(screen.getByText("a")).toBeInTheDocument();
  });
});
