import { useState } from "react";
import { cn } from "../lib/utils";
import {
  clampNumber,
  sliderBaseClassName,
  sliderNumberInputClassName,
  sliderThumbClassName,
  snapToStep,
  valueToPercent,
} from "./slider-shared";

export type SliderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  /** Accessible name of the slider thumb. The number field is named `Edit <lowercased label>`. */
  ariaLabel?: string;
  /** Shows a number field on the same row as the track for exact keyboard entry. */
  editable?: boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  thumbClassName?: string;
};

/**
 * Single-value slider built from a native `<input type="range">`, sharing its
 * track and thumb styling with `RangeSlider`. Fully controlled. With `editable`
 * the exact value can also be typed into a number field beside the track;
 * typed values are snapped to the step grid and clamped to `[min, max]`.
 */
export function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  ariaLabel = "Value",
  editable = false,
  className,
  trackClassName,
  fillClassName,
  thumbClassName,
}: SliderProps) {
  const current = clampNumber(value, min, max);

  return (
    <div data-slider-row className={cn("flex items-center gap-3", className)}>
      <div className="relative h-6 min-w-0 flex-1">
        <div
          className={cn(
            "absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border",
            trackClassName,
          )}
        />
        <div
          className={cn(
            "absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/70",
            fillClassName,
          )}
          style={{ right: `${100 - valueToPercent(current, min, max)}%` }}
        />
        <input
          type="range"
          aria-label={ariaLabel}
          min={min}
          max={max}
          step={step}
          value={current}
          className={cn(
            sliderBaseClassName,
            "pointer-events-auto cursor-pointer",
            sliderThumbClassName,
            thumbClassName,
          )}
          onChange={(event) => onChange(clampNumber(Number(event.target.value), min, max))}
        />
      </div>
      {editable ? (
        <SliderNumberField
          ariaLabel={`Edit ${ariaLabel.charAt(0).toLowerCase()}${ariaLabel.slice(1)}`}
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

/**
 * Number field that commits every valid keystroke (snapped and clamped) but keeps
 * what the user typed on screen until blur, so entering "15" into a field whose
 * minimum is 10 is not rewritten to "10" after the first digit.
 */
function SliderNumberField({
  ariaLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  ariaLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      aria-label={ariaLabel}
      className={cn(sliderNumberInputClassName, "w-16 shrink-0")}
      max={max}
      min={min}
      step={step}
      type="number"
      value={draft ?? value}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        setDraft(raw);
        if (raw === "") return;
        const next = Number(raw);
        if (!Number.isFinite(next)) throw new Error(`${ariaLabel} must be a finite number`);
        onChange(snapToStep(next, { base: min, step, min, max }));
      }}
    />
  );
}
