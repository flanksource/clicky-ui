---
title: JSON Schema extensions
description: Complete reference for the x-* keywords supported by JsonSchemaForm.
---

These keywords are presentation hints layered on top of JSON Schema. They never change the stored value shape unless the selected control naturally emits a different primitive type.

## Form structure and ordering

| Extension | Applies to | Value | Behavior |
| --- | --- | --- | --- |
| `x-order` | object | `string[]` | Renders named properties first in the given order; remaining properties retain document order. |
| `x-clicky-order` | property | `number` | Sorts fields by numeric rank. Because the rank lives on each field, it composes across conditional branches. |
| `x-discriminator` | root object | property name | Starts with a kind picker, then renders the matching conditional branch. The discriminator property normally uses `enum` and branches use `if`/`then`. |
| `x-columns` | object | number from 1 to 12 or `"auto"` | Equal-width columns in stacked layout. Numeric values are clamped; `"auto"` fits columns to the available width. Ignored in inline and properties layouts. |
| `x-col-span` | property | positive number or `"full"` | Spans columns in the enclosing grid. `"full"` spans the whole row, including when the column count is automatic. |
| `x-column-min-width` | object | CSS length | Minimum column width for `x-columns: "auto"`; defaults to `"15rem"`. |
| `x-columns-max-width` | object | CSS length | Optional overall width cap for an automatic grid. |
| `x-classes` | object | Tailwind class string | Merges classes onto the object's field grid. |

```ts
const schema = {
  type: "object",
  "x-columns": 12,
  "x-order": ["name", "type"],
  properties: {
    name: { type: "string", "x-col-span": 8 },
    type: { type: "string", enum: ["api", "file"], "x-col-span": 4 },
  },
};
```

For responsive forms, use `"x-columns": "auto"` with `"x-column-min-width": "18rem"`. Give long text fields `"x-col-span": "full"` to keep them on their own row.

## Enum and array presentation

| Extension | Value | Behavior |
| --- | --- | --- |
| `x-enum-labels` | `Record<string, string>` | Adds a human label per raw enum value. A distinct label displays as `Label (value)` while the raw value is stored. |
| `x-enum-icons` | `Record<string, string>` | Adds a runtime icon name per option. Its presence defaults the enum to `grid` display unless `x-enum-display` overrides it. |
| `x-enum-descriptions` | `Record<string, string>` | Adds secondary option text, especially useful for segmented cards and grids. |
| `x-enum-display` | `combobox`, `radio`, `grid`, or `segmented` | Forces the enum control presentation. The default is a combobox, except icon enums default to a grid. |
| `x-array-display` | `filter-pills`, `accordion`, `cards`, `stacked`, or `list` | Selects the collection layout; see the modes below. |
| `x-item` | array item descriptor | Configures object-item titles, summaries, glyphs, badges, and actions. Lives on the array schema. |
| `x-enum-tones` | `Record<string, FieldTone>` | Decorative hues for enum values, including item glyphs. Does not change the enum control. |

```ts
const mode = {
  type: "string",
  enum: ["plan", "run"],
  "x-enum-display": "segmented",
  "x-enum-icons": { plan: "plan", run: "play" },
  "x-enum-descriptions": {
    plan: "Inspect and propose changes",
    run: "Apply and verify changes",
  },
};
```

`FieldTone` accepts `neutral`, `slate`, `violet`, `amber`, `sky`, `teal`, `indigo`, `emerald`, and `rose`.

### Array layouts

| Mode | Item schema | Behavior |
| --- | --- | --- |
| `filter-pills` | Enum-backed items | Toggle pills; an empty stored array represents all options. |
| `accordion` | Objects | Default for object arrays; summary rows with one editor open at a time. |
| `cards` | Objects | Titled cards with all item editors visible. |
| `stacked` | Objects | Full sub-forms labelled by item number. |
| `list` | Scalars | Compact editable list items. |

### Array item descriptor

| `x-item` property | Value | Behavior |
| --- | --- | --- |
| `title` | `string[]` | Item property keys tried in order; the first non-empty value becomes the title. |
| `fallback` | string | Title when all candidates are empty; defaults to `Item <n>`. |
| `summary` | Array of property names or `{ property, pattern? }` | Joins values with `·`. A pattern inserts its value at the literal `{}` marker. |
| `glyph` | property name | Enum property whose icon and tone supply the leading glyph. |
| `badge` | property name | Enum property supplying a secondary chip. |
| `flag` | property name | Boolean property rendered as a required mark. |
| `actions` | Array of `reorder`, `duplicate`, `remove` | Omit for all actions; use `[]` for none of these per-item actions. Does not control the add row. |
| `noun` | string | Noun for the add row; defaults to `items.title`, then `item`. |
| `nounPlural` | string | Noun for the count; defaults to the array title, then `items`. |
| `empty` | string | Add-row text for an empty array; defaults to the array description. |

```json
{
  "type": "array",
  "title": "Servers",
  "x-array-display": "accordion",
  "x-item": {
    "title": ["name", "host"],
    "summary": [{ "property": "port", "pattern": "port {}" }],
    "actions": ["reorder", "remove"],
    "noun": "server"
  },
  "items": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "title": "Name" },
      "host": { "type": "string", "title": "Host" },
      "port": { "type": "integer", "title": "Port" }
    }
  }
}
```

## Fields and adornments

| Extension | Value | Behavior |
| --- | --- | --- |
| `x-icon` | runtime icon name | Adds an icon before the field label. |
| `x-layout` | `inline`, `stack`, or `table` | Overrides the field layout. `inline` uses label/value columns, `stack` puts the label above the control, and `table` uses compact table-like rendering where supported. |
| `x-label-position` | `top` or `left` | Friendly alias for stacked or inline field layout. `x-layout` wins when both are set. |
| `x-label-classes` | Tailwind class string | Merges classes onto the field label. |
| `x-input-classes` | Tailwind class string | Merges classes onto the input/control. |
| `x-input-prefix` | string | Renders static text inside the input's leading edge. |
| `x-input-suffix` | string | Renders static text inside the input's trailing edge. |
| `x-input-prefix-icon` | runtime icon name | Renders an icon at the leading edge; takes precedence over `x-input-prefix`. |
| `x-input-suffix-icon` | runtime icon name | Renders an icon at the trailing edge; takes precedence over `x-input-suffix`. |

## Specialized controls

`x-help-display: "inline"` shows descriptions below the control; `"hover"` moves them behind a help affordance. This overrides form-level `layout.help`.

Form-wide property rows use `layout={{ mode: "properties" }}` on `JsonSchemaForm`. This is a form prop, not a field-level `x-layout` value. See [layout and display preferences](/guides/json-schema-form/#layout-and-display-preferences).

| Extension | Value | Behavior |
| --- | --- | --- |
| `x-number-display` | `slider` | Renders a bounded numeric value as a single-thumb slider. The schema must provide `maximum`; `minimum` defaults through the normal numeric control behavior. |
| `x-md-editor` | MDX editor options | Configures a field with `format: "md"`. Options control the toolbar and enabled MDXEditor plugins. Import `@flanksource/clicky-ui/mdx-editor.css` in the host. |
| `x-help` | `{ source?, section?, body? }` | Adds generated inline help. `body` is appended to a distinct standard `description`; `source` and `section` remain metadata. |
| `x-clicky-lookup` | lookup descriptor | Replaces a string field with a lazy, searchable entity-reference picker. Requires a form-level `lookupFetcher`. |

### Lookup descriptor

| Property | Required | Description |
| --- | --- | --- |
| `url` | yes | Entity list endpoint, for example `/api/v1/connection`. |
| `filter` | yes | Response/value key and `__lookup_filter` value. |
| `searchParam` | no | Search parameter metadata; the standard request convention is `__lookup_q`. |
| `multi` | no | Enables multiple selection. Single selection also accepts a free-form value. |
| `scope.param` | when scoped | Extra query parameter name. |
| `scope.from` | when scoped | Dotted path into the form's root value. |
| `scope.map` | no | Maps a source value to one or more emitted values. |
| `scope.join` | no | Separator for mapped values; defaults to a comma. |
| `hierarchy.delimiters` | when hierarchical | Characters that split option labels into browsable tree levels, for example `"./"`. Stored option values remain unsplit. |

```ts
const connectionField = {
  type: "string",
  "x-clicky-lookup": {
    url: "/api/v1/connection",
    filter: "id",
    scope: {
      param: "types",
      from: "provider.type",
      map: { sql: ["postgres", "mysql"] },
    },
  },
};
```

## Custom extensions

`JsonSchemaProperty` intentionally accepts unknown keys. Use the form's `pre` pipeline to translate an application-specific schema keyword into a `FieldControl`, and `post` to wrap the rendered nodes. This preserves the shared renderer's domain-neutral behavior.
