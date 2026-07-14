---
title: JSON Schema form
description: Build controlled, nested forms from JSON Schema 2020-12 objects.
---

`JsonSchemaForm` maps an object schema to a controlled React form. It handles common JSON Schema structure itself and exposes `pre` and `post` pipelines for application-specific widgets.

## Basic form

```tsx
import { useState } from "react";
import {
  JsonSchemaForm,
  type JsonSchemaObject,
} from "@flanksource/clicky-ui/components";

const schema: JsonSchemaObject = {
  type: "object",
  required: ["name", "enabled"],
  properties: {
    name: {
      type: "string",
      title: "Display name",
      description: "A human-readable name for this connection.",
    },
    enabled: { type: "boolean", default: true },
    provider: {
      type: "string",
      enum: ["aws", "azure", "gcp"],
      "x-enum-labels": {
        aws: "Amazon Web Services",
        azure: "Microsoft Azure",
        gcp: "Google Cloud",
      },
    },
  },
};

export function ConnectionForm() {
  const [value, setValue] = useState<Record<string, unknown>>({
    enabled: true,
  });
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={setValue}
      idPrefix="connection"
    />
  );
}
```

The form does not apply defaults to `value`; initialize controlled state yourself when defaults need to be present before the user edits a field.

## Supported JSON Schema behavior

The renderer consumes the following standard schema features:

- Primitive `type` values: `string`, `number`, `integer`, `boolean`, `null`, `array`, and `object`.
- Metadata and constraints: `title`, `description`, `default`, `readOnly`, `enum`, `const`, `minimum`, `maximum`, and `multipleOf`.
- Nested data: `properties`, `required`, `items`, `additionalProperties`, `patternProperties`, and `propertyNames.enum` for constrained map keys.
- Composition: local `#/$defs/...` references, unconditional `allOf` members, and `allOf` clauses using `if`/`then` conditionals. An enum inside `anyOf` or `oneOf` can supply choices for a value-or-free-text union.
- String formats: `date`, `date-time`, `textarea`, `md`, and `percent`.

This is a rendering contract, not a complete JSON Schema validator. Unknown keywords pass through so consumer extensions can interpret them, and change handlers are not blocked by validation hints.

## Layout and display preferences

Use `layout` for an explicit form-wide arrangement or `inline` as the short form:

```tsx
<JsonSchemaForm
  schema={schema}
  value={value}
  onChange={setValue}
  size="sm"
  layout={{
    mode: "inline",
    labelMaxWidth: "28ch",
    valueMaxWidth: "48rem",
  }}
/>
```

The preferences menu is visible by default and lets a user change this form's size, layout, sort order, and top-level field filter. Preferences share the `clicky-ui-json-schema-form-preferences` local-storage key unless `preferencesStorageKey` is set. Set `persistPreferences={false}` for instance-only choices, or `showPreferencesMenu={false}` to remove the menu and all preference storage access.

## Application extensions

A `pre` extension transforms a resolved `FieldControl` before it renders, or returns `null` to omit it. Extensions compose in array order and run recursively at every nesting depth.

```tsx
import type { PreExtension } from "@flanksource/clicky-ui/components";

const emphasizeSecrets: PreExtension = (field) => {
  if (field.schema.format !== "password") return field;
  return {
    ...field,
    badge: "secret",
    inputClassName: "font-mono",
  };
};

<JsonSchemaForm {...props} pre={[emphasizeSecrets]} />;
```

A `post` extension receives the final label and value nodes and can wrap or replace them. Both extension types can read the top-level form value, which is useful for sibling-dependent widgets. Keep domain behavior in these extension functions instead of adding field-name heuristics to the shared renderer.

## Async lookups

`x-clicky-lookup` turns a string into a searchable entity picker. The schema describes the request and the host supplies transport through `lookupFetcher`:

```tsx
const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    connection: {
      type: "string",
      "x-clicky-lookup": {
        url: "/api/v1/connections",
        filter: "id",
        scope: { param: "type", from: "provider.type" },
      },
    },
  },
};

<JsonSchemaForm
  schema={schema}
  value={value}
  onChange={setValue}
  lookupFetcher={async ({ descriptor, query, rootValue }) => {
    return api.lookup({ descriptor, query, rootValue });
  }}
/>;
```

See the [extension reference](/reference/json-schema-form-extensions/) for every built-in `x-*` key and its exact values.
