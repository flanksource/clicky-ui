import { useState } from "react";
import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import type { FieldControl, FieldOption } from "./json-schema-form-types";
import { inputClass, toText, withSyntheticValue } from "./json-schema-form-utils";
import { labelSizeClass, type FormSize } from "./json-schema-form-size";

// GridControl renders an enum as a filterable grid of selectable icon cards
// (instead of a dropdown). It is the presentation for enums carrying
// x-enum-icons — e.g. the connection "type" picker. The current value is always
// selectable even if it is outside the enum (a template token still shows).
// Read-only: only the selected card renders, disabled.
export function GridControl({
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
  const [query, setQuery] = useState("");
  const options = withSyntheticValue(field.options ?? [], value);

  if (readOnly) {
    const selected = options.find((o) => o.value === value);
    return (
      <div id={fieldId} data-jsf-input>
        <GridCard option={selected ?? { value, label: value }} checked readOnly size={size} onSelect={() => {}} />
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    : options;

  return (
    <div className="flex w-full flex-col gap-2">
      <input
        type="search"
        aria-label={`Filter ${field.label}`}
        placeholder="Filter…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={inputClass(size)}
      />
      <div
        role="radiogroup"
        aria-label={field.label}
        id={fieldId}
        data-jsf-input
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
      >
        {visible.map((opt) => (
          <GridCard
            key={opt.value}
            option={opt}
            checked={opt.value === value}
            readOnly={false}
            size={size}
            onSelect={() => field.onChange(opt.value)}
          />
        ))}
        {visible.length === 0 && (
          <div className={cn("col-span-full py-4 text-center text-muted-foreground", labelSizeClass[size])}>
            No matches
          </div>
        )}
      </div>
    </div>
  );
}

// GridCard is one selectable option in the grid: its icon over its label, with a
// selected (primary ring) state. A native button with role="radio" keeps it
// keyboard-navigable and screen-reader-correct.
function GridCard({
  option,
  checked,
  readOnly,
  size,
  onSelect,
}: {
  option: FieldOption;
  checked: boolean;
  readOnly: boolean;
  size: FormSize;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={readOnly}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-md border p-3 text-center transition-colors",
        labelSizeClass[size],
        checked
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-input hover:border-primary/50 hover:bg-accent",
        readOnly && "cursor-default opacity-80",
      )}
    >
      <LabelIcon icon={option.icon} className="text-2xl text-foreground" />
      <span className="break-words leading-tight">{option.label}</span>
    </button>
  );
}
