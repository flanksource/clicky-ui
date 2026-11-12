import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// `x-object-display: "row"` renders a small reference object (kind + name +
// binding) as one compact row of controls under the object's own label — the
// same shape as SecretKeySelector's source / name / key row.
const schema: JsonSchemaObject = {
  properties: {
    fieldRef: {
      title: "Field reference",
      description: "Identity of a stored field.",
      type: "object",
      "x-object-display": "row",
      "x-order": ["kind", "name", "binding"],
      required: ["kind", "name"],
      properties: {
        kind: {
          title: "Kind",
          "x-enum-display": "combobox",
          "x-enum-labels": { plan: "Plan", policy: "Policy", client: "Client" },
          enum: ["plan", "policy", "client"],
        },
        name: { title: "Name", type: "string", examples: ["StartDate"] },
        binding: { title: "Binding", type: "string", examples: ["item"] },
      },
    },
  },
};

function Demo({ className = "max-w-3xl" }: { className?: string }) {
  const [value, setValue] = useState<Record<string, unknown>>({ fieldRef: { kind: "policy" } });
  return (
    <div className={className}>
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} persistPreferences={false} />
      <output className="mt-4 block font-mono text-xs">{JSON.stringify(value)}</output>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Object row",
  component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReferenceRow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: /^Name/ }), { target: { value: "StartDate" } });
    await expect(canvas.getByRole("status")).toHaveTextContent('{"fieldRef":{"kind":"policy","name":"StartDate"}}');
  },
};

// Like SecretKeySelector, the row never wraps: in a narrow value column the
// controls shrink side by side instead of stacking one per line.
export const NarrowColumn: Story = {
  tags: ["browser"],
  args: { className: "w-[22rem]" },
  play: async ({ canvasElement }) => {
    const cells = Array.from(canvasElement.querySelectorAll("[data-jsf-row-cell]"));
    await expect(cells).toHaveLength(3);
    const tops = new Set(cells.map((cell) => Math.round(cell.getBoundingClientRect().top)));
    await expect(tops.size).toBe(1);
  },
};
