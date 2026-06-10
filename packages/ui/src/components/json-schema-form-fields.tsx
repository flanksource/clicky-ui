import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { LabelIcon, type LabelIconSpec } from "../data/Icon";
import { formatDateTimeRelative } from "../data/cells/Timestamp";
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
  labelSizeClass,
  type FormSize,
} from "./json-schema-form-size";

// FieldWrapper lays out a label + value (+ helper/error) either inline (2-col)
// or stacked, mirroring the convention used elsewhere in the library. In inline
// mode the label column shrinks to fit its content but is capped/truncated at
// labelMaxWidth, and the value column is capped at valueMaxWidth (see
// FormLayout); the grid template is set inline because Tailwind can't
// interpolate runtime widths.
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
    const labelMaxWidth = layout.labelMaxWidth ?? "40ch";
    const valueMaxWidth = layout.valueMaxWidth ?? "600px";
    return (
      <div
        className="grid items-start gap-x-3 gap-y-0.5"
        style={{
          gridTemplateColumns: `minmax(0, min(${labelMaxWidth}, max-content)) minmax(0, ${valueMaxWidth})`,
        }}
      >
        <div className={cn("flex min-w-0 items-center", controlMinHeightClass[size])}>{label}</div>
        <div className="min-w-0">{value}</div>
        {helper && <p className="col-start-2 text-xs text-muted-foreground">{helper}</p>}
        {error && <p className="col-start-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  // Stacked: the label sits tight (gap-1) above its control so the pair reads
  // as one unit against the larger row-to-row gap, and the whole stack is
  // capped at valueMaxWidth so controls don't stretch edge to edge on wide
  // viewports (mirroring the inline value column cap).
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
// read as flat, headed groups rather than indented sub-forms.
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
    <div className={cn("flex flex-col", fieldInnerGapClass[size])}>
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
    <input
      id={fieldId}
      type="text"
      data-jsf-input
      className={inputClass(size)}
      value={toText(field.value)}
      disabled={readOnly}
      placeholder={defaultPlaceholder(field.schema)}
      onChange={(e) => field.onChange(e.target.value)}
    />
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
  return (
    <input
      id={fieldId}
      type="text"
      inputMode="decimal"
      data-jsf-input
      className={inputClass(size)}
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
      inputClassName={cn(inputClass(size), "pr-8")}
      value={text}
      onChange={(next) => field.onChange(next)}
      placeholder={defaultPlaceholder(field.schema)}
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
