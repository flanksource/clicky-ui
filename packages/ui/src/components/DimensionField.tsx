import { useId } from "react";
import { cn } from "../lib/utils";
import { InputField } from "./InputField";

export type DimensionFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export function DimensionField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step,
  id,
  description,
  required,
  disabled,
  className,
  inputClassName,
}: DimensionFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={cn("flex flex-col gap-density-1", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}
      </label>
      <InputField
        id={inputId}
        type="number"
        value={String(value)}
        min={min}
        max={max}
        step={step}
        required={required}
        disabled={disabled}
        aria-describedby={descriptionId}
        inputClassName={cn("tabular-nums", inputClassName)}
        suffix={<span aria-hidden="true" className="text-xs text-muted-foreground">{unit}</span>}
        onChange={(next) => {
          if (next.trim() === "") return;
          const parsed = Number(next);
          if (!Number.isFinite(parsed)) throw new Error(`Invalid ${label.toLowerCase()} dimension: ${next}`);
          onChange(parsed);
        }}
      />
      {description && <p id={descriptionId} className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
