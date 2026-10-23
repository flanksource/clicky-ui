import { cn } from "../lib/utils";
import {
  clampNumber,
  sliderBaseClassName as baseSliderClassName,
  sliderNumberInputClassName,
  sliderThumbClassName as thumbClassName,
  snapToStep,
  valueToPercent,
} from "./slider-shared";

export type RangeSliderValue = [number, number];

export type RangeSliderProps = {
  min: number;
  max: number;
  value: RangeSliderValue;
  onChange: (value: RangeSliderValue) => void;
  step?: number;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  /** Shows number fields below the track for exact keyboard entry. */
  editable?: boolean;
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
};

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  ariaLabelMin = "Minimum value",
  ariaLabelMax = "Maximum value",
  editable = false,
  className,
  trackClassName,
  rangeClassName,
  thumbClassName: thumbOverrideClassName,
}: RangeSliderProps) {
  const [lower, upper] = normalizeRangeValue(value, min, max);

  return (
    <div className={cn(editable && "space-y-2", className)}>
      <div className="relative h-6">
        <div
          className={cn(
            "absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border",
            trackClassName,
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/70",
            rangeClassName,
          )}
          style={{
            left: `${valueToPercent(lower, min, max)}%`,
            right: `${100 - valueToPercent(upper, min, max)}%`,
          }}
        />
        <input
          type="range"
          aria-label={ariaLabelMin}
          min={min}
          max={max}
          step={step}
          value={lower}
          className={cn(baseSliderClassName, thumbClassName, thumbOverrideClassName)}
          style={{ zIndex: lower >= max ? 30 : 20 }}
          onChange={(event) => {
            const nextLower = clampNumber(Number(event.target.value), min, max);
            onChange([Math.min(nextLower, upper), upper]);
          }}
        />
        <input
          type="range"
          aria-label={ariaLabelMax}
          min={min}
          max={max}
          step={step}
          value={upper}
          className={cn(baseSliderClassName, thumbClassName, thumbOverrideClassName)}
          onChange={(event) => {
            const nextUpper = clampNumber(Number(event.target.value), min, max);
            onChange([lower, Math.max(nextUpper, lower)]);
          }}
        />
      </div>
      {editable ? (
        <div className="grid grid-cols-2 gap-2">
          <EditableBound
            label="Min"
            ariaLabel={`Edit ${lowercaseFirst(ariaLabelMin)}`}
            min={min}
            max={upper}
            step={step}
            stepBase={min}
            value={lower}
            onChange={(next) => onChange([next, upper])}
          />
          <EditableBound
            label="Max"
            ariaLabel={`Edit ${lowercaseFirst(ariaLabelMax)}`}
            min={lower}
            max={max}
            step={step}
            stepBase={min}
            value={upper}
            onChange={(next) => onChange([lower, next])}
          />
        </div>
      ) : null}
    </div>
  );
}

function EditableBound({
  label,
  ariaLabel,
  min,
  max,
  step,
  stepBase,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  min: number;
  max: number;
  step: number;
  /** Origin the `step` grid is measured from — the slider's own `min`. */
  stepBase: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 text-[11px] text-muted-foreground">
      <span>{label}</span>
      <input
        aria-label={ariaLabel}
        className={sliderNumberInputClassName}
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(event) => {
          if (event.currentTarget.value === "") return;
          const next = Number(event.currentTarget.value);
          if (!Number.isFinite(next)) throw new Error(`${ariaLabel} must be a finite number`);
          onChange(snapToStep(next, { base: stepBase, step, min, max }));
        }}
      />
    </label>
  );
}

function normalizeRangeValue(value: RangeSliderValue, min: number, max: number): RangeSliderValue {
  const lower = clampNumber(Math.min(value[0], value[1]), min, max);
  const upper = clampNumber(Math.max(value[0], value[1]), min, max);
  return [lower, upper];
}

function lowercaseFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
