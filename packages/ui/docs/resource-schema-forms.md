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

## Compact presentation

Use `size="sm" inline requiredFirst showTypeIcons objectDisplay="accordion"` on `JsonSchemaForm` for small controls, aligned label/value rows, inferred field-type icons, and collapsible nested objects. The root stays open. Existing standalone forms keep their default presentation. Explicit `x-icon` takes precedence over inferred icons, and `x-object-display: "flat" | "accordion"` overrides object presentation for one section. Sections with supplied validation errors open to expose them. The display-options menu continues to control size, layout and ordering; schema `x-layout` overrides still apply to subtrees.

`DocumentEditor` uses this compact presentation by default. Its `formOptions` forwards `size`, `inline`, `layout`, `requiredFirst`, `showTypeIcons`, `objectDisplay`, `persistPreferences` and `preferencesStorageKey` to `JsonSchemaForm`. Source documents never materialize schema defaults merely by opening their form.

## Nullable fields

A single typed value plus null renders its normal control, without a variant selector. This includes nullable dates, date/times, numbers, enums, objects and arrays, declared through type arrays or `anyOf`/`oneOf`, including local references. A trailing × writes actual `null`; null displays empty, nullable booleans distinguish Yes, No and empty, and null collections offer an explicit Add action. Read-only fields offer no clear action. A required property may hold null when its schema permits it.

Missing keys, null, empty strings, zero and false remain distinct. Opening a field does not write a value. Deleting text leaves an empty string; the × sets null. Clearing a nullable date writes null. Genuine named or differently formatted variants retain their selector and branch drafts. See **Forms / JsonSchemaForm / Presentation** for an interactive example.

Clear actions live inside the field chrome. `InputField` (text, number and textarea), `DateField` and its pickers, `Select`, `Combobox`, `TreePickerField`, and `MdxEditorField` accept `clearable`, `onClear`, and `clearLabel`. Supply `onClear` to commit the intended empty value or delete a property; the input does not guess between null and removal. Date pickers and comboboxes retain their usual empty-value clearing when no callback is supplied. Disabled and read-only fields do not offer clearing. Nullable schema fields wire these props automatically. Calendars, dropdown chevrons, units and stepper buttons keep their own positions beside the clear action.

The **Presentation / All Field Types** story includes scalar fields, dates, markdown, numeric sliders and steppers, all enum presentations, searchable and hierarchical lookups, typed maps, all array presentations, JSON, unions, nullable controls, display-only elements and read-only states. Storybook controls adjust size, label layout, icons, ordering, object sections and read-only mode; the form's display menu also offers properties layout and sorting.

`format:json` provides a JSON textarea. Invalid text remains editable and displays an error while the last valid committed value stays intact. External controlled-value updates replace stale drafts. Use typed schemas for known structures; reserve this format for arbitrary JSON.

`x-help.links` accepts `{label,href}` entries with absolute HTTP(S) URLs. Links appear with inline help or in the field's focusable hover card according to `layout.help` / `x-help-display`. Links open a new tab with `noopener noreferrer`; unsafe protocols fail explicitly. Help links and branch editing also appear in the **JsonSchemaForm / Resource editing** Storybook example.
