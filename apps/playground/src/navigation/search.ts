import type { CommandItem } from "@flanksource/clicky-ui";
import type { NavigationEntry } from "./types";

export function searchItems(entries: NavigationEntry[]): CommandItem[] {
  const items = new Map<string, CommandItem>();
  const visit = (nodes: NavigationEntry[]) => {
    for (const entry of nodes) {
      if (
        entry.slug &&
        (entry.kind !== "folder" || entry.source === "pages") &&
        !items.has(entry.slug)
      )
        items.set(entry.slug, {
          id: entry.slug,
          label: entry.label,
          description: entry.repository?.path ?? entry.slug,
        });
      if (entry.children) visit(entry.children);
    }
  };
  visit(entries);
  return [...items.values()];
}
