import { Button } from "./button";
import { InputField } from "./InputField";
import { cn } from "../lib/utils";
import { controlHeightClass, labelSizeClass, type FormSize } from "./json-schema-form-size";
import type { FieldControl } from "./json-schema-form-types";
import { defaultPlaceholder, fieldAriaProps, toText } from "./json-schema-form-utils";

export function NumberStepperControl({ field, fieldId, readOnly, size }: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  const text = toText(field.value);
  const current = text.trim() === "" ? 0 : Number(text);
  const valid = Number.isFinite(current);
  const step = field.schema.multipleOf ?? 1;
  const min = field.schema.minimum ?? Number.NEGATIVE_INFINITY;
  const max = field.schema.maximum ?? Number.POSITIVE_INFINITY;
  const move = (direction: number) => {
    if (readOnly || !valid) return;
    const next = Math.min(max, Math.max(min, current + direction * step));
    field.onChange(field.coerceNumber === false ? String(next) : next);
  };
  return <InputField
    clearable={field.nullable === true}
    clearLabel={`Clear ${field.label} to null`}
    onClear={() => field.onChange(null)}
    id={fieldId}
    type="number"
    step="any"
    inputMode="decimal"
    data-jsf-input
    {...fieldAriaProps(field, fieldId)}
    {...(field.schema.minimum !== undefined ? { min: field.schema.minimum } : {})}
    {...(field.schema.maximum !== undefined ? { max: field.schema.maximum } : {})}
    className={controlHeightClass[size]}
    inputClassName={cn(labelSizeClass[size], "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", field.inputClassName)}
    value={text}
    disabled={readOnly}
    placeholder={defaultPlaceholder(field.schema)}
    prefix={field.prefix}
    suffix={<>
      {field.suffix ?? (field.unit ? <span className="text-muted-foreground">{field.unit}</span> : null)}
      <Button type="button" variant="ghost" size="xs" aria-label={`Decrease ${field.label}`} disabled={readOnly || !valid || current <= min} onClick={() => move(-1)}>−</Button>
      <Button type="button" variant="ghost" size="xs" aria-label={`Increase ${field.label}`} disabled={readOnly || !valid || current >= max} onClick={() => move(1)}>+</Button>
    </>}
    onChange={raw => field.onChange(field.coerceNumber !== false && raw.trim() !== "" && String(Number(raw)) === raw.trim() ? Number(raw) : raw)}
    onBlur={event => {
      const raw = event.currentTarget.value;
      if (field.coerceNumber !== false && raw.trim() !== "" && Number.isFinite(Number(raw))) field.onChange(Number(raw));
    }}
    onKeyDown={event => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      move(event.key === "ArrowUp" ? 1 : -1);
    }}
  />;
}
