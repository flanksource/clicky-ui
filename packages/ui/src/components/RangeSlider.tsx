import { cn } from "../lib/utils";

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

const thumbClassName =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-background/80 [&::-webkit-slider-thumb]:bg-muted-foreground [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-background/80 [&::-moz-range-thumb]:bg-muted-foreground [&::-moz-range-thumb]:shadow-sm";

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
        className="h-7 min-w-0 rounded-md border border-input bg-background px-2 text-right font-mono text-xs tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

const baseSliderClassName =
  "pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent";

function normalizeRangeValue(value: RangeSliderValue, min: number, max: number): RangeSliderValue {
  const lower = clampNumber(Math.min(value[0], value[1]), min, max);
  const upper = clampNumber(Math.max(value[0], value[1]), min, max);
  return [lower, upper];
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Nearest `step`-aligned value measured from `base`, kept inside `[min, max]`.
 * Mirrors what the range inputs enforce, so typed entry cannot produce a value
 * the thumbs could never reach.
 */
function snapToStep(
  value: number,
  { base, step, min, max }: { base: number; step: number; min: number; max: number },
): number {
  if (!(step > 0)) return clampNumber(value, min, max);
  const aligned = base + Math.round((value - base) / step) * step;
  if (aligned < min) {
    return clampNumber(base + Math.ceil((min - base) / step) * step, min, max);
  }
  if (aligned > max) {
    return clampNumber(base + Math.floor((max - base) / step) * step, min, max);
  }
  return aligned;
}

function valueToPercent(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function lowercaseFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
