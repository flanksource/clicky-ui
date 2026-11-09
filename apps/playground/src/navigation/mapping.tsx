import type { AppShellNavGroup, AppShellNavItem } from "@flanksource/clicky-ui";
import { commentBadge, problemBadge, problemsUnavailableBadge } from "./badges";
import { entryIcon } from "./icons";
import type { EntryMenus } from "./menus";
import type { NavigationEntry } from "./types";

export type NavChildren = { groups: AppShellNavGroup[]; items: AppShellNavItem[]; order: string[] };

export type MappingContext = {
  activeSlug: string | undefined;
  /** What the search box holds right now; items carry it as search text because the server already matched them. */
  query: string;
  pageHref: (slug: string) => string;
  /** Changes whenever everything loaded so far is stale (a new query or a hard refresh). */
  generation: string;
  /** Entries the latest root response opened: the active path and search hits. */
  openKeys: ReadonlySet<string>;
  /** Repository lint counts failed to load; repository rows show this instead of a count. */
  problemsError: string | undefined;
  /** Children already fetched or inlined for a folder key. */
  childrenOf: (key: string) => NavigationEntry[] | undefined;
  loadChildren: (entry: NavigationEntry) => () => Promise<NavChildren>;
  menus: (entry: NavigationEntry) => EntryMenus;
};

const PAGE_ITEM_PREFIX = "page-item:";

function badge(entry: NavigationEntry, problemsError: string | undefined) {
  const comments = commentBadge(entry.activity.openCount);
  const problems =
    entry.source === "repository" && problemsError !== undefined ? problemsUnavailableBadge(problemsError) : problemBadge(entry.problems);
  return comments || problems ? (
    <>
      {comments}
      {problems}
    </>
  ) : null;
}

/** An open folder re-fetches when any of its aggregates moved, so a comment or edit below refreshes just the folders above it. */
function fingerprint(entry: NavigationEntry): string {
  const { updated, commented, resolved, openCount, resolvedCount } = entry.activity;
  return [updated, commented, resolved, openCount, resolvedCount, entry.problems ?? 0].join(".");
}

function mapItem(entry: NavigationEntry, ctx: MappingContext, { key, menu, withBadge = true }: { key: string; menu: EntryMenus["item"]; withBadge?: boolean }): AppShellNavItem {
  const { slug } = entry;
  if (slug === undefined) throw new Error(`Navigation entry ${entry.key} (${entry.kind}) has no slug to link to`);
  return {
    key,
    label: entry.label,
    icon: entryIcon(entry),
    to: ctx.pageHref(slug),
    active: slug === ctx.activeSlug,
    searchText: [entry.label, slug, entry.description ?? "", ctx.query].join(" "),
    ...(withBadge ? { badge: badge(entry, ctx.problemsError) } : {}),
    ...(menu ? { contextMenu: menu.items, contextMenuLabel: menu.label } : {}),
  };
}

function mapGroup(entry: NavigationEntry, ctx: MappingContext): AppShellNavGroup {
  const menus = ctx.menus(entry);
  const loaded = ctx.childrenOf(entry.key);
  const itemKey = entry.source === "pages" ? `${PAGE_ITEM_PREFIX}${entry.slug}` : `folder-page:${entry.slug}`;
  return {
    key: entry.key,
    label: entry.label,
    icon: entryIcon(entry),
    badge: badge(entry, ctx.problemsError),
    defaultCollapsed: true,
    ...(ctx.openKeys.has(entry.key) ? { forceExpanded: true } : {}),
    ...(loaded ? mapEntries(loaded, ctx) : { groups: [], items: [] }),
    ...(entry.hasChildren ? { loadChildren: ctx.loadChildren(entry), version: `${ctx.generation}|${fingerprint(entry)}` } : {}),
    ...(entry.slug === undefined ? {} : { item: mapItem(entry, ctx, { key: itemKey, menu: menus.item, withBadge: false }) }),
    ...(menus.group ? { contextMenu: menus.group.items, contextMenuLabel: menus.group.label } : {}),
  };
}

/** Folders become groups and everything else an item; `order` keeps the server's interleaving of the two. */
export function mapEntries(entries: readonly NavigationEntry[], ctx: MappingContext): NavChildren {
  const groups: AppShellNavGroup[] = [];
  const items: AppShellNavItem[] = [];
  for (const entry of entries) {
    if (entry.kind === "folder") groups.push(mapGroup(entry, ctx));
    else items.push(mapItem(entry, ctx, { key: entry.key, menu: ctx.menus(entry).item }));
  }
  return { groups, items, order: entries.map((entry) => entry.key) };
}

/** Stores the children a response inlined (open folders, and their open folders in turn) under their parent's key. */
export function fillInlineChildren(nodes: Map<string, NavigationEntry[]>, entries: readonly NavigationEntry[]): void {
  for (const entry of entries) {
    if (!entry.children) continue;
    nodes.set(entry.key, entry.children);
    fillInlineChildren(nodes, entry.children);
  }
}

export function collectOpenKeys(entries: readonly NavigationEntry[], into = new Set<string>()): Set<string> {
  for (const entry of entries) {
    if (entry.open) into.add(entry.key);
    if (entry.children) collectOpenKeys(entry.children, into);
  }
  return into;
}
