import type {
  NavigationActivity,
  NavigationAge,
  NavigationEntry,
  NavigationFilter,
  NavigationSort,
} from "../../src/navigation/types";

export const RECENT_WINDOW = 7 * 24 * 60 * 60 * 1000;
export const EXTERNAL_KEY = "external";

/** What a request asks for, with `now` pinned so one response uses one clock. */
export type ViewOptions = {
  sort: NavigationSort;
  filters: readonly NavigationFilter[];
  age: NavigationAge;
  query: string;
  active: string | undefined;
  now: number;
};

export type PageRecord = {
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  navOrder?: number;
  groupOrder?: number;
  activity: NavigationActivity;
};

export type ExternalRecord = {
  id: string;
  title: string;
  urls: readonly string[];
  activity: NavigationActivity;
};

/** An entry plus the data only sorting needs: manual order and the raw label. */
export type Ranked = { entry: NavigationEntry; order: number; label: string };

export const emptyActivity = (): NavigationActivity => ({ updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0 });

export function matchesActivity(activity: NavigationActivity | undefined, filters: readonly NavigationFilter[]): boolean {
  return !filters.length || filters.some((filter) => (filter === "open" ? Boolean(activity?.openCount) : Boolean(activity?.resolvedCount)));
}

export function isRecent(activity: Pick<NavigationActivity, "updated" | "commented"> | undefined, now: number): boolean {
  return Math.max(activity?.updated ?? 0, activity?.commented ?? 0) >= now - RECENT_WINDOW;
}

export function visibleByAge(options: { slug: string; age: NavigationAge; query: string; activeSlug: string | undefined; activity: NavigationActivity | undefined; now: number }): boolean {
  return options.age === "all" || Boolean(options.query.trim()) || options.slug === options.activeSlug || isRecent(options.activity, options.now);
}

export function humanizeSlug(slug: string): string {
  const leaf = slug.split("/").pop() ?? slug;
  const words = leaf.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function mergeActivities(items: readonly (NavigationActivity | undefined)[]): NavigationActivity {
  const total = emptyActivity();
  const waiting = new Set<string>();
  for (const item of items) {
    if (!item) continue;
    total.updated = Math.max(total.updated, item.updated);
    total.commented = Math.max(total.commented, item.commented);
    total.resolved = Math.max(total.resolved, item.resolved);
    total.openCount += item.openCount;
    total.resolvedCount += item.resolvedCount;
    for (const name of item.waitingOn ?? []) waiting.add(name);
  }
  return waiting.size ? { ...total, waitingOn: [...waiting].sort() } : total;
}

export function rank(activity: NavigationActivity, sort: NavigationSort): number {
  return sort === "none" ? Math.max(activity.updated, activity.commented) : activity[sort];
}

const compareOrder = (left: number, right: number) => (left === right ? 0 : left < right ? -1 : 1);

/**
 * Most active first (folders by their most active descendant), then folders
 * before leaves, then manual order, then label.
 */
export function sortRanked(items: readonly Ranked[], sort: NavigationSort): NavigationEntry[] {
  return [...items]
    .sort(
      (left, right) =>
        rank(right.entry.activity, sort) - rank(left.entry.activity, sort) ||
        Number(right.entry.kind === "folder") - Number(left.entry.kind === "folder") ||
        compareOrder(left.order, right.order) ||
        left.label.localeCompare(right.label),
    )
    .map((item) => item.entry);
}

/** Keeps `children` only where an entry is open; closed entries stay lazy. */
export function shapeOpen(entries: readonly NavigationEntry[]): NavigationEntry[] {
  return entries.map((entry) => {
    const { children, ...rest } = entry;
    return entry.open && children ? { ...rest, children: shapeOpen(children) } : rest;
  });
}

export function findEntry(entries: readonly NavigationEntry[], key: string): NavigationEntry | undefined {
  for (const entry of entries) {
    if (entry.key === key) return entry;
    const found = entry.children && findEntry(entry.children, key);
    if (found) return found;
  }
  return undefined;
}

const isWithin = (path: string, folder: string) => path === folder || path.startsWith(`${folder}/`);

/** Folders to show: those holding a visible page, plus truly empty ones (no page anywhere below). */
export function navigableFolders(folders: readonly string[], allPages: readonly { slug: string }[], visiblePages: readonly { slug: string }[]): string[] {
  return folders.filter(
    (folder) => visiblePages.some((page) => page.slug.startsWith(`${folder}/`)) || !allPages.some((page) => page.slug.startsWith(`${folder}/`)),
  );
}

const pageMatches = (page: PageRecord, needle: string) =>
  [page.title, page.slug, page.description ?? ""].some((value) => value.toLowerCase().includes(needle));

export type PageSelection = { folders: string[]; pages: PageRecord[] };

/** Age, activity filters and search over pages and (possibly empty) folders. */
export function selectPages(pages: readonly PageRecord[], folders: readonly string[], options: ViewOptions): PageSelection {
  const needle = options.query.trim().toLowerCase();
  const aged = pages.filter((page) => visibleByAge({ slug: page.slug, age: options.age, query: options.query, activeSlug: options.active, activity: page.activity, now: options.now }));
  const entries = aged.filter((page) => matchesActivity(page.activity, options.filters));
  let visibleFolders = navigableFolders(folders, pages, aged);
  if (options.filters.length) visibleFolders = visibleFolders.filter((folder) => entries.some((page) => isWithin(page.slug, folder)));
  if (!needle) return { folders: visibleFolders, pages: entries };

  const matchingFolders = visibleFolders.filter((folder) => [folder, humanizeSlug(folder)].some((value) => value.toLowerCase().includes(needle)));
  const hits = entries.filter((page) => pageMatches(page, needle) || matchingFolders.some((folder) => isWithin(page.slug, folder)));
  const shownFolders = visibleFolders.filter(
    (folder) => matchingFolders.some((matching) => isWithin(folder, matching) || isWithin(matching, folder)) || hits.some((page) => isWithin(page.slug, folder)),
  );
  return { folders: shownFolders, pages: entries.filter((page) => hits.includes(page) || shownFolders.includes(page.slug)) };
}

type TrieNode = { path: string; folder: boolean; page?: PageRecord; children: Map<string, TrieNode> };

function trieOf({ folders, pages }: PageSelection): TrieNode {
  const root: TrieNode = { path: "", folder: false, children: new Map() };
  const node = (path: string) => {
    let current = root;
    path.split("/").forEach((segment, index, segments) => {
      const next = current.children.get(segment) ?? { path: segments.slice(0, index + 1).join("/"), folder: false, children: new Map() };
      current.children.set(segment, next);
      current = next;
    });
    return current;
  };
  for (const folder of folders) node(folder).folder = true;
  for (const page of pages) node(page.slug).page = page;
  return root;
}

const descendantPages = (node: TrieNode): PageRecord[] => [...(node.page ? [node.page] : []), ...[...node.children.values()].flatMap(descendantPages)];
const isFolderNode = (node: TrieNode) => node.children.size > 0 || node.folder;

function pageNodeEntry(node: TrieNode, options: ViewOptions): Ranked {
  const segment = node.path.split("/").at(-1)!;
  const children = [...node.children.values()].map((child) => pageNodeEntry(child, options));
  const pages = descendantPages(node);
  if (!isFolderNode(node)) {
    const page = node.page!;
    return {
      entry: {
        key: `page-item:${page.slug}`,
        kind: "page",
        label: page.title,
        slug: page.slug,
        ...(page.icon ? { icon: page.icon } : {}),
        ...(page.description ? { description: page.description } : {}),
        source: "pages",
        hasChildren: false,
        activity: page.activity,
      },
      order: page.navOrder ?? Number.POSITIVE_INFINITY,
      label: segment,
    };
  }
  const open = Boolean(options.query.trim()) || options.active === node.path || Boolean(options.active?.startsWith(`${node.path}/`));
  return {
    entry: {
      key: `page:${node.path}`,
      kind: "folder",
      label: humanizeSlug(node.path),
      ...(node.page ? { slug: node.page.slug } : {}),
      ...(node.page?.description ? { description: node.page.description } : {}),
      source: "pages",
      hasChildren: children.length > 0,
      ...(open ? { open: true } : {}),
      children: sortRanked(children, options.sort),
      activity: mergeActivities(pages.map((page) => page.activity)),
      folderPath: node.path,
    },
    order: Math.min(...pages.map((page) => page.groupOrder ?? Number.POSITIVE_INFINITY)),
    label: segment,
  };
}

/** Top-level page folders and pages, fully nested (children of closed folders are stripped later by `shapeOpen`). */
export function pageEntries(selection: PageSelection, options: ViewOptions): Ranked[] {
  return [...trieOf(selection).children.values()].map((node) => pageNodeEntry(node, options));
}

export function selectExternal(pages: readonly ExternalRecord[], options: ViewOptions): ExternalRecord[] {
  const needle = options.query.trim().toLowerCase();
  return pages.filter(
    (page) =>
      `${page.title} ${page.urls.join(" ")}`.toLowerCase().includes(needle) &&
      visibleByAge({ slug: page.id, age: options.age, query: options.query, activeSlug: options.active, activity: page.activity, now: options.now }) &&
      matchesActivity(page.activity, options.filters),
  );
}

/** The "External pages" folder, or undefined when no external page is left to show. */
export function externalFolder(pages: readonly ExternalRecord[], options: ViewOptions): NavigationEntry | undefined {
  if (!pages.length) return undefined;
  const children = pages.map(
    (page): Ranked => ({
      entry: {
        key: page.id,
        kind: "external",
        label: page.title,
        slug: page.id,
        icon: "UiLinkExternal",
        description: page.urls.join(" "),
        source: "external",
        hasChildren: false,
        activity: page.activity,
      },
      order: Number.POSITIVE_INFINITY,
      label: page.title,
    }),
  );
  const open = Boolean(options.query.trim()) || Boolean(options.active?.startsWith("external:"));
  return {
    key: EXTERNAL_KEY,
    kind: "folder",
    label: "External pages",
    source: "external",
    hasChildren: true,
    ...(open ? { open: true } : {}),
    children: sortRanked(children, options.sort),
    activity: mergeActivities(pages.map((page) => page.activity)),
  };
}

/** Entries `age=recent` hides: not active, not recent, and matching the filters. */
export function countOlder(items: readonly { slug: string; activity: NavigationActivity }[], options: ViewOptions): number {
  return items.filter((item) => item.slug !== options.active && !isRecent(item.activity, options.now) && matchesActivity(item.activity, options.filters)).length;
}
