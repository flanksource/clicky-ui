import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import {
  BooleanControl,
  DateControl,
  DisplayControl,
  EnumControl,
  LinkControl,
  LookupControl,
  MarkdownControl,
  NumberControl,
  ReadOnlyValue,
  StringControl,
  TextareaControl,
} from "./json-schema-form-fields";
import {
  FieldLabel,
  FieldWrapper,
  HelpHint,
  ObjectSection,
} from "./json-schema-form-layout";
import { ArrayControl } from "./json-schema-form-array";
import { ObjectControl, StringMapControl } from "./json-schema-form-object";
import { FieldErrorMessages, FieldErrorText } from "./json-schema-form-error-display";
import { appendInstancePath, errorsAtInstancePath } from "./json-schema-form-errors";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import { applyPostExtensions } from "./json-schema-form-extensions";
import { effectiveProperties, resolveControl, schemaRendersAsObject } from "./json-schema-form-resolve";
import type {
  FieldArgs,
  FieldControl,
  HelpDisplay,
  JsonSchemaObject,
  JsonSchemaProperty,
  RenderApi,
  RenderContext,
} from "./json-schema-form-types";
import {
  fieldErrorId,
  fieldInputId,
  matchesFieldFilter,
  normalizeColSpan,
  normalizeColumns,
  orderByClickyOrder,
  orderByPriority,
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
  // ctx.instancePath is the field's own path here: buildField descends into the
  // child context before rendering the value.
  const fieldId = fieldInputId(ctx.instancePath, ctx.idPrefix);
  // A field the schema marks `readOnly` is never editable: it shows its current
  // value as plain text, not a disabled input. (The form-level ctx.readOnly,
  // below, instead disables the real controls so the structure stays visible.)
  // Containers (array/object/map) still render structurally so nested read-only
  // values surface, and textarea/display/link own their non-editable rendering
  // (multi-line text / static element / hyperlink), so all of these are excluded
  // from the plain ReadOnlyValue fallback.
  if (field.readOnly && !ownsReadOnlyRendering(field.kind)) {
    return <ReadOnlyValue field={field} fieldId={fieldId} size={ctx.size} />;
  }
  const readOnly = ctx.readOnly || field.readOnly === true;
  const size = ctx.size;
  switch (field.kind) {
    case "enum":
      return <EnumControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "lookup":
      return (
        <LookupControl
          field={field}
          fieldId={fieldId}
          readOnly={readOnly}
          size={size}
          {...(ctx.rootValue ? { rootValue: ctx.rootValue } : {})}
        />
      );
    case "boolean":
      return <BooleanControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "number":
      return <NumberControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "date":
      return <DateControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "textarea":
      return <TextareaControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "markdown":
      return <MarkdownControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
    case "display":
      return <DisplayControl field={field} size={size} />;
    case "link":
      return <LinkControl field={field} fieldId={fieldId} size={size} />;
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

// ownsReadOnlyRendering reports whether a control renders its own non-editable
// form, so the renderer must not pre-empt it with the plain ReadOnlyValue text:
// containers recurse structurally, and textarea/display/link have bespoke
// read-only output.
function ownsReadOnlyRendering(kind: FieldControl["kind"]): boolean {
  return (
    kind === "array" ||
    kind === "object" ||
    kind === "string-map" ||
    kind === "textarea" ||
    kind === "markdown" ||
    kind === "display" ||
    kind === "link"
  );
}

// buildField resolves a control, applies the pre-extensions (any returning
// null drops the field), renders the value node, then applies the
// post-extensions to the {label, value} node pair.
function buildField(
  args: FieldArgs,
  ctx: RenderContext,
): {
  field: FieldControl;
  fieldId: string;
  label: ReactNode;
  value: ReactNode;
  messages: JsonSchemaFormError[];
  help: HelpDisplay;
} | null {
  const base = resolveControl(args);
  let field: FieldControl | null = base;
  for (const ext of ctx.pre) {
    if (!field) break;
    field = ext(field, {
      key: args.key,
      prop: args.prop,
      value: args.value,
      ...(ctx.rootValue ? { rootValue: ctx.rootValue } : {}),
      ...(ctx.onRootChange ? { onRootChange: ctx.onRootChange } : {}),
    });
  }
  if (!field) return null;
  // Drop read-only fields entirely when the form opts out of displaying them.
  // Checked after pre-extensions so an extension that sets/clears readOnly wins.
  if (ctx.hideReadOnlyFields && field.readOnly) return null;

  const instancePath = args.instancePath ?? appendInstancePath(ctx.instancePath, args.key);
  const fieldId = fieldInputId(instancePath, ctx.idPrefix);
  // Resolve this field's errors before rendering its control, so the control can
  // carry aria-invalid / aria-describedby rather than leaving the error text
  // visually adjacent but programmatically unassociated. Host-supplied errors
  // and the locally-derived soft hint (e.g. "Required" on an empty required
  // field) are one validation state: either one marks the field invalid and is
  // rendered into the aria-describedby target, so a locally-invalid field is
  // never invalid only to sighted users. softError reads value/required/kind —
  // never `invalid` — so deriving it from `field` here is not circular.
  const errors = errorsAtInstancePath(ctx.errors, instancePath);
  const soft = errors.length === 0 ? softError(field) : undefined;
  const messages: JsonSchemaFormError[] =
    errors.length > 0 ? errors : soft ? [{ instancePath, message: soft }] : [];
  if (messages.length > 0) field = { ...field, invalid: true };
  // A field's own x-help-display wins over the form-level setting; both default
  // to the permanent paragraph every form renders today.
  const help = field.helpDisplay ?? ctx.layout.help ?? "inline";
  let label: ReactNode = (
    <FieldLabel field={field} fieldId={fieldId} size={ctx.size} helpDisplay={help} />
  );
  // A field's `x-layout: inline|stack` overrides the form-level layout for its
  // own value subtree (the field's own row keeps the parent layout). "table" is
  // handled structurally inside the array/string-map controls, not here.
  const overrideMode =
    field.layout === "inline" ? "inline" : field.layout === "stack" ? "stacked" : undefined;
  const valueCtx: RenderContext = {
    ...ctx,
    instancePath,
    ...(overrideMode ? { layout: { ...ctx.layout, mode: overrideMode } } : {}),
  };
  let value: ReactNode = renderValueControl(field, valueCtx);
  const postCtx = {
    ...(ctx.rootValue ? { rootValue: ctx.rootValue } : {}),
    ...(ctx.onRootChange ? { onRootChange: ctx.onRootChange } : {}),
    instancePath,
  };
  ({ label, value } = applyPostExtensions(
    field,
    { label, value },
    ctx.post,
    postCtx,
  ));
  return { field, fieldId, label, value, messages, help };
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
  return {
    label: built.label,
    value:
      built.messages.length > 0 ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          {built.value}
          <FieldErrorText id={fieldErrorId(built.fieldId)} errors={built.messages} />
        </div>
      ) : (
        built.value
      ),
  };
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
  // An accordion joins this list: crammed into the 600px inline value column it
  // is unusable, and it needs the ObjectSection header to carry the array's own
  // title, required marker and help. Cards are the same shape of thing — a
  // full-width stack of item panels — so they join it too.
  if (
    field.kind === "object" ||
    field.layout === "table" ||
    field.arrayDisplay === "accordion" ||
    field.arrayDisplay === "cards"
  ) {
    return (
      <ObjectSection
        label={opts?.labelOverride ?? field.label}
        required={field.required}
        size={ctx.size}
        helpDisplay={built.help}
        {...(field.badge ? { badge: field.badge } : {})}
        {...(field.helper ? { helper: field.helper } : {})}
        {...(field.labelIcon != null ? { labelIcon: field.labelIcon } : {})}
      >
        <FieldErrorText
          id={fieldErrorId(built.fieldId)}
          errors={built.messages}
          className="min-w-0 break-words"
        />
        {built.value}
      </ObjectSection>
    );
  }
  // A display field (heading/divider/info/spacer) is the label — it carries no
  // value column, so it spans the full grid width with no inline label cell.
  if (field.kind === "display") {
    return <div className="col-span-full">{built.value}</div>;
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
      {/* Without this the `?` silently disappears for relabelled rows (array
          items), taking the description with it — FieldWrapper has already
          dropped the paragraph by then. */}
      {built.help === "hover" && field.helper && (
        <HelpHint label={opts.labelOverride} helper={field.helper} />
      )}
    </span>
  ) : (
    built.label
  );
  // One rendering path for both sources, so the soft hint lands in the same
  // fieldErrorId element the control's aria-describedby already points at.
  const err =
    built.messages.length > 0 ? (
      <FieldErrorMessages id={fieldErrorId(built.fieldId)} errors={built.messages} />
    ) : undefined;
  return (
    <FieldWrapper
      layout={ctx.layout}
      size={ctx.size}
      label={label}
      value={built.value}
      {...(field.colSpan === "full" ? { maxWidth: "none" } : {})}
      {...(field.helper && built.help !== "hover" ? { helper: field.helper } : {})}
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
  // Per-property `x-clicky-order` wins (composes across merged branches); the
  // object-level `x-order` array is the fallback; document order otherwise.
  const ordered = orderByClickyOrder(orderByXOrder(Object.entries(properties), schema["x-order"]));
  const sorted =
    ctx.sortMode === "required-first"
      ? orderRequiredFirst(ordered, required)
      : ctx.sortMode === "priority"
        ? orderByPriority(ordered, required, value)
        : ordered;
  // The field filter narrows only the outermost object level (depth 0); nested
  // object subtrees render in full so a matched parent keeps all its children.
  const entries =
    ctx.depth === 0 && ctx.fieldFilter
      ? sorted.filter(([key, prop]) => matchesFieldFilter(key, prop, ctx.fieldFilter!))
      : sorted;
  // Object-level `x-columns` lays the fields out in a multi-column stacked grid;
  // each field spans `x-col-span` columns (object sections/table arrays span the
  // full row). Only takes effect in stacked mode — inline owns its 2-track grid.
  const columns = ctx.layout.mode === "inline" ? 1 : normalizeColumns(schema["x-columns"]);
  return entries.flatMap(([key, prop]) => {
    if (hidden.has(key)) return [];
    const row = renderFieldRow(
      {
        key,
        prop,
        required: required.includes(key),
        value: value[key],
        onChange: (next) => onChange({ ...value, [key]: next }),
        instancePath: appendInstancePath(ctx.instancePath, key),
      },
      ctx,
    );
    if (!row) return [];
    if (columns === "auto" || columns > 1) {
      const span = rendersFullWidth(prop)
        ? "full"
        : normalizeColSpan(prop["x-col-span"], columns);
      return [
        <div
          key={key}
          // Under "auto" the track count only exists at layout time, so a
          // full-width field must say `1 / -1` rather than span a number.
          style={{
            gridColumn: span === "full" ? "1 / -1" : `span ${span} / span ${span}`,
          }}
        >
          {row}
        </div>,
      ];
    }
    // `contents` keeps the keyed wrapper out of the box tree so the row's own
    // node (a subgrid FieldWrapper or a full-width ObjectSection) is a direct
    // child of the FieldsGrid and snaps to its label/value tracks.
    return [<div key={key} className="contents">{row}</div>];
  });
}

// rendersFullWidth reports whether a property renders as a full-width block
// (a structured object → ObjectSection, or an `x-layout: "table"` array/map) so
// a multi-column grid gives it the whole row instead of a single column.
function rendersFullWidth(prop: JsonSchemaProperty): boolean {
  const fixedProperties = effectiveProperties(prop as JsonSchemaObject, {}).properties;
  if (schemaRendersAsObject(prop) && (prop.properties !== undefined || Object.keys(fixedProperties).length > 0)) {
    return true;
  }
  return (
    prop["x-layout"] === "table" ||
    prop["x-array-display"] === "accordion" ||
    prop["x-array-display"] === "cards"
  );
}

// renderApi is the RenderContext injection bundle: the root form stores it on
// the context so container controls can recurse without importing this module.
export const renderApi: RenderApi = {
  renderFieldNodes,
  renderFieldRow,
  renderObjectFields,
};
