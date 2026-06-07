import { type ReactNode } from "react";
import {
  FieldLabel,
  FieldWrapper,
  fieldInputId,
  renderValueControl,
} from "./json-schema-form-fields";
import { effectiveProperties, resolveControl } from "./json-schema-form-resolve";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
  PostExtension,
  PreExtension,
} from "./json-schema-form-types";

// RenderContext carries everything the recursive renderer needs to descend into
// array items and object/map values: readOnly/inline layout, the consumer's
// pre/post extension stacks (so they apply at EVERY depth, not just the top
// level), and the current depth (for keys/labels).
export interface RenderContext {
  readOnly: boolean;
  inline: boolean;
  pre: PreExtension[];
  post: PostExtension[];
  depth: number;
}

// runExtensions resolves a control, applies the pre-extensions (any returning
// null drops the field), renders the value node, then applies the
// post-extensions to the {label, value} node pair.
function buildField(
  args: { key: string; prop: JsonSchemaProperty; required: boolean; value: unknown; onChange: (next: unknown) => void },
  ctx: RenderContext,
): { field: FieldControl; label: ReactNode; value: ReactNode } | null {
  const base = resolveControl(args);
  let field: FieldControl | null = base;
  for (const ext of ctx.pre) {
    if (!field) break;
    field = ext(field, { key: args.key, prop: args.prop, value: args.value });
  }
  if (!field) return null;

  const fieldId = fieldInputId(field.key);
  let label: ReactNode = <FieldLabel field={field} fieldId={fieldId} />;
  let value: ReactNode = renderValueControl(field, ctx);
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
  args: { key: string; prop: JsonSchemaProperty; required: boolean; value: unknown; onChange: (next: unknown) => void },
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
  args: { key: string; prop: JsonSchemaProperty; required: boolean; value: unknown; onChange: (next: unknown) => void },
  ctx: RenderContext,
  opts?: { labelOverride?: string },
): ReactNode | null {
  const built = buildField(args, ctx);
  if (!built) return null;
  const { field } = built;
  const label = opts?.labelOverride ? (
    <span className="flex items-center gap-2 text-sm font-medium">
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
      inline={ctx.inline}
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
  return Object.entries(properties).flatMap(([key, prop]) => {
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
    return row ? [<div key={key}>{row}</div>] : [];
  });
}

// softError computes a display-only validation hint. It never blocks onChange.
// Consumers suppress the unknown-enum hint by setting allowCustomValue.
export function softError(field: FieldControl): string | undefined {
  const v = field.value;
  const isEmpty = v === undefined || v === null || v === "";
  if (field.required && isEmpty) return "Required";

  if (field.kind === "number" && typeof field.minimum === "number" && typeof v === "number") {
    if (v < field.minimum) return `Must be ≥ ${field.minimum}`;
  }

  if (field.kind === "enum" && !field.allowCustomValue && !isEmpty) {
    const known = (field.options ?? []).some((o) => o.value === String(v));
    if (!known) return "Unknown value (allowed)";
  }
  return undefined;
}

// Immutable array helpers used by the array control.
export function setIndex<T>(arr: T[], i: number, v: T): T[] {
  return arr.map((x, idx) => (idx === i ? v : x));
}

export function removeIndex<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

// seedFromSchema produces the initial value for a freshly-added array item or
// object field, honouring an explicit default.
export function seedFromSchema(schema: JsonSchemaProperty): unknown {
  if (schema.default !== undefined) return schema.default;
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "array") return [];
  if (type === "object") return {};
  if (type === "boolean") return false;
  // Numbers seed as "" so the soft Required hint can show without coercion
  // surprises; the number control coerces on first real input.
  return "";
}
