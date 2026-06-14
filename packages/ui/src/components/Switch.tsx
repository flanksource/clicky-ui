import { useId, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type SwitchProps = {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the next state when toggled. */
  onChange: (checked: boolean) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Optional clickable label rendered after the track. */
  label?: ReactNode;
  /** Accessible name when no visible `label` is given. */
  "aria-label"?: string;
  /** Classes applied to the wrapper (or the track when there is no label). */
  className?: string;
};

/**
 * On/off toggle switch (`role="switch"`). Density-aware: the track and knob
 * scale via `density-*` variants, so it shrinks/grows with the active
 * `data-density`. The knob is positioned with flex alignment (no translate
 * math), so it stays centered at every size.
 */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const labelId = useId();

  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ? undefined : ariaLabel}
      aria-labelledby={label ? labelId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-0.5 transition-colors",
        "h-5 w-9 density-compact:h-4 density-compact:w-7 density-spacious:h-6 density-spacious:w-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "justify-end bg-primary" : "justify-start bg-input",
        !label && className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none rounded-full bg-background shadow transition-all",
          "h-4 w-4 density-compact:h-3 density-compact:w-3 density-spacious:h-5 density-spacious:w-5",
        )}
      />
    </button>
  );

  if (!label) return track;

  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-density-2", className)}>
      {track}
      <span id={labelId} className="text-sm text-foreground">
        {label}
      </span>
    </label>
  );
}
