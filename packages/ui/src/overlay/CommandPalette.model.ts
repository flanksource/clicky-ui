// Types and pure helpers for CommandPalette. Kept React-free so the filtering,
// ranking, and keyboard-index math are unit-testable without a DOM.

import type { ReactNode } from "react";
import type { StaticIconComponent } from "../data/Icon";

/** Context handed to a command's `onSelect`. */
export type CommandSelectContext = {
  /** The item that was activated. */
  item: CommandItem;
  /** The query at the moment of activation, trimmed. */
  query: string;
  /** Closes the palette — call this from a handler that opted out of `closeOnSelect`. */
  close: () => void;
};

/** A single runnable command row. */
export type CommandItem = {
  /** Stable identity; the React key and the `aria-activedescendant` target. Must be unique across all groups. */
  id: string;
  /** Primary text, and the main field the default filter matches. */
  label: string;
  /** Secondary text rendered muted after the label. Also matched, at lower weight. */
  description?: string;
  /** Extra match terms that are never displayed — aliases, verbs, ids. */
  keywords?: string[];
  /** Leading glyph: a runtime icon name or a generated `Ui*` component. */
  icon?: string | StaticIconComponent;
  /** Keyboard hint rendered as a trailing `<kbd>`. Display only — the palette does not bind it. */
  shortcut?: string;
  /** Trailing content (a badge, a count). Must not be focusable: it lives inside `role="option"`. */
  trailing?: ReactNode;
  /** Dims the row, skips it during arrow navigation, and blocks Enter. */
  disabled?: boolean;
  /** Runs when the row is activated. Falls back to the palette's `onSelect`. */
  onSelect?: (context: CommandSelectContext) => void;
};

/** A titled block of commands. Groups render in array order regardless of match quality. */
export type CommandGroup = {
  /** Stable identity; the React key and the heading's element id. */
  id: string;
  /** Section header. Omit for an unlabelled block. */
  heading?: string;
  items: CommandItem[];
  /** Cap on rows shown after filtering. Use for "top N results" sources. */
  limit?: number;
};

/** Scores an item against a query. Higher wins; `0`/`false` hides the row. */
export type CommandFilter = (item: CommandItem, query: string) => number | boolean;

/**
 * Default matcher: case-insensitive substring over label, description, and
 * keywords. A hit earlier in the label outranks a later one, and a label hit
 * outranks a description or keyword hit, so the most obvious match sorts first.
 */
export function defaultCommandFilter(item: CommandItem, query: string): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 1;

  const label = item.label.toLowerCase();
  const labelIndex = label.indexOf(needle);
  if (labelIndex === 0) return 1000;
  if (labelIndex > 0) return 800 - Math.min(labelIndex, 100);

  const description = item.description?.toLowerCase() ?? "";
  const descriptionIndex = description.indexOf(needle);
  if (descriptionIndex >= 0) return 500 - Math.min(descriptionIndex, 100);

  const keywordHit = (item.keywords ?? []).some((keyword) =>
    keyword.toLowerCase().includes(needle),
  );
  return keywordHit ? 300 : 0;
}

function score(filter: CommandFilter, item: CommandItem, query: string): number {
  const result = filter(item, query);
  if (result === true) return 1;
  if (result === false) return 0;
  return result;
}

/**
 * Filters and ranks each group, dropping groups left empty. Group order is
 * preserved — only items move — so the palette's sections stay where the
 * consumer put them. Pass `filter: false` when the caller already filtered
 * server-side; groups then pass through untouched apart from `limit`.
 */
export function filterCommandGroups(
  groups: CommandGroup[],
  query: string,
  filter: CommandFilter | false = defaultCommandFilter,
): CommandGroup[] {
  const result: CommandGroup[] = [];

  for (const group of groups) {
    let items: CommandItem[];

    if (filter === false) {
      items = group.items;
    } else {
      const scored = group.items
        .map((item) => ({ item, value: score(filter, item, query) }))
        .filter((entry) => entry.value > 0);
      // Stable within equal scores: sort() is stable in every engine we target,
      // so equally-ranked items keep their authored order.
      scored.sort((a, b) => b.value - a.value);
      items = scored.map((entry) => entry.item);
    }

    if (group.limit !== undefined) items = items.slice(0, group.limit);
    if (items.length > 0) result.push({ ...group, items });
  }

  return result;
}

/** Flattens groups to the row order the listbox renders, for index math. */
export function flattenCommands(groups: CommandGroup[]): CommandItem[] {
  return groups.flatMap((group) => group.items);
}

/**
 * Next selectable index in `direction`, skipping disabled rows and wrapping at
 * both ends. Returns `-1` when nothing is selectable. Wrapping suits a palette:
 * lists are query-scoped and short, so "up from the top" should reach the last
 * row in one press.
 */
export function nextEnabledIndex(
  items: CommandItem[],
  from: number,
  direction: 1 | -1,
): number {
  if (items.length === 0) return -1;

  for (let step = 1; step <= items.length; step += 1) {
    const index = (((from + direction * step) % items.length) + items.length) % items.length;
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

/** First selectable index, or `-1` when every row is disabled. */
export function firstEnabledIndex(items: CommandItem[]): number {
  const index = items.findIndex((item) => !item.disabled);
  return index;
}

/** Last selectable index, or `-1` when every row is disabled. */
export function lastEnabledIndex(items: CommandItem[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index;
  }
  return -1;
}
