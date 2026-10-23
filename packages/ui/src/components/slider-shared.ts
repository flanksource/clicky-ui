/** Styling and numeric helpers shared by `Slider` and `RangeSlider`. */

export const sliderBaseClassName =
  "pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent";

export const sliderThumbClassName =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-background/80 [&::-webkit-slider-thumb]:bg-muted-foreground [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-background/80 [&::-moz-range-thumb]:bg-muted-foreground [&::-moz-range-thumb]:shadow-sm";

export const sliderNumberInputClassName =
  "h-7 min-w-0 rounded-md border border-input bg-background px-2 text-right font-mono text-xs tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Nearest `step`-aligned value measured from `base`, kept inside `[min, max]`.
 * Mirrors what the range inputs enforce, so typed entry cannot produce a value
 * the thumbs could never reach.
 */
export function snapToStep(
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

export function valueToPercent(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}
