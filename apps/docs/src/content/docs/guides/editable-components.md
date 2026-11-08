---
title: Making components editable
description: Author text and visual properties that the playground can discover, preview, and safely save to source.
---

An editable component needs three connected contracts: props that own the editable values, DOM markers that identify their rendered elements, and a source binding that tells the playground where to save. A text marker or a property schema alone does not provide all three.

## What works today

| Component or element | Current editing support |
| --- | --- |
| `BoxNode`, `BrandBox` | `variant`, plus marked title, description, and footer text. |
| `ContainerNode`, `BrandContainer` | `variant`, plus marked tag, title, description, and footer text. |
| `Tile`, `Zone` | `role`, plus their marked text props. |
| Source-authored SVG shapes, groups, text, and spans | The tag's declared attribute fields, text content where supported, and Tailwind/theme controls. |
| Custom HTML components | Require source discovery and editor integration. Adding markers does not automatically register them. |

The source injector recognizes the six named Facet components imported from `@flanksource/facet` or its subpaths, including import aliases and namespace imports. It also recognizes the SVG tags listed in `apps/playground/src/visual-edit/svg-schemas.ts`. Eligible JSX must live under the playground's `src/pages`, including its helper modules. SVG definitions and resources are excluded from diagram selection.

React Grab also offers a CSS editor for other DOM elements. Opening that editor does not establish a source-save binding for a custom component.

## 1. Give each editable value an intentional prop

Prefer scalar text, number, boolean, and enum props for values an author should change. Keep IDs, lookup keys, and arrow anchors separate from display text.

For example, a callout can use `id="sql-procedure"` for its anchor and `title="Create_Class"` for its display name. Editing the title must leave the ID unchanged. In the OIPA exploded-callout example, `frameNamed(...)` looks up a frame by its name; blindly replacing the displayed string can break that lookup. Expose a separate display prop before enabling that edit, or introduce a stable data identity and an explicit binding to its display field.

Decide whether a prop edit changes this call site or shared source data. A repeated call site can render multiple instances; the editor must disclose their shared scope. Shared-data edits need a known source binding and their wider effect must be visible to the author.

### Compose an existing editable primitive

For a new component that fits a Facet node, delegate to that node:

```tsx
import { BoxNode } from "@flanksource/facet";

type CalloutProps = {
  id: string;
  title: string;
  body: string;
} & { [attribute: `data-${string}`]: string | undefined };

export function Callout({ id, title, body, ...dataAttributes }: CalloutProps) {
  return (
    <BoxNode
      {...dataAttributes}
      id={id}
      variant="card"
      title={title}
      description={body}
    />
  );
}
```

Put the helper under `apps/playground/src/pages` and render it from a page with literal text props, for example `<Callout id="sql-procedure" title="Create_Class" body="Procedure rejected the arguments" />`. The injector recognizes the inner `BoxNode`; its existing markers identify the text and variant.

The source marker belongs to that inner `BoxNode` call site. This does not register `Callout` as a new component. A variant change there affects the wrapper's shared implementation; computed text is subject to the existing literal resolver and may require a source choice or be refused. Use this composition when those ownership rules match the intended behavior.

## 2. Preserve the root's source identity

Accept `data-*` props and forward them to the existing root element that represents the component. Preserve its ID and geometry so arrows remain attached. Avoid an extra wrapper solely for editing.

`data-editable-source` is injected by the playground compiler. Its file, line, column, ordinal, and hash identify the JSX call site. Never hand-author the attribute or construct a marker string. The injector and save handler must use the same element discovery and ordinal sequence.

The current Facet root markers are:

| Root marker | Current value attribute | Allowed style values |
| --- | --- | --- |
| `data-editable-box="variant"` | `data-box-style` | `BOX_STYLES` |
| `data-editable-container="variant"` | `data-container-style` | `CONTAINER_STYLES` |
| `data-editable-box="role"` or `data-editable-container="role"` | `data-role` | `DIAGRAM_ROLES` |

These markers describe the existing Facet protocol. A custom HTML root using a different property model needs a corresponding discovery and editor integration; it should not claim to be a Facet box just to become selectable.

## 3. Mark the exact text produced by a prop

Within a recognized editable root, put `data-editable-text="<prop>"` on the element containing exactly that prop's text:

```tsx
<span data-editable-text="title" className="uppercase">
  {title}
</span>
```

The marker names a component prop, not a DOM attribute. The current text-editing path uses direct prop names; a string such as `frame.name` does not provide nested-property editing.

- Mark only plain string or number values. Leave nested React elements unmarked so editing cannot flatten them.
- Put icons and decorative text outside the marked span.
- Use CSS text transformation for uppercase presentation rather than marking the result of `title.toUpperCase()`. The underlying text should still equal the prop value.
- Give nested editable components their own roots. Text belongs to its nearest editable root, not every ancestor.
- Expose explicit display props for derived values instead of asking the editor to reverse arbitrary calculations.

## 4. Describe property controls

A [JSON Schema form](/guides/json-schema-form/) can render a controlled property panel. This example describes an intended callout property surface; registering it for custom-component source editing is future integration work:

```tsx
import type { JsonSchemaObject } from "@flanksource/clicky-ui/components";

export const calloutProperties: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", title: "Title" },
    body: { type: "string", title: "Body", format: "textarea" },
    textColor: {
      type: "string",
      title: "Text color",
      format: "color",
      description: "A CSS color or theme variable, such as var(--foreground).",
    },
    padding: {
      type: "number",
      title: "Padding",
      minimum: 0,
      "x-number-display": "stepper",
    },
    emphasis: { type: "string", title: "Emphasis", enum: ["normal", "strong"] },
    className: { type: "string", title: "Classes" },
  },
};
```

The component must accept and apply every declared property. A schema does not implement the visual behavior, register a source target, validate a server write, or automatically supply the SVG editor's Tailwind/theme picker.

Keep theme variables and class expressions intact when saving. Let an explicit color prop control the intended color target; avoid inline defaults that silently override editable classes. Follow the [JSON Schema extension reference](/reference/json-schema-form-extensions/) for control hints. Use `type: "number"` with `x-number-display: "stepper"` for decimal values with one-unit increments; `multipleOf: 1` is an integer constraint.

## 5. Connect discovery, preview, and persistence

### Current integration points

| Responsibility | Playground source |
| --- | --- |
| Recognize JSX components and resolve aliases | `plugins/editable-jsx.ts` |
| Inject call-site markers | `plugins/editable-source-plugin.ts` |
| Discover DOM roots and text parts | `src/visual-edit/editable-dom.ts` |
| Select targets and render editors | `src/visual-edit/VisualEditOverlay.tsx`, `src/PlaygroundShell.tsx` |
| Preview and restore component props | `src/visual-edit/react-override.ts`, `src/visual-edit/useVisualEdits.ts` |
| Validate requests and rewrite source | `plugins/visual-edits-server.ts`, `plugins/visual-edit-source.ts` |

Paths in this table are relative to `apps/playground`. Extending the existing Facet set requires updating the recognized component identities and import resolution together with the component's root/text markers. Arbitrary HTML roots and arbitrary property schemas also require client selection, editor dispatch, and server validation support. Adding a name to `EDITABLE_COMPONENTS` alone is insufficient.

Current Facet style edits support `variant` and `role`. They replace or insert literal values and refuse computed values or overriding spreads. Text edits first try a matching literal prop, then search displayable literals in the page's module graph; ambiguous matches require a choice. This resolver is not a general data-binding engine. Do not use it to guess which lookup key or shared record a display value owns.

Source writes check hashes and refuse stale edits. Keep that behavior when adding support. Preview must update React props and restore their exact original values on Revert or failure; a DOM-only mutation is not sufficient evidence that an edit will survive a rerender or reload.

### Proposed generic component contract — not implemented

The intended onboarding process is to declare a component once in a catalog shared by the compiler, editor, and server. Each entry would identify its module/component, editable prop schema, text mappings, and source ownership. Authors would forward the source marker and annotate their text elements without modifying multiple hardcoded lists.

That catalog and a general custom-component property-save API do not exist yet. There is no registration helper to import today. Implementing them must include schema validation on the server, explicit reset behavior, shared-instance scope, and atomic text/property saves. Keep proposed metadata separate from claims about currently supported APIs.

## 6. Verify a new editable component

- Confirm its page/helper is discovered and its rendered root carries the injected source marker.
- Select the component through both Design mode and React Grab's Style element action.
- Edit each marked text part independently, including empty text where supported, without replacing nested elements or icons.
- Preview properties, then exercise Save, reload, Revert, dismissal, and failed writes. Confirm decimals remain decimals and resets restore the intended class or inheritance behavior.
- Check repeated instances, ambiguous literals, computed props, spreads, and stale source. Failures must explain the source location and offer the appropriate recovery action.
- Confirm stable IDs, data lookups, and arrow endpoints remain unchanged after display edits.
- Inspect light/dark themes, desktop and compact layouts, and the scope of edits shared by several instances.

Use the exact page under review. The OIPA example is `http://localhost:5274/?page=flanksource%2Ffacet-diagrams&tab=oipa`, **4b · Alt D. Wide, exploded callouts**. Its custom HTML callouts remain an integration task; this guide does not enable them.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Root has no source marker | Confirm the JSX is under `src/pages`, its component/import is recognized, and data props reach the visible root. |
| Root has a marker but cannot be selected | Confirm the DOM discovery protocol supports its root type; source identity alone does not define an editor. |
| Text cannot be edited | Confirm a recognized root owns the exact scalar text element and its marker names a direct prop. |
| Property schema renders but Save is unavailable | The property surface needs a supported edit request, source binding, and server validation. |
| Edit is refused or asks for a source choice | Inspect computed expressions, spreads, duplicate literals, and the ownership of shared data. |
| Saved style has no visible effect | Inspect computed styles for inline overrides, conflicting utilities, theme scope, and whether the component applies the edited prop. |
| Preview works but reload loses the change | Verify the write succeeded against the intended source file; preview alone does not persist it. |
| Source changed after rendering | Reload before editing again; do not bypass the stale-source check. |
