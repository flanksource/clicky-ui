import { useState } from "react";
import { Combobox } from "./Combobox";
import type { ComboboxOption } from "./combobox-types";
import { withSelectedComboboxOptions } from "../lib/combobox-values";
import {
  comboboxAriaProps,
  defaultPlaceholder,
} from "./json-schema-form-utils";
import type { FormSize } from "./json-schema-form-size";
import type {
  FieldControl,
  FieldOption,
  JsonSchemaProperty,
  ScalarItemType,
} from "./json-schema-form-types";

// TagsComboboxControl is the multi-value picker: one field whose committed
// values are removable pills. It serves every array that holds a flat list of
// values — an `enum` item schema (options in the schema), an `x-clicky-lookup`
// with `multi: true` (options fetched, with server-side search), and a plain
// list of scalars (no options at all, so typing IS how a value is added) — so
// all three look and behave identically.
//
// The value it commits is ALWAYS an array. That is the difference from
// EnumControl/LookupControl, which own the single-value case.
export function TagsComboboxControl({
  field,
  fieldId,
  readOnly,
  size,
  options,
  itemType,
  separators,
  loading,
  onSearch,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
  options: FieldOption[];
  /** The scalar the items hold, when the list is free-form rather than a choice
   *  set. Turns on free entry and converts numeric text on commit. */
  itemType?: ScalarItemType;
  /** Characters that commit the typed text, alongside Enter (see Combobox). */
  separators?: string[];
  loading?: boolean;
  onSearch?: (query: string) => void;
}) {
  const values = toTagValues(field.value);
  const [refusal, setRefusal] = useState<string>();
  const refusalId = `${fieldId}-refusal`;
  const aria = comboboxAriaProps(field, fieldId);
  // A typed string list refuses a tag its item schema rejects, saying why, so a
  // bad value never reaches the committed array.
  const typed = itemType === "string" && field.itemSchema ? field.itemSchema : undefined;
  return (
    <div className="w-full">
    <Combobox
      multiple
      variant="tags"
      {...(field.nullable ? { clearable: true, clearLabel: `Clear ${field.label} to null`, onClear: () => field.onChange(null) } : {})}
      id={fieldId}
      // A choice list pins any committed value its options do not carry, so the
      // value stays visible and de-selectable in the menu (a lookup's head set is
      // a page, not the whole table). A free scalar list has no option set to pin
      // into, and a menu echoing the pills above it says nothing.
      options={
        options.length === 0 ? [] : withSelectedComboboxOptions(options, values)
      }
      value={values}
      onChange={(next) =>
        field.onChange(next.map((v) => coerceScalarItem(v, itemType)))
      }
      disabled={readOnly}
      {...(!readOnly ? { inputPlaceholder: defaultPlaceholder(field.schema) || (itemType === "integer" ? "Add integer…" : itemType === "number" ? "Add number…" : itemType === "string" ? "Add tag…" : "Choose values…") } : {})}
      size={size}
      // An enum (or a strict lookup) is a closed set: typed text matching no
      // option is discarded rather than committed. A free scalar list is the
      // opposite — there is nothing to match against. A pre-extension wins over
      // both.
      allowCustomValue={field.allowCustomValue ?? itemType !== undefined}
      prefix={field.prefix}
      suffix={field.suffix}
      {...(separators ? { separators } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(onSearch ? { onSearch } : {})}
      {...aria}
      {...(refusal ? { invalid: true, describedBy: [aria.describedBy, refusalId].filter(Boolean).join(" ") } : {})}
      {...(typed
        ? {
            onCreate: (option: ComboboxOption) => {
              const reason = tagRefusal(typed, option.value, field.label);
              setRefusal(reason);
              return reason ? null : option.value;
            },
            onInputValueChange: () => setRefusal(undefined),
          }
        : {})}
      {...(field.inputClassName ? { className: field.inputClassName } : {})}
      {...(defaultPlaceholder(field.schema)
        ? { placeholder: defaultPlaceholder(field.schema) }
        : {})}
    />
    {refusal && <p id={refusalId} role="alert" className="mt-1 text-xs text-destructive">{refusal}</p>}
    </div>
  );
}

// tagRefusal says why `text` is not a valid item of a string list — its pattern
// or length bounds — or undefined when it is one.
function tagRefusal(item: JsonSchemaProperty, text: string, label: string): string | undefined {
  const { pattern, minLength, maxLength } = item;
  const fits =
    (typeof pattern !== "string" || new RegExp(pattern, "u").test(text)) &&
    (typeof minLength !== "number" || text.length >= minLength) &&
    (typeof maxLength !== "number" || text.length <= maxLength);
  if (fits) return undefined;
  const what = item.title || label;
  return `“${text}” is not a valid ${what}${item.description ? `: ${item.description}` : typeof pattern === "string" ? `; it must match ${pattern}` : ""}`;
}

// The pills a committed value renders as. A numeric list holds numbers, and a
// tag is text, so both scalars render as their own text — anything else (an
// object mid-edit, a null) has no legible pill and is dropped.
function toTagValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is string | number =>
        typeof entry === "string" || typeof entry === "number",
    )
    .map(String);
}

// coerceScalarItem converts a pill's text back to the type the items declare.
// Text that does not parse as a number stays a string even in a numeric list, so
// a template token survives — the same allowance NumberControl makes. The
// round-trip is stable: 80 renders as "80" and commits as 80.
function coerceScalarItem(
  raw: string,
  itemType: ScalarItemType | undefined,
): string | number {
  if (itemType !== "integer" && itemType !== "number") return raw;
  const trimmed = raw.trim();
  if (trimmed === "" || !Number.isFinite(Number(trimmed))) return raw;
  return Number(trimmed);
}
