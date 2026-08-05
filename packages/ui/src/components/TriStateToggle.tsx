import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiCheck, UiClose, UiRemove } from "../icons";

// A yes/no value that can also be unset — the shape a nullable boolean field or
// a boolean filter actually has. One button cycles the three states so it costs
// a single control in a table row or filter bar, where a pair of radios or a
// dropdown would not fit.

export type TriState = boolean | undefined;

export type TriStateLabels = {
  /** Label for the unset state. Defaults to "Any". */
  unset?: string;
  /** Label for the true state. Defaults to "Yes". */
  on?: string;
  /** Label for the false state. Defaults to "No". */
  off?: string;
};

export type TriStateToggleProps = {
  /** Controlled value: true, false, or undefined for unset. */
  value: TriState;
  /** Receives the next state in the unset → on → off → unset cycle. */
  onChange: (value: TriState) => void;
  /** Accessible name — the field this toggle stands for. */
  label: string;
  /** Per-state wording used in the tooltip and accessible description. */
  labels?: TriStateLabels;
  /** DOM id of the toggle button, so an external `<label htmlFor>` can target it. */
  id?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

const DEFAULT_LABELS: Required<TriStateLabels> = {
  unset: "Any",
  on: "Yes",
  off: "No",
};

/** Next state in the cycle: unset → on → off → unset. */
export function nextTriState(value: TriState): TriState {
  if (value === undefined) return true;
  return value ? false : undefined;
}

export function TriStateToggle({
  value,
  onChange,
  label,
  labels,
  id,
  size = "sm",
  disabled,
  className,
}: TriStateToggleProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const state = value === undefined ? "unset" : value ? "on" : "off";
  const glyph = state === "on" ? UiCheck : state === "off" ? UiClose : UiRemove;
  const tone =
    state === "on"
      ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
      : state === "off"
        ? "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
        : "border-input bg-muted/30 text-muted-foreground";

  return (
    <button
      type="button"
      {...(id !== undefined ? { id } : {})}
      // A tri-state checkbox is the ARIA shape for on/off/unset; "mixed" is the
      // unset state, so screen readers announce it instead of a bare button.
      role="checkbox"
      aria-checked={value === undefined ? "mixed" : value}
      aria-label={label}
      title={`${label}: ${text[state]}. Click to cycle.`}
      disabled={disabled}
      onClick={() => onChange(nextTriState(value))}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        tone,
        disabled ? "opacity-60" : "hover:brightness-95",
        className,
      )}
    >
      <Icon icon={glyph} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}
