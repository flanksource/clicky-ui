import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fireEvent, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const ownerRef: JsonSchemaProperty = {
  title: "Field reference", type: "object", additionalProperties: false, required: ["kind", "name"],
  properties: { kind: { title: "Kind", enum: ["policy", "plan"] }, name: { title: "Name", type: "string" } },
};

// A named union whose first branch is itself a union of a field answer and a
// calculation (an inlined `$ref` composition with no title of its own).
const schema: JsonSchemaObject = {
  properties: {
    dueDate: {
      title: "Due date",
      oneOf: [
        {
          title: "Date answer",
          oneOf: [
            { title: "Field Answer", type: "object", unevaluatedProperties: false, required: ["type", "fieldRef"], properties: { type: { title: "Type", const: "field" }, fieldRef: ownerRef } },
            { allOf: [{ title: "Calculation Answer", type: "object", unevaluatedProperties: false, required: ["type", "calculation"], properties: { type: { title: "Type", const: "calculation" }, calculation: { title: "Calculation", type: "string" } } }] },
          ],
        },
        { title: "Open questions", type: "object", additionalProperties: false, required: ["open"], properties: { open: { title: "Open", type: "array", items: { type: "string" } } } },
        { title: "Not applicable", type: "object", additionalProperties: false, required: ["notApplicable"], properties: { notApplicable: { title: "Reason", type: "string" } } },
      ],
    },
  },
};

function UnionHarness() {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return <div className="max-w-xl space-y-3">
    <JsonSchemaForm schema={schema} value={value} onChange={setValue} showPreferencesMenu={false} />
    <pre role="status" className="text-xs">{JSON.stringify(value)}</pre>
  </div>;
}

const meta = {
  title: "JsonSchemaForm/Union",
  component: UnionHarness,
} satisfies Meta<typeof UnionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NestedObjectBranches: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const format = canvas.getByRole("combobox", { name: "Due date format" });
    await expect(within(format).getAllByRole("option").map((option) => option.textContent))
      .toEqual(["Field Answer", "Calculation Answer", "Open questions", "Not applicable"]);
    fireEvent.change(format, { target: { value: "0" } });
    fireEvent.change(canvas.getByRole("textbox", { name: /^Name/ }), { target: { value: "DueDate" } });
    await expect(canvas.getByRole("combobox", { name: "Due date format" })).toHaveValue("0");
    await expect(canvas.queryByRole("textbox", { name: /^Type/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent('{"dueDate":{"type":"field","fieldRef":{"name":"DueDate"}}}');
  },
};
