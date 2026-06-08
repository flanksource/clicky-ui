import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, LabelIcon } from "../data/Icon";
import { formatDateTimeRelative } from "../data/cells/Timestamp";
import { UiAdd, UiTrash } from "../icons";
import { Button } from "./button";
import { Combobox } from "./Combobox";
import { DateTimePicker } from "./DateTimePicker";
import { ArrayControl } from "./json-schema-form-array";
import { renderFieldNodes, renderObjectFields, type RenderContext } from "./json-schema-form-render";
import type {
  FieldControl,
  FieldOption,
  FormLayout,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

export const inputClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";

// FieldWrapper lays out a label + value (+ helper/error) either inline (2-col)
// or stacked, mirroring the convention used elsewhere in the library. In inline
// mode the label and value columns are capped (see FormLayout); the grid
// template is set inline because Tailwind can't interpolate runtime widths.
export function FieldWrapper({
  label,
  value,
  helper,
  error,
  layout,
}: {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  layout: FormLayout;
}) {
  if (layout.mode === "inline") {
    const labelMaxWidth = layout.labelMaxWidth ?? "40ch";
    const valueMaxWidth = layout.valueMaxWidth ?? "400px";
    return (
      <div
        className="grid items-start gap-x-3 gap-y-0.5"
        style={{ gridTemplateColumns: `minmax(0, ${labelMaxWidth}) minmax(0, ${valueMaxWidth})` }}
      >
        <div className="flex min-h-9 min-w-0 items-center">{label}</div>
        <div className="min-w-0">{value}</div>
        {helper && <p className="col-start-2 text-xs text-muted-foreground">{helper}</p>}
        {error && <p className="col-start-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {label}
      {value}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FieldLabel({ field, fieldId }: { field: FieldControl; fieldId: string }) {
  return (
    <label htmlFor={fieldId} className="flex items-center gap-2 text-sm font-medium">
      <LabelIcon icon={field.labelIcon} className="text-[15px] text-muted-foreground" />
      <span title={field.label !== field.key ? field.key : undefined}>{field.label}</span>
      {field.required && <span className="text-destructive">*</span>}
      {field.badge && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {field.badge}
        </span>
      )}
    </label>
  );
}

export function fieldInputId(key: string): string {
  return `jsf-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

// renderValueControl produces just the value node for a field, dispatching on
// its resolved kind. The RenderContext carries readOnly + the pre/post stacks so
// container controls (array/object/map) can recurse with full context.
export function renderValueControl(field: FieldControl, ctx: RenderContext): ReactNode {
  const fieldId = fieldInputId(field.key);
  // A field the schema marks `readOnly` is never editable: it shows its current
  // value as plain text, not a disabled input. (The form-level ctx.readOnly,
  // below, instead disables the real controls so the structure stays visible.)
  // Containers (array/object/map) still render structurally so nested read-only
  // values surface; their own children resolve their own readOnly.
  if (field.readOnly && field.kind !== "array" && field.kind !== "object" && field.kind !== "string-map") {
    return <ReadOnlyValue field={field} fieldId={fieldId} />;
  }
  const readOnly = ctx.readOnly;
  switch (field.kind) {
    case "enum":
      return <EnumControl field={field} fieldId={fieldId} readOnly={readOnly} />;
    case "boolean":
      return <BooleanControl field={field} fieldId={fieldId} readOnly={readOnly} />;
    case "number":
      return <NumberControl field={field} fieldId={fieldId} readOnly={readOnly} />;
    case "date":
      return <DateControl field={field} fieldId={fieldId} readOnly={readOnly} />;
    case "array":
      return <ArrayControl field={field} fieldId={fieldId} ctx={ctx} />;
    case "object":
      return <ObjectControl field={field} ctx={ctx} />;
    case "string-map":
      return <StringMapControl field={field} ctx={ctx} />;
    default:
      return <StringControl field={field} fieldId={fieldId} readOnly={readOnly} />;
  }
}

// ReadOnlyValue renders a `readOnly` field's current value as static text — no
// input, no border, just the value (date/date-time formatted human-readably).
// An empty value shows an em-dash. Carries the same id + data-jsf-input as the
// editable controls so layout and queries stay uniform.
function ReadOnlyValue({ field, fieldId }: { field: FieldControl; fieldId: string }) {
  const text = toText(field.value);
  const display = field.kind === "date" && text ? formatDateTimeRelative(text) : text;
  return (
    <span
      id={fieldId}
      data-jsf-input
      data-jsf-readonly
      className="flex h-9 items-center text-sm text-foreground"
      title={text || undefined}
    >
      {display || <span className="text-muted-foreground">—</span>}
    </span>
  );
}

function StringControl({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  return (
    <input
      id={fieldId}
      type="text"
      data-jsf-input
      className={inputClassName}
      value={toText(field.value)}
      disabled={readOnly}
      placeholder={defaultPlaceholder(field.schema)}
      onChange={(e) => field.onChange(e.target.value)}
    />
  );
}

function NumberControl({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  // type="text" (not number) so non-numeric values a consumer permits — e.g.
  // template tokens — are not silently dropped by the browser.
  return (
    <input
      id={fieldId}
      type="text"
      inputMode="decimal"
      data-jsf-input
      className={inputClassName}
      value={toText(field.value)}
      disabled={readOnly}
      placeholder={defaultPlaceholder(field.schema)}
      onChange={(e) => {
        const raw = e.target.value;
        const coerce = field.coerceNumber !== false;
        if (coerce && raw.trim() !== "" && Number.isFinite(Number(raw))) {
          field.onChange(Number(raw));
        } else {
          field.onChange(raw);
        }
      }}
    />
  );
}

// DateControl edits a `format: date`/`date-time` string. Read-only, it shows the
// human-readable absolute + relative form (e.g. "Apr 15, 2026, 12:00 PM (2h
// ago)"); editable, a DateTimePicker. The raw string is committed unchanged so a
// consumer-permitted template token in the field is preserved.
function DateControl({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  const text = toText(field.value);
  if (readOnly) {
    return (
      <div
        id={fieldId}
        data-jsf-input
        className="flex h-9 items-center text-sm text-foreground"
        title={text || undefined}
      >
        {text ? formatDateTimeRelative(text) : <span className="text-muted-foreground">—</span>}
      </div>
    );
  }
  return (
    <DateTimePicker
      id={fieldId}
      aria-label={field.label}
      data-jsf-input
      inputClassName={cn(inputClassName, "pr-8")}
      value={text}
      onChange={(next) => field.onChange(next)}
      placeholder={defaultPlaceholder(field.schema)}
    />
  );
}

function BooleanControl({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  // Only render a checkbox when the value is genuinely boolean (or unset).
  // A non-boolean value (e.g. a token a consumer left in place) renders as text
  // so it is preserved and editable.
  if (typeof field.value === "boolean" || field.value === undefined || field.value === null) {
    return (
      <div className="flex h-9 items-center">
        <input
          id={fieldId}
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={field.value === true}
          disabled={readOnly}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      </div>
    );
  }
  return <StringControl field={field} fieldId={fieldId} readOnly={readOnly} />;
}

function EnumControl({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  const value = toText(field.value);
  const options = withSyntheticValue(field.options ?? [], value);
  if (field.display === "radio") {
    return <RadioGroupControl field={field} fieldId={fieldId} readOnly={readOnly} options={options} value={value} />;
  }
  return (
    <Combobox
      id={fieldId}
      options={options}
      value={value}
      disabled={readOnly}
      allowCustomValue={field.allowCustomValue ?? false}
      onChange={(v) => field.onChange(v)}
      {...(defaultPlaceholder(field.schema) ? { placeholder: defaultPlaceholder(field.schema) } : {})}
    />
  );
}

// RadioGroupControl renders a small fixed enum as a segmented radio-button group
// instead of a dropdown. It shares EnumControl's option list (any out-of-enum
// value is already prepended, so a token still shows). One `radiogroup` role +
// native radios keep it keyboard-navigable; the visible chip is a styled label.
function RadioGroupControl({
  field,
  fieldId,
  readOnly,
  options,
  value,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  options: FieldOption[];
  value: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      id={fieldId}
      data-jsf-input
      className="inline-flex flex-wrap items-center gap-1 rounded-md border border-input bg-background p-0.5"
    >
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              "inline-flex cursor-pointer select-none items-center rounded px-2.5 py-1 text-sm",
              checked
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              readOnly && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="radio"
              name={fieldId}
              className="sr-only"
              value={opt.value}
              checked={checked}
              disabled={readOnly}
              onChange={() => field.onChange(opt.value)}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

// ObjectControl renders a nested structured object as a sub-form: its own
// properties, required markers, if/then, soft errors — all via the shared
// recursive renderer, so pre/post extensions apply at this depth too.
function ObjectControl({ field, ctx }: { field: FieldControl; ctx: RenderContext }) {
  const obj = isPlainObject(field.value) ? (field.value as Record<string, unknown>) : {};
  const subSchema: JsonSchemaObject = {
    type: "object",
    properties: field.objectProperties ?? {},
    ...(field.objectRequired ? { required: field.objectRequired } : {}),
    ...(Array.isArray(field.schema.allOf) ? { allOf: field.schema.allOf } : {}),
  };
  // No border/box: nested objects render as flat headed sections (see
  // ObjectSection in renderFieldRow) rather than progressively indented
  // sub-forms, so deep schemas stay readable as a single column.
  // A read-only object marks its whole subtree non-editable: recurse with
  // form-level readOnly on so child inputs are disabled (and any child the
  // schema marks readOnly still renders as a value span).
  return (
    <div className="space-y-2">
      {renderObjectFields(subSchema, obj, (next) => field.onChange(next), {
        ...ctx,
        readOnly: ctx.readOnly || field.readOnly === true,
        depth: ctx.depth + 1,
      })}
    </div>
  );
}

// StringMapControl edits an object as key/value rows. Known properties (from the
// schema) render first with derived value controls; unknown keys render as
// editable key/value pairs. "Add field" appears when extra keys are allowed.
// Values recurse through the shared pipeline, so a value that is itself an object
// or array renders structurally and pre/post extensions apply to it.
function StringMapControl({ field, ctx }: { field: FieldControl; ctx: RenderContext }) {
  // A read-only map marks its whole subtree non-editable: no rename/remove/add
  // and value inputs disabled.
  const readOnly = ctx.readOnly || field.readOnly === true;
  const map = isPlainObject(field.value) ? (field.value as Record<string, unknown>) : {};
  const known = field.knownProperties ?? {};
  const knownKeys = Object.keys(known);
  const extraKeys = Object.keys(map).filter((k) => !(k in known));
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };

  function setEntry(key: string, next: unknown) {
    field.onChange({ ...map, [key]: next });
  }
  function renameEntry(oldKey: string, newKey: string) {
    if (newKey === oldKey) return;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map)) next[k === oldKey ? newKey : k] = v;
    field.onChange(next);
  }
  function removeEntry(key: string) {
    const next = { ...map };
    delete next[key];
    field.onChange(next);
  }
  function addEntry() {
    if ("" in map) return;
    field.onChange({ ...map, "": "" });
  }

  function valueControlFor(key: string, valueSchema: JsonSchemaProperty): ReactNode {
    const nodes = renderFieldNodes(
      {
        key,
        prop: valueSchema,
        required: false,
        value: map[key] ?? "",
        onChange: (next) => setEntry(key, next),
      },
      childCtx,
    );
    return nodes?.value ?? null;
  }

  return (
    <div className="space-y-2 rounded-md border border-input p-2">
      {knownKeys.map((key) => (
        <div key={`known-${key}`} className="grid grid-cols-[10rem_1fr] items-center gap-2">
          <label htmlFor={fieldInputId(key)} className="truncate text-xs text-muted-foreground" title={key}>
            {key}
          </label>
          <div className="min-w-0">{valueControlFor(key, known[key] ?? { type: "string" })}</div>
        </div>
      ))}
      {extraKeys.map((key) => (
        <div key={`extra-${key}`} className="grid grid-cols-[10rem_1fr_auto] items-center gap-2">
          <input
            type="text"
            aria-label="Field name"
            className={cn(inputClassName, "h-8 font-mono text-xs")}
            value={key}
            disabled={readOnly}
            onChange={(e) => renameEntry(key, e.target.value)}
          />
          <div className="min-w-0">
            {valueControlFor(key, field.valueSchema ?? { type: "string" })}
          </div>
          {!readOnly && (
            <button
              type="button"
              aria-label={`Remove ${key}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => removeEntry(key)}
            >
              <Icon icon={UiTrash} className="text-sm" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && field.allowExtraKeys !== false && (
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
          <Icon icon={UiAdd} className="text-sm" />
          Add field
        </Button>
      )}
    </div>
  );
}

function withSyntheticValue(
  options: { value: string; label: string }[],
  value: string,
): { value: string; label: string }[] {
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ value, label: value }, ...options];
}

function toText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return "";
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function defaultPlaceholder(schema: JsonSchemaProperty): string {
  if (schema.default != null && typeof schema.default !== "object") return String(schema.default);
  return "";
}
