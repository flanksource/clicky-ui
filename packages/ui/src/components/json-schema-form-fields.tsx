import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { LabelIcon, type LabelIconSpec } from "../data/Icon";
import { formatDateTimeRelative } from "../data/cells/timestamp-format";
import { Combobox } from "./Combobox";
import { DateTimePicker } from "./DateTimePicker";
import type { FieldControl, FieldOption, FormLayout } from "./json-schema-form-types";
import {
  defaultPlaceholder,
  inputClass,
  toText,
  withSyntheticValue,
} from "./json-schema-form-utils";
import {
  controlHeightClass,
  controlMinHeightClass,
  fieldInnerGapClass,
  inlineRowGapClass,
  labelSizeClass,
  stackedRowGapClass,
  type FormSize,
} from "./json-schema-form-size";

// FieldsGrid is the container every group of field rows renders into — the
// top-level form and each nested object/map. In inline mode it owns the single
// 2-column track definition: `fit-content(labelMaxWidth)` for the label column,
// `minmax(0, valueMaxWidth)` for the value column. Every field row is a
// `subgrid` that inherits these tracks, so all labels share one column width and
// every value lines up — a real form grid, not per-row independent grids.
// (`fit-content()` is the only valid CSS for "size to content, clamped to a max"
// — `min(w, max-content)` is rejected by the browser, which silently drops the
// whole declaration and collapses every row to a stacked-looking column. The
// template is an inline style because Tailwind can't interpolate runtime widths.)
// Stacked mode is a plain single-column grid.
export function FieldsGrid({ layout, size, children }: { layout: FormLayout; size: FormSize; children: ReactNode }) {
  if (layout.mode === "inline") {
    const labelMaxWidth = layout.labelMaxWidth ?? "40ch";
    const valueMaxWidth = layout.valueMaxWidth ?? "600px";
    return (
      <div
        className={cn("grid", inlineRowGapClass[size])}
        style={{ gridTemplateColumns: `fit-content(${labelMaxWidth}) minmax(0, ${valueMaxWidth})` }}
      >
        {children}
      </div>
    );
  }
  return <div className={cn("grid", stackedRowGapClass[size])}>{children}</div>;
}

// FieldWrapper lays out a single label + value (+ helper/error). In inline mode
// it is a `subgrid` row spanning the parent FieldsGrid's two columns, so its
// label and value snap to the shared label/value tracks (helper/error sit under
// the value column). In stacked mode the label sits tight above its control as
// one unit, capped at valueMaxWidth so controls don't stretch edge to edge.
export function FieldWrapper({
  label,
  value,
  helper,
  error,
  layout,
  size,
}: {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  layout: FormLayout;
  size: FormSize;
}) {
  if (layout.mode === "inline") {
    return (
      <div className="col-span-2 grid grid-cols-subgrid items-start gap-x-3 gap-y-0.5">
        <div className={cn("flex min-w-0 items-center", controlMinHeightClass[size])}>{label}</div>
        <div className="min-w-0">{value}</div>
        {helper && <p className="col-start-2 text-xs text-muted-foreground">{helper}</p>}
        {error && <p className="col-start-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  return (
    <div
      className="flex w-full flex-col gap-1"
      style={{ maxWidth: layout.valueMaxWidth ?? "600px" }}
    >
      {label}
      {value}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FieldLabel({ field, fieldId, size }: { field: FieldControl; fieldId: string; size: FormSize }) {
  return (
    <label htmlFor={fieldId} className={cn("flex min-w-0 items-center gap-2 font-medium", labelSizeClass[size])}>
      <LabelIcon icon={field.labelIcon} className="shrink-0 text-[15px] text-muted-foreground" />
      <span className="truncate" title={field.label !== field.key ? field.key : undefined}>
        {field.label}
      </span>
      {field.required && <span className="shrink-0 text-destructive">*</span>}
      {field.badge && (
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {field.badge}
        </span>
      )}
    </label>
  );
}

// ObjectSection renders a nested object as a labelled section: a header row
// (the field label + required/badge) above its fields, which fill the full
// width below. It replaces the inline label + bordered box so nested objects
// read as flat, headed groups rather than indented sub-forms. `col-span-full`
// makes it span both tracks of an inline FieldsGrid (full width, not crammed
// into the value column); in a stacked single-column grid it is a no-op.
export function ObjectSection({
  label,
  required,
  size,
  badge,
  helper,
  labelIcon,
  children,
}: {
  label: string;
  required: boolean;
  size: FormSize;
  badge?: string;
  helper?: string;
  labelIcon?: LabelIconSpec;
  children: ReactNode;
}) {
  return (
    <div className={cn("col-span-full flex flex-col", fieldInnerGapClass[size])}>
      <div className={cn("flex items-center gap-2 border-b border-border pb-1 font-semibold", labelSizeClass[size])}>
        <LabelIcon icon={labelIcon} className="text-[15px] text-muted-foreground" />
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
        {badge && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {children}
    </div>
  );
}

// ReadOnlyValue renders a `readOnly` field's current value as static text — no
// input, no border, just the value (date/date-time formatted human-readably).
// An empty value shows an em-dash. Carries the same id + data-jsf-input as the
// editable controls so layout and queries stay uniform.
export function ReadOnlyValue({ field, fieldId, size }: { field: FieldControl; fieldId: string; size: FormSize }) {
  const text = toText(field.value);
  const display = field.kind === "date" && text ? formatDateTimeRelative(text) : text;
  return (
    <span
      id={fieldId}
      data-jsf-input
      data-jsf-readonly
      className={cn("flex items-center text-foreground", controlHeightClass[size], labelSizeClass[size])}
      title={text || undefined}
    >
      {display || <span className="text-muted-foreground">—</span>}
    </span>
  );
}

// FieldAdornmentWrapper positions a field's leading/trailing in-field adornments
// (FieldControl.prefix at the left edge, FieldControl.suffix at the right). The
// container is tagged data-jsf-control so an adornment can locate its sibling
// input[data-jsf-input] (e.g. for caret-aware insertion). With neither adornment
// it renders the input bare, so unadorned fields are byte-for-byte unchanged.
function FieldAdornmentWrapper({
  prefix,
  suffix,
  children,
}: {
  prefix?: ReactNode;
  suffix?: ReactNode;
  children: ReactNode;
}) {
  if (!prefix && !suffix) return <>{children}</>;
  return (
    <div data-jsf-control className="relative">
      {prefix && <div className="absolute inset-y-0 left-1.5 flex items-center">{prefix}</div>}
      {children}
      {suffix && <div className="absolute inset-y-0 right-1.5 flex items-center">{suffix}</div>}
    </div>
  );
}

export function StringControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  return (
    <FieldAdornmentWrapper prefix={field.prefix} suffix={field.suffix}>
      <input
        id={fieldId}
        type="text"
        data-jsf-input
        className={cn(inputClass(size), field.prefix && "pl-8", field.suffix && "pr-8")}
        value={toText(field.value)}
        disabled={readOnly}
        placeholder={defaultPlaceholder(field.schema)}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </FieldAdornmentWrapper>
  );
}

export function NumberControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  // type="text" (not number) so non-numeric values a consumer permits — e.g.
  // template tokens — are not silently dropped by the browser.
  const coerce = field.coerceNumber !== false;
  // A static unit (e.g. "%") rides the right edge of the input as a display-only
  // suffix; a consumer-set `suffix` (e.g. an insert-snippet button) wins if both
  // are present (number insert triggers mount on the left as `prefix`).
  const suffix = field.suffix ?? (field.unit ? (
    <span className="pointer-events-none select-none text-muted-foreground">{field.unit}</span>
  ) : undefined);
  return (
    <FieldAdornmentWrapper prefix={field.prefix} suffix={suffix}>
      <input
        id={fieldId}
        type="text"
        inputMode="decimal"
        data-jsf-input
        className={cn(inputClass(size), field.prefix && "pl-8", suffix && "pr-8")}
        value={toText(field.value)}
        disabled={readOnly}
        placeholder={defaultPlaceholder(field.schema)}
        onChange={(e) => {
          const raw = e.target.value;
          // Coerce mid-typing ONLY when the parse round-trips to the same text
          // (e.g. "100", "33.5") — so an in-progress decimal like "33." or a
          // trailing-zero "33.30" keeps its raw text instead of collapsing to a
          // number and stranding the caret. Non-numeric tokens fall through to
          // the raw string. Blur finalizes any still-uncoerced numeric text.
          if (coerce && raw.trim() !== "" && String(Number(raw)) === raw.trim()) {
            field.onChange(Number(raw));
          } else {
            field.onChange(raw);
          }
        }}
        onBlur={(e) => {
          const raw = e.target.value;
          if (coerce && raw.trim() !== "" && Number.isFinite(Number(raw))) {
            field.onChange(Number(raw));
          }
        }}
      />
    </FieldAdornmentWrapper>
  );
}

// DateControl edits a `format: date`/`date-time` string. Read-only, it shows the
// human-readable absolute + relative form (e.g. "Apr 15, 2026, 12:00 PM (2h
// ago)"); editable, a DateTimePicker. The raw string is committed unchanged so a
// consumer-permitted template token in the field is preserved.
export function DateControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  const text = toText(field.value);
  if (readOnly) {
    return (
      <div
        id={fieldId}
        data-jsf-input
        className={cn("flex items-center text-foreground", controlHeightClass[size], labelSizeClass[size])}
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
      inputClassName={cn(inputClass(size), field.prefix && "pl-8", field.suffix ? "pr-14" : "pr-8")}
      value={text}
      onChange={(next) => field.onChange(next)}
      placeholder={defaultPlaceholder(field.schema)}
      prefix={field.prefix}
      suffix={field.suffix}
    />
  );
}

export function BooleanControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  // Only render a checkbox when the value is genuinely boolean (or unset).
  // A non-boolean value (e.g. a token a consumer left in place) renders as text
  // so it is preserved and editable.
  if (typeof field.value === "boolean" || field.value === undefined || field.value === null) {
    return (
      <div className={cn("flex items-center", controlHeightClass[size])}>
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
  return <StringControl field={field} fieldId={fieldId} readOnly={readOnly} size={size} />;
}

export function EnumControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  const value = toText(field.value);
  const options = withSyntheticValue(field.options ?? [], value);
  if (field.display === "radio") {
    return (
      <RadioGroupControl field={field} fieldId={fieldId} readOnly={readOnly} options={options} value={value} size={size} />
    );
  }
  return (
    <Combobox
      id={fieldId}
      options={options}
      value={value}
      disabled={readOnly}
      size={size}
      allowCustomValue={field.allowCustomValue ?? false}
      onChange={(v) => field.onChange(v)}
      prefix={field.prefix}
      suffix={field.suffix}
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
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  options: FieldOption[];
  value: string;
  size: FormSize;
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
              "inline-flex cursor-pointer select-none items-center rounded px-2.5 py-1",
              labelSizeClass[size],
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

// TextareaControl edits a long-form string in a multi-line box. Read-only, it
// shows the value with line breaks preserved; editable, a resizable <textarea>.
// The raw string is committed unchanged so a consumer-permitted template token
// survives.
export function TextareaControl({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  const text = toText(field.value);
  if (readOnly) {
    return (
      <span
        id={fieldId}
        data-jsf-input
        data-jsf-readonly
        className={cn("block whitespace-pre-wrap break-words text-foreground", labelSizeClass[size])}
        title={text || undefined}
      >
        {text || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }
  return (
    <FieldAdornmentWrapper prefix={field.prefix} suffix={field.suffix}>
      <textarea
        id={fieldId}
        data-jsf-input
        rows={4}
        className={cn(inputClass(size), "h-auto min-h-[5rem] resize-y", field.prefix && "pl-8", field.suffix && "pr-8")}
        value={text}
        disabled={readOnly}
        placeholder={defaultPlaceholder(field.schema)}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </FieldAdornmentWrapper>
  );
}

// DisplayControl renders a static, non-editable presentation element:
// Label/Title (heading), Message (info text), Line (divider), or Blank/Filler
// (spacer). It never collects a value; the heading/text source is the field's
// title (label) and, for "text", its description. Rendered identically in the
// form and the read-only Viewer.
export function DisplayControl({ field, size }: { field: FieldControl; size: FormSize }) {
  const variant = field.displayVariant ?? "text";
  if (variant === "divider") {
    return <hr data-jsf-input className="my-1 w-full border-t border-border" />;
  }
  if (variant === "spacer") {
    return <div data-jsf-input aria-hidden className="h-2" />;
  }
  if (variant === "heading") {
    return (
      <div
        data-jsf-input
        className={cn("border-b border-border pb-1 font-semibold text-foreground", labelSizeClass[size])}
      >
        {field.label}
      </div>
    );
  }
  const text = field.description ?? toText(field.value) ?? field.label;
  return (
    <p data-jsf-input className={cn("text-muted-foreground", labelSizeClass[size])}>
      {text || field.label}
    </p>
  );
}

// LinkControl renders a read-only external hyperlink. The
// href is field.href, falling back to the value when it is an absolute URL; with
// neither it degrades to a plain read-only value.
export function LinkControl({ field, fieldId, size }: { field: FieldControl; fieldId: string; size: FormSize }) {
  const text = toText(field.value);
  const href = field.href ?? (/^https?:\/\//i.test(text) ? text : undefined);
  if (!href) {
    return <ReadOnlyValue field={field} fieldId={fieldId} size={size} />;
  }
  return (
    <a
      id={fieldId}
      data-jsf-input
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn("inline-flex items-center text-primary underline underline-offset-2", controlHeightClass[size], labelSizeClass[size])}
    >
      {text || field.label || href}
    </a>
  );
}

// HMR probe
// HMR probe 2
