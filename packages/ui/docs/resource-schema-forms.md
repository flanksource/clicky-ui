# Resource schema forms

`JsonSchemaForm` supports native resource shapes with scalar/object/array/null unions, typed maps, arbitrary JSON values and external help links. These controls use the same controlled `value` and `onChange` contract as other form fields.

```tsx
import { useState } from "react";
import { JsonSchemaForm, type JsonSchemaObject } from "@flanksource/clicky-ui/components";
import "@flanksource/clicky-ui/styles.css";

const schema: JsonSchemaObject = {
  properties: {
    access: {
      title: "Access",
      description: "Use a named policy or specify individual path grants.",
      "x-help": { links: [{ label: "Schema reference", href: "https://json-schema.org/understanding-json-schema/reference/combining" }] },
      anyOf: [
        { type: "string", title: "Named policy", enum: ["read-only", "workspace-write"] },
        { type: "object", title: "Path grants", additionalProperties: { type: "string", enum: ["read", "write", "deny"] } },
        { type: "null", title: "Inherit" },
      ],
    },
    payload: { title: "JSON payload", format: "json" },
  },
};

export function ResourceForm() {
  const [value, setValue] = useState<Record<string, unknown>>({ access: "read-only", payload: false });
  return <JsonSchemaForm schema={schema} value={value} onChange={setValue} layout={{ help: "inline" }} />;
}
```

The union selector preserves each branch's draft while mounted. Branches seed their declared defaults, constants and discriminator constants. Explicit null and boolean values retain their native JSON types. Give branches distinct titles to make the selector useful. String enum/template unions continue to use the existing enum controls.

`format:json` provides a JSON textarea. Invalid text remains editable and displays an error while the last valid committed value stays intact. External controlled-value updates replace stale drafts. Use typed schemas for known structures; reserve this format for arbitrary JSON.

`x-help.links` accepts `{label,href}` entries with absolute HTTP(S) URLs. Links appear with inline help or in the field's focusable hover card according to `layout.help` / `x-help-display`. Links open a new tab with `noopener noreferrer`; unsafe protocols fail explicitly. Help links and branch editing also appear in the **JsonSchemaForm / Resource editing** Storybook example.
