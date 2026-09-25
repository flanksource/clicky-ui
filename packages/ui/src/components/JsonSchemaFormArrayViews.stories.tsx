import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FormLayout, JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// An object array with no display hint opens by its visible column count: up
// to `x-table-max-columns` (default 4) as a grid, wider as the inline item
// form. The ⋮ menu on its summary line switches between Grid, Stack form and
// Inline form; the value is shared, so edits survive a switch.

const text = (title: string): JsonSchemaProperty => ({ type: "string", title });

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    Beneficiaries: {
      type: "array",
      title: "Beneficiaries",
      items: {
        type: "object",
        properties: {
          Name: text("Name"),
          Relationship: text("Relationship"),
          Share: { type: "number", title: "Share %" },
        },
      },
    },
    Reinsurers: {
      type: "array",
      title: "Reinsurers",
      items: {
        type: "object",
        properties: {
          Name: text("Reinsurer"),
          Treaty: text("Treaty"),
          Share: { type: "number", title: "Share %" },
          Retention: { type: "number", title: "Retention" },
          Currency: text("Currency"),
          Effective: { type: "string", format: "date", title: "Effective" },
          Notes: text("Notes"),
        },
      },
    },
  },
};

const initial = {
  Beneficiaries: [
    { Name: "Ada Example", Relationship: "Spouse", Share: 60 },
    { Name: "Ben Example", Relationship: "Child", Share: 40 },
  ],
  Reinsurers: [
    { Name: "Acme Re", Treaty: "QS-01", Share: 50, Retention: 100000, Currency: "USD", Effective: "2026-01-01" },
    { Name: "Example Re", Treaty: "XL-02", Share: 25, Retention: 250000, Currency: "USD", Effective: "2026-01-01" },
  ],
};

function ArrayViewsDemo({ layout }: { layout: FormLayout }) {
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  return (
    <div className="max-w-4xl space-y-4 p-4">
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} layout={layout} showPreferencesMenu={false} />
      <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Object array views",
  component: ArrayViewsDemo,
  args: { layout: { mode: "stacked" } },
  parameters: {
    docs: {
      description: {
        component:
          "Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place.",
      },
    },
  },
} satisfies Meta<typeof ArrayViewsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NarrowAndWide: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("the 3-column array opens as a grid, the 7-column one as item rows", async () => {
      await expect(canvas.getAllByRole("table")).toHaveLength(1);
    });
    await step("the view menu switches the grid to the stack form", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "View options for Beneficiaries" }));
      await userEvent.click(within(document.body).getByRole("menuitem", { name: "Stack form" }));
      await expect(canvas.queryByRole("table")).toBeNull();
    });
  },
};

export const InlineForm: Story = {
  args: { layout: { mode: "inline" } },
};
