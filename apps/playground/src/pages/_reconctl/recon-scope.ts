/**
 * The class that puts a recon page in the reconctl palette.
 *
 * Page-scoped on purpose: the palette applies to this subtree and to nothing
 * else, so navigating away restores the Flanksource theme with no cleanup and
 * no global state to leak. Follows the `merivio.css` precedent
 * (`apps/kitchen-sink/src/demos/approvals/ApprovalsDemo.tsx:27`) exactly.
 *
 * ## The bleed
 *
 * `PlaygroundShell` renders page content inside `p-density-4`
 * (`PlaygroundShell.tsx:579`). Without the negative margin the themed surface
 * would be a dark rectangle floating inside a light gutter, which reads as a
 * broken panel rather than as a themed page. `-m-density-4` cancels the shell's
 * padding, `min-h-full` fills the viewport, and the padding is re-applied
 * inside the scope so the content keeps its spacing.
 *
 * ## What this does not reach
 *
 * Portaled overlays. `DropdownMenu`, `Modal`, `HoverCard` and `Toast` render at
 * `document.body`, outside this subtree, so they keep the shell's palette — a
 * `DataTable` column-visibility menu opens in Flanksource blue over a violet
 * page. That is the accepted cost of scoping to the page instead of stamping
 * the document; the alternative re-skins the whole playground shell.
 *
 * The per-theme primitives in `palettes.css` are keyed on
 * `[data-theme="…"] .rc-violet-grid`, and `<html>` always carries `data-theme`,
 * so this wrapper flips with the shell's own theme switcher for free.
 */

import "./palettes.css";

/**
 * Applied to a recon page's existing root element rather than wrapping it.
 *
 * A wrapper component would push every page's JSX one level deeper for no gain;
 * this is a class, so a page adds it with `cn(RECON_SCOPE, "space-y-6")` and
 * nothing else moves.
 *
 * Written out in full and never composed from parts: `rc-violet-grid` is a real
 * class in `palettes.css` (so Tailwind's scanner is not involved), but the
 * three utilities beside it are Tailwind's, and the scanner only emits what it
 * can read literally.
 */
export const RECON_SCOPE = "rc-violet-grid -m-density-4 min-h-full p-density-4";
