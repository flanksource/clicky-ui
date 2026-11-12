import type { MouseEvent } from "react";
import { cn } from "../lib/utils";
import { UiCheck } from "../icons";
import type { DiffSelectionState } from "./code-diff-selection";

// The cell is the hit area: it fills the row height (28px wide on desktop) and
// grows to 32px square on coarse pointers, so touch gets a usable target while
// desktop rows keep their one-line height.
const CELL =
  "flex w-7 shrink-0 select-none items-center justify-center self-stretch [@media(pointer:coarse)]:min-h-8 [@media(pointer:coarse)]:w-8";

/** Empty gutter cell with the box column's width and touch height, so rows without a box stay aligned. */
export function DiffSelectionSpacer() {
  return <span aria-hidden className={CELL} />;
}

/** Tri-state checkbox-like button: empty, dash (some) or check (all). */
export function DiffSelectionBox({
  state,
  label,
  disabled,
  onToggle,
}: {
  state: DiffSelectionState;
  label: string;
  disabled: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "partial" ? "mixed" : state === "all"}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        CELL,
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
          state === "all" && "border-primary bg-primary text-primary-foreground",
          state === "partial" && "border-primary bg-background text-primary",
          state === "none" && "border-muted-foreground/60 bg-background",
        )}
      >
        {state === "all" && <UiCheck className="size-3 text-current" />}
        {state === "partial" && <span className="h-0.5 w-2 rounded bg-current" />}
      </span>
    </button>
  );
}
