import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  JsonSchemaObject,
  JsonSchemaFormProps,
} from "./json-schema-form-types";
import {
  fieldCatalogSchema,
  fieldCatalogValues,
} from "./json-schema-form-catalog.fixtures";
import {
  propertiesLookupFetcher,
  propertiesPresentation,
} from "./json-schema-form-properties.fixtures";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: ["string", "null"], title: "Name" },
    date: {
      anyOf: [{ type: "string", format: "date" }, { type: "null" }],
      title: "Date",
    },
    scheduled: {
      type: ["string", "null"],
      format: "date-time",
      title: "Scheduled at",
    },
    enabled: { type: ["boolean", "null"], title: "Enabled" },
    amount: { type: ["number", "null"], title: "Amount", minimum: 0 },
    mode: {
      anyOf: [{ type: "string", enum: ["auto", "manual"] }, { type: "null" }],
      title: "Mode",
    },
    settings: {
      type: "object",
      title: "Settings",
      properties: { retries: { type: "integer", title: "Retries" } },
    },
  },
  required: ["name"],
};

function Example() {
  const [value, setValue] = useState<Record<string, unknown>>({
    name: "Example",
    date: "2026-11-07",
    scheduled: null,
    enabled: false,
    amount: 0,
    mode: "auto",
    settings: { retries: 3 },
  });
  return (
    <div className="p-4">
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={setValue}
        inline
        size="sm"
        requiredFirst
        showTypeIcons
        objectDisplay="accordion"
        applyDefaults={false}
        persistPreferences={false}
      />
      <pre className="mt-4 overflow-auto text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "Forms/JsonSchemaForm/Presentation",
  component: JsonSchemaForm,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JsonSchemaForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Compact: Story = { render: () => <Example /> };

function FieldCatalog(options: JsonSchemaFormProps) {
  const [value, setValue] =
    useState<Record<string, unknown>>(fieldCatalogValues);
  return (
    <div className="p-4">
      <JsonSchemaForm
        {...options}
        schema={fieldCatalogSchema}
        value={value}
        onChange={setValue}
        pre={[propertiesPresentation]}
        lookupFetcher={propertiesLookupFetcher}
        applyDefaults={false}
        persistPreferences={false}
      />
      <pre className="mt-4 overflow-auto text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export const AllFieldTypes: Story = {
  args: {
    size: "sm",
    inline: true,
    requiredFirst: true,
    showTypeIcons: true,
    objectDisplay: "accordion",
    readOnly: false,
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    objectDisplay: { control: "select", options: ["flat", "accordion"] },
    inline: { control: "boolean" },
    readOnly: { control: "boolean" },
    showTypeIcons: { control: "boolean" },
    requiredFirst: { control: "boolean" },
  },
  render: (args) => <FieldCatalog {...args} />,
};
