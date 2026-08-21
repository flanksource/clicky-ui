import type {
  AppShellNavItem,
  AppShellNavSection,
} from "@flanksource/clicky-ui";

import type { PageEntry, PageMeta } from "./registry";

type Ordered<T> = {
  value: T;
  order: number | undefined;
  index: number;
};

type NavGroup = {
  label: string;
  order: number | undefined;
  firstIndex: number;
  items: Ordered<AppShellNavItem>[];
};

type BuildNavOptions = {
  activeSlug: string | undefined;
  query: string;
  metaFor: (entry: PageEntry) => PageMeta | undefined;
};

function compareOrdered<T>(left: Ordered<T>, right: Ordered<T>): number {
  if (left.order !== undefined || right.order !== undefined) {
    return (left.order ?? Number.POSITIVE_INFINITY) -
      (right.order ?? Number.POSITIVE_INFINITY) || left.index - right.index;
  }
  return left.index - right.index;
}

export function buildPlaygroundNavSections(
  entries: readonly PageEntry[],
  { activeSlug, query, metaFor }: BuildNavOptions,
): AppShellNavSection[] {
  const needle = query.trim().toLowerCase();
  const groups = new Map<string, NavGroup>();

  entries.forEach((entry, index) => {
    const meta = metaFor(entry);
    const title = meta?.title ?? entry.title;
    const description = meta?.description ?? "";
    if (
      needle &&
      !title.toLowerCase().includes(needle) &&
      !entry.slug.toLowerCase().includes(needle) &&
      !description.toLowerCase().includes(needle)
    ) {
      return;
    }

    const label = meta?.group ?? entry.group;
    const group = groups.get(label) ?? {
      label,
      order: meta?.groupOrder,
      firstIndex: index,
      items: [],
    };
    if (
      group.order !== undefined &&
      meta?.groupOrder !== undefined &&
      group.order !== meta.groupOrder
    ) {
      throw new Error(`Conflicting groupOrder values for "${label}"`);
    }
    group.order ??= meta?.groupOrder;
    group.items.push({
      value: {
        key: entry.slug,
        label: title,
        active: entry.slug === activeSlug,
        to: `?page=${encodeURIComponent(entry.slug)}`,
        ...(meta?.icon ? { icon: meta.icon } : {}),
      },
      order: meta?.navOrder,
      index,
    });
    groups.set(label, group);
  });

  return [...groups.values()]
    .map((group) => ({ value: group, order: group.order, index: group.firstIndex }))
    .sort(compareOrdered)
    .map(({ value: group }) => ({
      label: group.label,
      items: group.items.sort(compareOrdered).map(({ value }) => value),
    }));
}
