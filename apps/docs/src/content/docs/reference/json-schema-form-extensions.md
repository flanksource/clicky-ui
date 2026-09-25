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
| `accordion` | Objects | Opens as summary rows with one editor open at a time, whatever the column count. |
| `cards` | Objects | Titled cards with all item editors visible. |
| `stacked` | Objects | Full sub-forms labelled by item number. |
| `list` | Scalars | Compact editable list items. |

With no `x-array-display` and no `x-layout: "table"`, an object array opens by its visible column count — the union across rows of the cells each row's own listeners show. Up to `x-table-max-columns` (array-level, default `4`) scalar columns open as a grid; wider items, or items holding a nested object or object list, open as summary rows with their fields labelled inline. A ⋮ menu on the array's summary line switches between **Grid**, **Stack form** and **Inline form** over the same value; it is hidden in read-only property previews.

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
| `x-layout` | `inline`, `stack`, or `table` | Overrides the field layout. `inline` uses label/value columns, `stack` puts the label above the control, and `table` uses compact table-like rendering where supported. In a table, every read-only cell renders as value text, whichever way it became read-only: a `readOnly` column, the array's own `readOnly`, a `readOnly` object or array around it, or a read-only form. `x-disabled` keeps disabled inputs. |
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

## Listeners

Listeners change a field's state from the values around it. Both keywords take a list of entries of the same shape: `{ when?, ...actions, else? }`. An entry's actions apply while `when` holds, or always when `when` is omitted, and `else` applies while it does not.

| Extension | Applies to | `when` reads | Allowed actions |
| --- | --- | --- | --- |
| `x-on-change` | property | the property's own value | all of the actions below |
| `x-on-load` | object | the object itself | `hide`, `show`, `enable`, `disable`, `patch` |

`when` uses the `if` predicate grammar: `const`, `enum`, `not`, and nested `properties`/`required`. It can also carry an `expr`, which is passed to the form's `expressionEvaluator` prop. When both are present, both must hold. For `x-on-load` the evaluator receives `key: ""` and the object as `value` and `self`. A `when` that states nothing the form can evaluate throws.

| Action | Kind | Targets | Behavior |
| --- | --- | --- | --- |
| `hide` / `show` | derived | keys or paths | Sets or clears `x-hidden`. |
| `enable` / `disable` | derived | keys or paths | Clears or sets `x-disabled`. |
| `patch` | derived | keys or paths | Shallow-merges keywords (`readOnly`, `title`, `enum`, bounds, presentation `x-*`) over the target. Shape keywords, `required`, `default`, `const` and `x-on-change` are refused. |
| `require` / `optional` | derived | sibling keys | Adds the target to, or removes it from, the object's `required`. |
| `reset` | on edit | sibling keys | Restores the target's `default`, or removes it when there is none. |
| `set` | on edit | sibling keys | Writes a literal value. |

Derived actions are recomputed from the current value on every render, so a reloaded record shows the state it was saved in. `reset` and `set` fire only when the listening field is edited, and cascade into the listeners of the fields they change.

### Path targets

A `hide`/`show`/`enable`/`disable` target or a `patch` key may be a `/`-separated path into a sibling's subtree. The first segment is a sibling key, and it must be declared by the object (in `properties` or any `allOf` branch). Each later segment names a property of the object reached so far. An array is crossed into its `items` without using up a segment.

| Target | Reaches |
| --- | --- |
| `groups` | the sibling `groups` |
| `groups/Rates` | the `Rates` property of `groups` |
| `groups/Rates/Fee` | the `Fee` property of each `Rates` item. When `Rates` is a table, that is the Fee column, and a hidden column is dropped from the table. |

Each segment is resolved against the effective properties at that level, so a property contributed by an `allOf` member or by a matching conditional branch can be targeted. A path whose segment the current shape does not declare leaves the sibling untouched, the same way a plain target that the current branch does not declare stays absent. An empty segment (`a//b`, `/a`, `a/`) throws. So does a key that is both a declared property and a path, and a path given to `require`, `optional`, `reset` or `set`.

### Order

`x-on-load` entries apply first, in this order: the object's own, then each `allOf` member's. That is an unconditional member's own entries, or those of the `then`/`else` branch that currently applies. Every property's `x-on-change` entries apply next, in property order. Each entry applies after the ones before it, and a later entry wins per target. Two entries targeting different paths under the same sibling both stay applied. Listeners apply after `allOf`, so they win over a branch's `x-hidden`.

An object's `x-on-load` applies when that object renders, after anything its parent's listeners patched into it through a path. Do not target the same field from both.

```json
{
  "type": "object",
  "x-on-load": [{ "hide": ["groups/Rates", "groups/Rates/Fee"] }],
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "Action": { "type": "string", "enum": ["01", "02"] },
        "Fees": { "type": "boolean" }
      },
      "x-on-change": [
        { "when": { "properties": { "Action": { "const": "01" } } }, "show": ["groups/Rates"] },
        { "when": { "properties": { "Fees": { "const": true } } }, "show": ["groups/Rates/Fee"] }
      ]
    },
    "groups": {
      "type": "object",
      "properties": {
        "Rates": {
          "type": "array",
          "x-layout": "table",
          "items": {
            "type": "object",
            "properties": {
              "Term": { "type": "integer" },
              "Rate": { "type": "number" },
              "Fee": { "type": "number" }
            }
          }
        }
      }
    }
  }
}
```

The `JsonSchemaForm/Listeners` Storybook entry runs this pattern as the *Path Targets And On Load* story.

## Custom extensions

`JsonSchemaProperty` intentionally accepts unknown keys. Use the form's `pre` pipeline to translate an application-specific schema keyword into a `FieldControl`, and `post` to wrap the rendered nodes. This preserves the shared renderer's domain-neutral behavior.
