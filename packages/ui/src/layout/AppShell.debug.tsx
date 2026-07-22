// Debug overlay for AppShell's slots. Every slot wrapper carries a
// `data-slot="app-shell-*"` attribute; switching `debugSlots` on stamps
// `data-debug-slots` on the shell root and injects the stylesheet below, which
// outlines each slot in its own colour and labels it with the slot name.
//
// Two deliberate choices keep this from perturbing what it measures:
//   * `outline` rather than `border` — outlines are drawn outside the box model
//     and never shift layout, which a border would.
//   * literal hex colours rather than theme tokens — this is developer chrome,
//     so it must stay legible and identical in both light and dark themes.

// Slot names, in outer-to-inner order, paired with their debug colour. Kept
// module-local: exporting a constant alongside a component from a .tsx breaks
// react-refresh (oxlint `only-export-components`).
const DEBUG_SLOTS: ReadonlyArray<readonly [slot: string, color: string]> = [
  ["app-shell-sidebar", "#8b5cf6"],
  ["app-shell-sidebar-header", "#a78bfa"],
  ["app-shell-sidebar-footer", "#a78bfa"],
  ["app-shell-header", "#0ea5e9"],
  ["app-shell-brand", "#06b6d4"],
  ["app-shell-nav", "#14b8a6"],
  ["app-shell-search", "#22c55e"],
  ["app-shell-actions", "#eab308"],
  ["app-shell-toolbar", "#f97316"],
  ["app-shell-body-header", "#ef4444"],
  ["app-shell-body-actions", "#ec4899"],
  ["app-shell-body-sidebar", "#6366f1"],
  // Named for the <main> element it tags, leaving "app-shell-content" free for
  // the inner content-width wrapper.
  ["app-shell-main", "#64748b"],
];

const BASE_RULES = `
[data-debug-slots] [data-slot^="app-shell-"] {
  position: relative;
  outline: 2px dashed var(--app-shell-debug-color);
  outline-offset: -2px;
}
[data-debug-slots] [data-slot^="app-shell-"]::after {
  content: attr(data-slot);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 40;
  padding: 0 3px;
  border-bottom-right-radius: 3px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: #ffffff;
  background: var(--app-shell-debug-color);
  pointer-events: none;
  white-space: nowrap;
}
`;

const SLOT_RULES = DEBUG_SLOTS.map(
  ([slot, color]) =>
    `[data-debug-slots] [data-slot="${slot}"] { --app-shell-debug-color: ${color}; }`,
).join("\n");

/**
 * Stylesheet powering {@link AppShellProps.debugSlots}. Rendered only while the
 * flag is on, so a production shell ships none of these rules.
 */
export function AppShellSlotOutlines() {
  return <style>{`${BASE_RULES}\n${SLOT_RULES}`}</style>;
}
