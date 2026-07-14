---
title: JSON Schema examples
description: JSON Schema patterns shown beside their interactive JsonSchemaForm rendering.
---

Each example pairs the schema shape with a live `JsonSchemaForm` Storybook demo. Edit the rendered controls to see how nested values, arrays, maps, and conditionals behave.

All examples use the same controlled React pattern. JSON Schema `default` values are placeholders; initialize `value` explicitly when a default must already exist in submitted state.

```tsx
import { useState } from "react";
import {
  JsonSchemaForm,
  type JsonSchemaObject,
} from "@flanksource/clicky-ui/components";

export function Example({ schema }: { schema: JsonSchemaObject }) {
  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <>
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
```

## Scalar fields

Primitive properties map to their natural controls. A string renders as text, numbers use numeric behavior, booleans use a switch, enums use a combobox, and a plain string array uses the compact tag editor.

```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": { "type": "string", "title": "Full name" },
    "age": { "type": "integer", "title": "Age", "minimum": 0 },
    "active": { "type": "boolean", "title": "Active" },
    "role": {
      "type": "string",
      "title": "Role",
      "enum": ["admin", "editor", "viewer"]
    },
    "tags": {
      "type": "array",
      "title": "Tags",
      "items": { "type": "string" }
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--default&amp;viewMode=story" title="Scalar JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered form</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--default">Open in Storybook</a></figcaption>
</figure>

## Formatted strings and rich markdown

String `format` selects a specialized editor. Supported formats include `date`, `date-time`, `textarea`, `percent`, and `md`. Markdown fields load MDXEditor lazily and accept typed `x-md-editor` options.

```json
{
  "type": "object",
  "properties": {
    "publishedAt": {
      "type": "string",
      "format": "date-time",
      "title": "Published at"
    },
    "summary": {
      "type": "string",
      "format": "textarea",
      "title": "Summary"
    },
    "body": {
      "type": "string",
      "format": "md",
      "title": "Body",
      "x-md-editor": {
        "admonitions": true,
        "frontmatter": true,
        "tables": true
      }
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--markdown-field&amp;viewMode=story" title="Markdown JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered markdown field</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--markdown-field">Open in Storybook</a></figcaption>
</figure>

The rendered demo focuses on `format: "md"`. Date fields use the date picker, `percent` keeps the stored value numeric while displaying a percent suffix, and `textarea` uses a multiline text control. See the [MdxEditorField API](/reference/components/inputs-layout/mdx-editor-field/) for the standalone editor surface.

## Nested objects

Objects with fixed `properties` recurse into headed sub-forms. Required markers and edits remain scoped to each nested object while `onChange` receives the rebuilt root value.

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "title": "Service name" },
    "database": {
      "type": "object",
      "title": "Database",
      "required": ["host"],
      "properties": {
        "host": { "type": "string", "title": "Host" },
        "port": { "type": "integer", "title": "Port" },
        "credentials": {
          "type": "object",
          "title": "Credentials",
          "properties": {
            "user": { "type": "string", "title": "User" },
            "password": { "type": "string", "title": "Password" }
          }
        }
      }
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--nested-object&amp;viewMode=story" title="Nested object JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered nested objects</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--nested-object">Open in Storybook</a></figcaption>
</figure>

## Arrays of objects

When `items` is an object schema, every array entry renders as its own sub-form with add, remove, and reorder controls.

```json
{
  "type": "object",
  "properties": {
    "servers": {
      "type": "array",
      "title": "Servers",
      "items": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string", "title": "Name" },
          "port": { "type": "integer", "title": "Port", "minimum": 0 },
          "tls": { "type": "boolean", "title": "TLS" }
        }
      }
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--array-of-objects&amp;viewMode=story" title="Array of objects JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered object array</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--array-of-objects">Open in Storybook</a></figcaption>
</figure>

## Editable maps

An object with a schema-valued `additionalProperties` renders editable key/value rows. Declared properties can still have stronger controls, while extra keys use the additional-property schema.

```json
{
  "type": "object",
  "properties": {
    "labels": {
      "type": "object",
      "title": "Labels",
      "properties": {
        "environment": {
          "type": "string",
          "enum": ["dev", "staging", "prod"]
        }
      },
      "additionalProperties": { "type": "string" }
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--string-map&amp;viewMode=story" title="Editable map JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered string map</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--string-map">Open in Storybook</a></figcaption>
</figure>

The control can add, rename, and remove extra keys. Declared properties keep their schema-derived input, while every undeclared key uses `additionalProperties`.

## Conditional fields

`if` and `then` branches add fields according to the current value. Switching the controlling enum immediately changes the effective property set.

```json
{
  "type": "object",
  "properties": {
    "notify": {
      "type": "string",
      "title": "Notify via",
      "enum": ["none", "email", "webhook"]
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "notify": { "const": "email" } },
        "required": ["notify"]
      },
      "then": {
        "required": ["address"],
        "properties": {
          "address": { "type": "string", "title": "Email address" }
        }
      }
    },
    {
      "if": {
        "properties": { "notify": { "const": "webhook" } },
        "required": ["notify"]
      },
      "then": {
        "required": ["url"],
        "properties": {
          "url": { "type": "string", "title": "Webhook URL" }
        }
      }
    }
  ]
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--conditional&amp;viewMode=story" title="Conditional JSON Schema form demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered conditional form</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--conditional">Open in Storybook</a></figcaption>
</figure>

The renderer evaluates `if`/`then` clauses inside `allOf`. Hiding a branch does not delete its existing value; normalize the object in the host if inactive branch data must be removed before submission.

## Presentation extensions

Clicky UI's `x-*` keywords change presentation without changing the stored value. This example combines segmented enums, icons, descriptions, a 12-column grid, spans, and input adornments.

```json
{
  "type": "object",
  "x-columns": 12,
  "properties": {
    "runtime": {
      "type": "string",
      "title": "Runtime",
      "enum": ["claude", "codex"],
      "x-enum-display": "segmented",
      "x-enum-icons": {
        "claude": "anthropic",
        "codex": "openai"
      },
      "x-enum-descriptions": {
        "claude": "Claude Code runtime",
        "codex": "Codex runtime"
      },
      "x-col-span": 12
    },
    "model": {
      "type": "string",
      "title": "Model",
      "x-input-prefix-icon": "sparkles",
      "x-col-span": 8
    },
    "temperature": {
      "type": "number",
      "title": "Temperature",
      "minimum": 0,
      "maximum": 2,
      "x-col-span": 4
    }
  }
}
```

<figure class="component-demo">
  <iframe src="/storybook/iframe.html?id=components-jsonschemaform--presentation-extensions&amp;viewMode=story" title="JSON Schema presentation extensions demo" loading="lazy"></iframe>
  <figcaption><strong>Rendered presentation extensions</strong> · <a href="/storybook/?path=/story/components-jsonschemaform--presentation-extensions">Open in Storybook</a></figcaption>
</figure>

For the complete keyword list, see [JSON Schema extensions](/reference/json-schema-form-extensions/).
