import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    access: {
      title: "Filesystem policy",
      description: "Choose a named policy or declare path-specific grants.",
      "x-help": { links: [{ label: "JSON Schema unions", href: "https://json-schema.org/understanding-json-schema/reference/combining" }] },
      anyOf: [
        { type: "string", title: "Named policy", enum: ["read-only", "workspace-write"] },
        { type: "object", title: "Path grants", additionalProperties: { type: "string", enum: ["read", "write", "deny"] } },
        { type: "null", title: "Inherit policy" },
      ],
    },
    payload: { title: "Native JSON", format: "json", description: "Retains booleans, arrays, objects and null without string coercion." },
  },
};

function ResourcePreview() {
  const [value, setValue] = useState<Record<string, unknown>>({ access: "read-only", payload: { enabled: true, attempts: 3 } });
  return <div className="max-w-2xl space-y-4 p-4">
    <JsonSchemaForm schema={schema} value={value} onChange={setValue} layout={{ help: "inline" }} />
    <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>
  </div>;
}

export default { title: "JsonSchemaForm/Resource editing", component: ResourcePreview } satisfies Meta<typeof ResourcePreview>;
export const NativeResources: StoryObj<typeof ResourcePreview> = {};
