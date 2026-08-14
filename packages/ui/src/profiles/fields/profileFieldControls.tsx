/**
 * The labelled controls the column editor is built from.
 *
 * They mirror what JsonSchemaForm renders for the params editor — a leading
 * glyph, a hover `?` carrying the help, and enums as icon comboboxes — so a
 * hand-rolled column form and a schema-driven parameter form read as one
 * editor rather than two.
 */

import type { ReactNode } from "react";
import { Combobox } from "../../components/Combobox";
import type { ComboboxOption } from "../../components/combobox-types";
import { HelpHint } from "../../components/json-schema-form-layout";
import { LabelIcon, type LabelIconSpec } from "../../data/Icon";

export const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

/**
 * A labelled control. The control carries its own `aria-label`: the help `?` is
 * a button inside the <label>, and an embedded control leaves the implicit
 * label unable to name anything.
 *
 * Capped rather than filling its grid track: a name, a type and a backend field
 * are all short, and stretching them to half a wide editor puts the label and
 * the value it names at opposite ends of the screen. `fullWidth` opts out for
 * the editors that genuinely need the room — a JSONPath, a CEL expression.
 */
export function EditorField({
  label,
  icon,
  help,
  fullWidth,
  children,
}: {
  label: string;
  icon?: LabelIconSpec;
  help?: string;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${fullWidth ? "" : "max-w-md"}`}>
      <span className="flex min-w-0 items-center gap-2">
        <LabelIcon icon={icon} className="shrink-0 text-[15px] text-muted-foreground" />
        <span className="truncate">{label}</span>
        {help ? <HelpHint label={label} helper={help} /> : null}
      </span>
      {children}
    </label>
  );
}

/**
 * An enum as an icon combobox. Unset is the cleared value rather than a blank
 * option: `placeholder` is where the inferred answer is named, so clearing the
 * control and reading what it falls back to are the same gesture.
 */
export function EnumField({
  label,
  icon,
  help,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  icon?: LabelIconSpec;
  help?: string;
  value: string;
  options: ComboboxOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <EditorField label={label} {...(icon ? { icon } : {})} {...(help ? { help } : {})}>
      <Combobox
        ariaLabel={label}
        value={value}
        options={options}
        placeholder={placeholder}
        allowCustomValue={false}
        {...(disabled ? { disabled } : {})}
        onChange={(next) => onChange(next || undefined)}
      />
    </EditorField>
  );
}
