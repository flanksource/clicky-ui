/**
 * Centralized z-index scale for clicky-ui overlays — the single source of truth
 * so stacking conflicts (e.g. a dropdown opened inside a modal rendering behind
 * it) cannot recur.
 *
 * These are applied as inline `style={{ zIndex }}`, never as arbitrary `z-[N]`
 * Tailwind classes: a consumer's Tailwind build only generates the arbitrary
 * classes it can scan from clicky-ui's published dist, so a freshly chosen
 * `z-[N]` may silently emit no rule. Inline styles are immune to that.
 *
 * Floating, transient content (dropdown / combobox / menu / tooltip / popover)
 * must clear whatever modal is open, so its z-index is computed relative to the
 * active modal via `useFloatingZIndex` (see ./modalStack) rather than taken from
 * a constant here.
 *
 * Layers NOT listed here are intentionally local: they live inside their own
 * stacking context and never participate in the global ordering —
 * `Timeline` (`z-[1]`), `RangeSlider` thumbs (20/30), and `Modal`'s
 * `ConfirmClosePrompt` (`z-10`, relative to the modal panel).
 */
export const zIndex = {
  /** In-flow raised affordances (sticky bits). */
  raised: 30,
  /** Persistent chat launcher. */
  chatFab: 60,
  /** Floating chat windows; `ChatWindowManager` increments from this base. */
  chatWindow: 61,
  /** Floating transient content when NO modal is open (above app chrome). */
  popover: 9000,
  /** Modal/dialog at depth 0; nested modals add `modalStep` per level. */
  modal: 10000,
  /** Per-level step between stacked modals. */
  modalStep: 10,
  /** How far above the top modal floating content sits (below the next nest). */
  popoverOverModalOffset: 5,
  /** Toasts / notifications — always the topmost layer. */
  toast: 100000,
} as const;
