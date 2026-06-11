import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import {
  BooleanControl,
  DateControl,
  EnumControl,
  FieldLabel,
  FieldWrapper,
  NumberControl,
  ObjectSection,
  ReadOnlyValue,
  StringControl,
} from "./json-schema-form-fields";
import { ArrayControl } from "./json-schema-form-array";
import { ObjectControl, StringMapControl } from "./json-schema-form-object";
import { effectiveProperties, resolveControl } from "./json-schema-form-resolve";
import type {
  FieldArgs,
  FieldControl,
  JsonSchemaObject,
  RenderApi,
  RenderContext,
} from "./json-schema-form-types";
import {
  fieldInputId,
  orderByXOrder,
  orderRequiredFirst,
  softError,
} from "./json-schema-form-utils";
import { labelSizeClass } from "./json-schema-form-size";

// This module is the top of the json-schema-form graph: it imports the control
// components and dispatches into them, while container controls recurse back in
// only through ctx.render (see RenderApi). Nothing here is a React component,
// so the component modules stay Fast-Refresh-eligible and cycle-free.

// renderValueControl produces just the value node for a field, dispatching on
// its resolved kind. The RenderContext carries readOnly + the pre/post stacks so
// container controls (array/object/map) can recurse with full context.
export function renderValueControl(field: FieldControl, ctx: RenderContext): ReactNode {
  const fieldId = fieldInputId(field.key, ctx.idPrefix);
  // A field the schema marks `readOnly` is never editable: it shows its current
  // value as plain text, not a disabled input. (The form-level ctx.readOnly,
  // below, instead disables the real controls so the structure stays visible.)
  // Containers (array/object/map) still render structurally so nested read-only
  // values surface; their own children resolve their own readOnly.
  if (field.readOnly && field.kind !== "array" && field.kind !== "object" && field.kind !== "string-map") {
    return <ReadOnlyValue field={field} fieldId={fieldId} size={ctx.size} />;
  }
  const readOnly = ctx.readOnly;
  const size = ctx.size;
  switch (field.kind) {
    case "enum":
      return <EnumControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "boolean":
      return <BooleanControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "number":
      return <NumberControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "date":
      return <DateControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "array":
      return <ArrayControl field={field} fieldId={fieldId} ctx={ctx} />;
    case "object":
      return <ObjectControl field={field} ctx={ctx} />;
    case "string-map":
      return <StringMapControl field={field} ctx={ctx} />;
    default:
      return <StringControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
  }
}

// buildField resolves a control, applies the pre-extensions (any returning
// null drops the field), renders the value node, then applies the
// post-extensions to the {label, value} node pair.
function buildField(
  args: FieldArgs,
  ctx: RenderContext,
): { field: FieldControl; label: ReactNode; value: ReactNode } | null {
  const base = resolveControl(args);
  let field: FieldControl | null = base;
  for (const ext of ctx.pre) {
    if (!field) break;
    field = ext(field, { key: args.key, prop: args.prop, value: args.value });
  }
  if (!field) return null;
  // Drop read-only fields entirely when the form opts out of displaying them.
  // Checked after pre-extensions so an extension that sets/clears readOnly wins.
  if (ctx.hideReadOnlyFields && field.readOnly) return null;

  const fieldId = fieldInputId(field.key, ctx.idPrefix);
  let label: ReactNode = <FieldLabel field={field} fieldId={fieldId} size={ctx.size} />;
  // A field's `x-layout: inline|stack` overrides the form-level layout for its
  // own value subtree (the field's own row keeps the parent layout). "table" is
  // handled structurally inside the array/string-map controls, not here.
  const overrideMode =
    field.layout === "inline" ? "inline" : field.layout === "stack" ? "stacked" : undefined;
  const valueCtx: RenderContext = overrideMode
    ? { ...ctx, layout: { ...ctx.layout, mode: overrideMode } }
    : ctx;
  let value: ReactNode = renderValueControl(field, valueCtx);
  for (const ext of ctx.post) {
    const next = ext(field, { label, value });
    label = next.label;
    value = next.value;
  }
  return { field, label, value };
}

// renderFieldNodes runs the full pipeline and returns the raw {label, value}
// nodes (no FieldWrapper). Used where the caller arranges layout itself — map
// rows (value only) and scalar array items.
export function renderFieldNodes(
  args: FieldArgs,
  ctx: RenderContext,
): { label: ReactNode; value: ReactNode } | null {
  const built = buildField(args, ctx);
  if (!built) return null;
  return { label: built.label, value: built.value };
}

// renderFieldRow runs the pipeline and wraps it in a FieldWrapper with the soft
// validation hint. `labelOverride` lets a container relabel a field that has no
// natural key (e.g. array items → "Item 1").
export function renderFieldRow(
  args: FieldArgs,
  ctx: RenderContext,
  opts?: { labelOverride?: string },
): ReactNode | null {
  const built = buildField(args, ctx);
  if (!built) return null;
  const { field } = built;
  // Object fields — and table-laid-out arrays/string-maps — render as a flat
  // section: a header followed by their body at full width, rather than an
  // inline label + narrow value column. This keeps deep schemas (e.g. policy →
  // shape, asfile → params) readable as a single column of labelled sections,
  // and gives a `x-layout: "table"` array the full width its columns need
  // instead of cramming it into the inline value column.
  if (field.kind === "object" || field.layout === "table") {
    return (
      <ObjectSection
        label={opts?.labelOverride ?? field.label}
        required={field.required}
        size={ctx.size}
        {...(field.badge ? { badge: field.badge } : {})}
        {...(field.helper ? { helper: field.helper } : {})}
        {...(field.labelIcon != null ? { labelIcon: field.labelIcon } : {})}
      >
        {built.value}
      </ObjectSection>
    );
  }
  const label = opts?.labelOverride ? (
    <span className={cn("flex items-center gap-2 font-medium", labelSizeClass[ctx.size])}>
      <LabelIcon icon={field.labelIcon} className="text-[15px] text-muted-foreground" />
      <span>{opts.labelOverride}</span>
      {field.required && <span className="text-destructive">*</span>}
      {field.badge && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {field.badge}
        </span>
      )}
    </span>
  ) : (
    built.label
  );
  const err = softError(field);
  return (
    <FieldWrapper
      layout={ctx.layout}
      size={ctx.size}
      label={label}
      value={built.value}
      {...(field.helper ? { helper: field.helper } : {})}
      {...(err ? { error: err } : {})}
    />
  );
}

// renderObjectFields maps an object subschema's effective properties to field
// rows. It is the recursive heart, shared by the top-level form and the nested
// ObjectControl. Edits spread immutably onto the object.
export function renderObjectFields(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  onChange: (next: Record<string, unknown>) => void,
  ctx: RenderContext,
  opts?: { hiddenKeys?: string[] },
): ReactNode[] {
  const { properties, required } = effectiveProperties(schema, value);
  const hidden = new Set(opts?.hiddenKeys ?? []);
  const ordered = orderByXOrder(Object.entries(properties), schema["x-order"]);
  const entries = ctx.requiredFirst ? orderRequiredFirst(ordered, required) : ordered;
  return entries.flatMap(([key, prop]) => {
    if (hidden.has(key)) return [];
    const row = renderFieldRow(
      {
        key,
        prop,
        required: required.includes(key),
        value: value[key],
        onChange: (next) => onChange({ ...value, [key]: next }),
      },
      ctx,
    );
    // `contents` keeps the keyed wrapper out of the box tree so the row's own
    // node (a subgrid FieldWrapper or a full-width ObjectSection) is a direct
    // child of the FieldsGrid and snaps to its label/value tracks.
    return row ? [<div key={key} className="contents">{row}</div>] : [];
  });
}

// renderApi is the RenderContext injection bundle: the root form stores it on
// the context so container controls can recurse without importing this module.
export const renderApi: RenderApi = {
  renderFieldNodes,
  renderFieldRow,
  renderObjectFields,
};
