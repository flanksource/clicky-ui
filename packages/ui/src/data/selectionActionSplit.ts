import type {
  DataTableSelectionAction,
  SelectionActionDisplay,
} from "./DataTable";

/**
 * How many plain buttons stay on the row before the rest collapse into the
 * overflow menu. Past three the toolbar starts wrapping on a laptop, and a
 * wrapped toolbar pushes the rows the actions apply to off the top of the
 * screen — the one thing this placement was for.
 *
 * Named dropdowns are not counted against it: they are what a bulk editor is,
 * and a caller that named one has already said the row has space for it.
 */
export const MAX_INLINE_SELECTION_ACTIONS = 3;

/**
 * What shape the bar gives an action. `display` is the explicit answer; the
 * inferences below are what a caller means when it says nothing.
 *
 * A `section` is a menu heading and a `children` list is a flyout: both need a
 * menu to live in, and the overflow already is one. A custom `menu` body is the
 * opposite — it exists to be a named dropdown, so it says so on its own.
 */
export function resolveSelectionActionDisplay<
  T extends Record<string, unknown>,
>(action: DataTableSelectionAction<T>): SelectionActionDisplay {
  if (action.display) return action.display;
  if (action.menu) return "menu";
  if (action.primary === false) return "overflow";
  if (action.section !== undefined) return "overflow";
  if (action.children?.length) return "overflow";
  return "button";
}

export type SelectionActionSplit<T extends Record<string, unknown>> = {
  /** Named inline dropdowns, in caller order. Never capped. */
  menus: DataTableSelectionAction<T>[];
  /** Plain inline buttons, after `primary` and the cap have had their say. */
  buttons: DataTableSelectionAction<T>[];
  /** What the ⋯ menu keeps, grouped by section in first-appearance order. */
  overflow: DataTableSelectionAction<T>[];
};

/**
 * Splits bulk actions into the ones the toolbar shows and the ones the menu
 * keeps. `primary` is the explicit answer and position is the fallback.
 */
export function splitSelectionActions<T extends Record<string, unknown>>(
  actions: DataTableSelectionAction<T>[],
  options?: { maxButtons?: number | undefined },
): SelectionActionSplit<T> {
  const menus: DataTableSelectionAction<T>[] = [];
  const candidates: DataTableSelectionAction<T>[] = [];

  for (const action of actions) {
    const display = resolveSelectionActionDisplay(action);
    if (display === "menu") menus.push(action);
    else if (display === "button") candidates.push(action);
  }

  // An explicit `primary` decides, and with none claimed position does, capped.
  // Only plain buttons are capped — dropdowns are the bar's whole point.
  const pinned = candidates.filter((action) => action.primary);
  const buttons = pinned.length
    ? pinned
    : candidates.slice(0, options?.maxButtons ?? MAX_INLINE_SELECTION_ACTIONS);

  // Whatever is left keeps the caller's order, because that is what the
  // overflow's contiguous section headings are grouped from.
  const promoted = new Set([...menus, ...buttons].map((action) => action.id));
  return {
    menus,
    buttons,
    overflow: actions.filter((action) => !promoted.has(action.id)),
  };
}
