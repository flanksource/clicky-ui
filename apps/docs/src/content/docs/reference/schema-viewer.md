---
title: Schema Viewer
description: Read-only JSON Schema references with ordered sections, tree and table views, and type icons.
---

Import `SchemaViewer` from `@flanksource/clicky-ui/data` to inspect a JSON Schema. It resolves local references and displays nested fields and variants in one grouped tree or table. The Tree / Table switch sits next to the shared filter and preserves the search when switching views. Table rows use full field paths; type icons expose their type through an accessible label and tooltip.

```tsx
import { SchemaViewer } from "@flanksource/clicky-ui/data";

export function CommandReference() {
  return <SchemaViewer
    schema={{
      type: "object",
      properties: {
        id: { type: "string", description: "Unique step identifier." },
        timeout: { type: "string", format: "duration", default: "30s" },
        exec: { type: "string", description: "Executable to run." },
        args: { type: "array", items: { type: "string" } },
      },
    }}
    sections={[
      { id: "global", title: "Global fields", select: ["timeout", "id"], order: ["id", "timeout"] },
      { id: "kind", title: "Command fields", select: "*", order: ["exec", "args"] },
    ]}
  />;
}
```

`sections` controls the order of groups inside the single tree or table. Each section needs a unique nonempty `id` and a `title`; `description` adds group context. Its `select` accepts root field names or node keys, a predicate over `SchemaViewerNode`, or `"*"` for fields not claimed by earlier sections. Fields are assigned only once. Unselected fields remain visible under Other fields, and empty groups are omitted.

`order` lists field names or node keys to show first within a section. Unlisted fields retain schema order. Selectors and ordering apply to root fields and preserve each selected field's complete subtree.

The default view is `tree`. Set `defaultView="table"` to start with a table, or supply `view` and `onViewChange` to control it. `showViewToggle={false}` fixes the selected view. `showControls={false}` hides search and bulk expansion controls.

Descriptions, defaults, and constant values are visible without expanding a field. Only nested fields and additional metadata, such as formats, enums, source locations, or queries, create expandable content. `renderDetail` customizes those metadata panels in both views.
