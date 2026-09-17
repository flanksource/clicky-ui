import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    clients: {
      type: "object",
      title: "Clients",
      properties: Object.fromEntries(
        ["Person", "Company", "Trust", "Partnership", "Association"].map((key) => [
          key,
          {
            type: "array",
            title: key,
            items: {
              type: "object",
              properties: { Name: { type: "string", title: "Name" } },
            },
          },
        ]),
      ),
    },
  },
};

function KeyedArraysDemo() {
  const [value, setValue] = useState<Record<string, unknown>>({ clients: {} });
  return (
    <div className="max-w-4xl space-y-4 p-4">
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} />
      <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Keyed arrays",
  component: KeyedArraysDemo,
} satisfies Meta<typeof KeyedArraysDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inferred: Story = {};
