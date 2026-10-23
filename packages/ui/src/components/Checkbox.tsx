import type { MouseEvent, ReactNode } from "react";
import { cn } from "../lib/utils";

export type CheckboxProps = {
  /** Current checked state. */
  checked: boolean;
  /** Called with the next state when toggled. */
  onChange: (checked: boolean) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Optional clickable label rendered after the box. */
  label?: ReactNode;
  /** Accessible name when no visible `label` is given. */
  "aria-label"?: string;
  /**
   * Fires before `onChange`; use it to read modifier keys or stop the click
   * from reaching an enclosing clickable row.
   */
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
  /** Classes applied to the wrapper (or the input when there is no label). */
  className?: string;
};

const BOX =
  "size-4 shrink-0 cursor-pointer rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

/** A native `<input type="checkbox">` in the ListMenu row-checkbox style. */
export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  "aria-label": ariaLabel,
  onClick,
  className,
}: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      className={cn(BOX, !label && className)}
      checked={checked}
      disabled={disabled}
      aria-label={label ? undefined : ariaLabel}
      onClick={onClick}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
  if (!label) return input;
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-density-2", className)}>
      {input}
      <span className="text-sm">{label}</span>
    </label>
  );
}
