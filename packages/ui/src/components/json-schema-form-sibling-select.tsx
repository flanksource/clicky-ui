import type { FieldControl, JsonSchemaProperty } from "./json-schema-form-types";
import type { FieldParent } from "./json-schema-form-runtime-types";
import { enumOptions } from "./json-schema-form-resolve";
import { Select } from "./select";

// SiblingSelect is the in-input dropdown siblingPrefixPre draws: the options of
// the enum sibling `from`, by their x-enum-labels, writing the chosen one back
// into the parent object.
export function SiblingSelect({ field, parent, from, prop }: { field: FieldControl; parent: FieldParent; from: string; prop: JsonSchemaProperty }) {
  const value = parent.value[from];
  return (
    <Select
      aria-label={prop.title || from}
      value={value === undefined ? "" : String(value)}
      disabled={field.readOnly === true}
      options={enumOptions(prop).map((option) => ({ value: option.value, label: option.name ?? option.value }))}
      {...(value === undefined ? { placeholder: "" } : {})}
      onChange={(event) => parent.onChange({ ...parent.value, [from]: event.target.value })}
      className="h-6 w-auto rounded-none border-0 border-r border-border bg-transparent pl-0 pr-6 text-xs font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  );
}
