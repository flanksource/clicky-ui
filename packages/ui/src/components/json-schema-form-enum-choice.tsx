import { cn } from "../lib/utils";
import { SegmentedControl, type SegmentedSize } from "./SegmentedControl";
import type { FieldControl, FieldOption, JsonSchemaProperty } from "./json-schema-form-types";
import { labelSizeClass, type FormSize } from "./json-schema-form-size";

const DEFAULT_MARKER = "default";

// schemaDefaultChoice returns the option value named by the schema's scalar
// `default`, or undefined when there is none or it matches no option.
function schemaDefaultChoice(schema: JsonSchemaProperty, options: FieldOption[]): string | undefined {
  const fallback = schema.default;
  if (typeof fallback !== "string" && typeof fallback !== "number" && typeof fallback !== "boolean") {
    return undefined;
  }
  const choice = String(fallback);
  return options.some((opt) => opt.value === choice) ? choice : undefined;
}

// optionTitle is the native tooltip for one choice: its x-enum-descriptions
// entry, suffixed with "(default)" when it is the schema default.
function optionTitle(opt: FieldOption, isDefault: boolean): string | undefined {
  const parts = [opt.description, isDefault ? `(${DEFAULT_MARKER})` : undefined].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

type EnumChoiceProps = {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  options: FieldOption[];
  value: string;
  size: FormSize;
};

// The FormSize scale is wider than SegmentedControl's; map the extremes down.
const SEGMENTED_SIZE: Record<FormSize, SegmentedSize> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
};

// SegmentedEnumControl renders an enum (x-enum-display: "segmented") with the
// shared SegmentedControl. Icons come from x-enum-icons, descriptions from
// x-enum-descriptions (which promote it to the large card layout, and double as
// the segment tooltip). The schema default carries a "default" marker and, while
// the value is unset, the implied style. The wrapper carries the field id +
// data-jsf-input so the JSF field contract holds.
export function SegmentedEnumControl({ field, fieldId, readOnly, options, value, size }: EnumChoiceProps) {
  const hasDescription = options.some((opt) => opt.description);
  const segSize: SegmentedSize = hasDescription ? "lg" : SEGMENTED_SIZE[size];
  const defaultChoice = schemaDefaultChoice(field.schema, options);
  return (
    <div id={fieldId} data-jsf-input className={cn(field.inputClassName)}>
      <SegmentedControl
        aria-label={field.label}
        value={value}
        onChange={(next) => field.onChange(next)}
        size={segSize}
        wrap
        options={options.map((opt) => {
          const isDefault = opt.value === defaultChoice;
          const title = optionTitle(opt, isDefault);
          return {
            id: opt.value,
            label: opt.label,
            // x-enum-icons resolves to a runtime name string; SegmentedControl
            // renders that via <Icon name>. Non-string (pre-extension) icons are
            // dropped here since the segmented option type only takes name/component.
            ...(typeof opt.icon === "string" ? { icon: opt.icon } : {}),
            ...(opt.description ? { description: opt.description } : {}),
            ...(title ? { title } : {}),
            ...(isDefault ? { marker: DEFAULT_MARKER, implied: true } : {}),
            ...(readOnly ? { disabled: true } : {}),
          };
        })}
      />
    </div>
  );
}

// RadioGroupControl renders a small fixed enum as a segmented radio-button group
// instead of a dropdown. It shares EnumControl's option list (any out-of-enum
// value is already prepended, so a token still shows). One `radiogroup` role +
// native radios keep it keyboard-navigable; the visible chip is a styled label
// whose title is the option's description. The schema default carries a muted
// "default" marker (the radio's accessible description) and, while the value is
// unset, a dashed primary outline — distinct from the filled selection, and
// never `checked`, because nothing is selected.
export function RadioGroupControl({ field, fieldId, readOnly, options, value, size }: EnumChoiceProps) {
  const defaultChoice = schemaDefaultChoice(field.schema, options);
  const impliedChoice = value === "" ? defaultChoice : undefined;
  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      id={fieldId}
      data-jsf-input
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-md border border-input bg-background p-0.5",
        field.inputClassName,
      )}
    >
      {options.map((opt) => {
        const checked = opt.value === value;
        const implied = opt.value === impliedChoice;
        const isDefault = opt.value === defaultChoice;
        const markerId = isDefault ? `${fieldId}-default` : undefined;
        return (
          <label
            key={opt.value}
            title={optionTitle(opt, isDefault)}
            data-implied={implied ? "true" : undefined}
            className={cn(
              "inline-flex cursor-pointer select-none items-center rounded px-2.5 py-1",
              labelSizeClass[size],
              checked
                ? "bg-primary text-primary-foreground"
                : implied
                  ? "text-foreground outline-dashed outline-1 -outline-offset-1 outline-primary/60 hover:bg-accent"
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
              aria-describedby={markerId}
              onChange={() => field.onChange(opt.value)}
            />
            {opt.label}
            {isDefault && (
              <span id={markerId} aria-hidden="true" className="ml-1.5 text-[11px] font-normal opacity-70">
                {DEFAULT_MARKER}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
