import type { ReactNode } from "react";

/** The inspector's composer slot. It is always the last child of a clipped,
 *  full-height flex column, never inside a scroll container, so the input stays
 *  at the bottom edge while only the transcript above it scrolls. The bottom
 *  padding grows to the device safe area so a home indicator never covers it. */
export function PinnedComposer({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-background p-density-3 pb-[max(calc(var(--spacing-unit)*3),env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
