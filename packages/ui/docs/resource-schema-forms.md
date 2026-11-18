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

## Form extensions

`JsonSchemaForm` takes `extensions: FormExtension[]` — bundles authored with `defineFormExtension` from `@flanksource/clicky-ui/components`. One bundle can contribute every extension point, and each is opted into through something the form already reads, so a schema gains no new keywords:

| Extension point | Registered under | Selected by |
|---|---|---|
| `formats` (custom field type) | schema `format` | the property's standard `format` |
| `lookups` | `x-clicky-lookup.url` | the descriptor's `url`; any other `url` still goes to `lookupFetcher` |
| `layouts` (layout engine) | a layout name | form `layout.mode`, or a property's `x-layout` (that one row only) |
| `slots` | `Title`, `PreferencesMenu`, `FieldFilter`, `ErrorSummary`, `NoMatches`, `SectionHeading`, `FieldError` | replaces the default component, whose props it receives; the defaults are exported so a replacement can wrap them |
| `pre` / `post` | — | run after the `pre`/`post` props, in extension order, at every depth |

A format renderer receives `{ field, value, onChange, fieldId, readOnly, ctx }` and reads its own configuration from `field.schema` (standard keywords plus any `x-*` it documents). A format no extension registers renders as it always did, so `email` or `uri` stay plain text inputs. A layout engine is `{ Grid, Row }`: `Grid` replaces the container every group of rows renders into and `Row` receives each built field row (`BuiltFieldRow`).

Nothing is overridden silently: registering a built-in format (`json`, `date`, `date-time`, `textarea`, `md`, `percent`, `connection`) or layout (`stacked`, `inline`, `properties`, `stack`, `table`), registering a name twice across extensions, or using a layout name nothing registered, throws. ### Schema-declared extensions

A schema can carry its own extensions in a root-level `x-clicky-extensions` array, so one file fully describes a form. Each entry is `{ "tsx": "…", "name"?: "…" }` (inline module source) or `{ "ref": "path/to/extension.tsx" }` (a path relative to the project root that the host serves); `FormExtensionSource` is the type. Loading them is opt-in: pass `extensionLoader={(source, index) => Promise<FormExtension>}` to `JsonSchemaForm`. The form loads every declared source once per distinct list of sources, shows `Loading` meanwhile, and merges the results after the `extensions` prop through the same merge, so duplicate and reserved names still throw. A rejected load is rethrown during render, so an error boundary sees it. A schema that declares sources with no `extensionLoader` throws (`schema declares x-clicky-extensions but no extensionLoader was provided; render it with PageForm or pass extensionLoader`) instead of rendering fields whose `format` or layout has no handler. The keyword is stripped before the renderer walks the schema. `@flanksource/page-runtime`'s `PageForm` always provides a loader, so a schema-declared form just works there; a plain host supplies its own, for example a bundler `import()` for refs.

The serializable subset of the form's props is exported as `FormDataProps`, for a host that renders the form somewhere it cannot pass functions. See **Extensions / FormExtension** for a runnable example (`components/examples/form-extensions`) that exercises every extension point.
