import {
  UiFileCode,
  UiFolder,
  buildPathTree,
  type AppShellNavGroup,
  type AppShellNavItem,
  type AppShellNavSection,
  type DropdownMenuItem,
  type PathTreeNode,
} from "@flanksource/clicky-ui";
import type { ReactNode } from "react";

import { humanizeSlug, type PageEntry, type PageMeta } from "./registry";

type NavNodeValue =
  | { kind: "folder"; path: string }
  | { kind: "page"; page: PageEntry };

type BuildNavOptions = {
  activeSlug: string | undefined;
  query: string;
  metaFor: (entry: PageEntry) => PageMeta | undefined;
  badgeFor?: (entry: PageEntry) => ReactNode;
  folderBadgeFor?: (folder: string, pages: readonly PageEntry[]) => ReactNode;
  contextMenuForPage?: (entry: PageEntry) => DropdownMenuItem[];
  contextMenuForFolder?: (folder: string) => DropdownMenuItem[];
  pageHref?: (slug: string) => string;
};

function pageMatches(
  entry: PageEntry,
  meta: PageMeta | undefined,
  needle: string,
) {
  return [meta?.title ?? entry.title, entry.slug, meta?.description ?? ""].some(
    (value) => value.toLowerCase().includes(needle),
  );
}

function isWithin(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`);
}

function filterValues(
  entries: readonly PageEntry[],
  folders: readonly string[],
  options: BuildNavOptions,
): NavNodeValue[] {
  const needle = options.query.trim().toLowerCase();
  if (!needle) {
    return [
      ...folders.map((path): NavNodeValue => ({ kind: "folder", path })),
      ...entries.map((page): NavNodeValue => ({ kind: "page", page })),
    ];
  }

  const matchingFolders = folders.filter((folder) =>
    [folder, humanizeSlug(folder)].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
  const pages = entries.filter(
    (entry) =>
      pageMatches(entry, options.metaFor(entry), needle) ||
      matchingFolders.some((folder) => isWithin(entry.slug, folder)),
  );
  const visibleFolders = folders.filter(
    (folder) =>
      matchingFolders.some(
        (matching) => isWithin(folder, matching) || isWithin(matching, folder),
      ) || pages.some((page) => isWithin(page.slug, folder)),
  );
  const boundPages = entries.filter(
    (entry) =>
      pages.includes(entry) ||
      visibleFolders.some((folder) => entry.slug === folder),
  );
  return [
    ...visibleFolders.map((path): NavNodeValue => ({ kind: "folder", path })),
    ...boundPages.map((page): NavNodeValue => ({ kind: "page", page })),
  ];
}

function pageFor(node: PathTreeNode<NavNodeValue>): PageEntry | undefined {
  return node.items.find((item) => item.kind === "page")?.page;
}

function isFolder(node: PathTreeNode<NavNodeValue>): boolean {
  return (
    node.children.length > 0 ||
    node.items.some((item) => item.kind === "folder")
  );
}

function descendantPages(node: PathTreeNode<NavNodeValue>): PageEntry[] {
  const page = pageFor(node);
  return [...(page ? [page] : []), ...node.children.flatMap(descendantPages)];
}

function nodeOrder(
  node: PathTreeNode<NavNodeValue>,
  options: BuildNavOptions,
): number {
  const pages = descendantPages(node);
  if (isFolder(node)) {
    return Math.min(
      ...pages.map(
        (page) => options.metaFor(page)?.groupOrder ?? Number.POSITIVE_INFINITY,
      ),
    );
  }
  const page = pages[0];
  return page
    ? (options.metaFor(page)?.navOrder ?? Number.POSITIVE_INFINITY)
    : Number.POSITIVE_INFINITY;
}

function compareNodes(options: BuildNavOptions) {
  return (
    left: PathTreeNode<NavNodeValue>,
    right: PathTreeNode<NavNodeValue>,
  ) => {
    if (isFolder(left) !== isFolder(right)) return isFolder(left) ? -1 : 1;
    return (
      nodeOrder(left, options) - nodeOrder(right, options) ||
      left.label.localeCompare(right.label)
    );
  };
}

function navItem(
  page: PageEntry,
  options: BuildNavOptions,
  contextMenu = options.contextMenuForPage?.(page),
): AppShellNavItem {
  const meta = options.metaFor(page);
  return {
    key: page.slug,
    label: meta?.title ?? page.title,
    active: page.slug === options.activeSlug,
    to: options.pageHref?.(page.slug) ?? `?page=${encodeURIComponent(page.slug)}`,
    icon: meta?.icon ?? UiFileCode,
    ...(options.badgeFor ? { badge: options.badgeFor(page) } : {}),
    ...(contextMenu
      ? {
          contextMenu,
          contextMenuLabel: `${meta?.title ?? page.title} page actions`,
        }
      : {}),
  };
}

function navGroup(
  node: PathTreeNode<NavNodeValue>,
  options: BuildNavOptions,
): AppShellNavGroup {
  const page = pageFor(node);
  const groups = node.children
    .filter(isFolder)
    .map((child) => navGroup(child, options));
  const folderContextMenu = options.contextMenuForFolder?.(node.key);
  const combinedContextMenu = page
    ? [
        ...(folderContextMenu ?? []),
        ...(options.contextMenuForPage?.(page) ?? []),
      ]
    : [];
  const pageContextMenu =
    combinedContextMenu.length > 0 ? combinedContextMenu : undefined;
  return {
    key: node.key,
    label: humanizeSlug(node.label),
    icon: UiFolder,
    ...(options.activeSlug === node.key ||
    options.activeSlug?.startsWith(`${node.key}/`)
      ? { forceExpanded: true }
      : {}),
    items: node.children
      .filter((child) => !isFolder(child))
      .flatMap((child) =>
        pageFor(child) ? [navItem(pageFor(child)!, options)] : [],
      ),
    groups,
    ...(page ? { item: navItem(page, options, pageContextMenu) } : {}),
    ...(folderContextMenu
      ? {
          contextMenu: folderContextMenu,
          contextMenuLabel: `${humanizeSlug(node.label)} folder actions`,
        }
      : {}),
    ...(options.folderBadgeFor
      ? { badge: options.folderBadgeFor(node.key, descendantPages(node)) }
      : {}),
  };
}

export function buildPlaygroundNavSections(
  entries: readonly PageEntry[],
  folders: readonly string[],
  options: BuildNavOptions,
): AppShellNavSection[] {
  const nodes = buildPathTree(
    filterValues(entries, folders, options),
    (value) =>
      (value.kind === "folder" ? value.path : value.page.slug).split("/"),
    { compare: compareNodes(options) },
  );
  return [
    {
      label: "Pages",
      variant: "tree",
      items: nodes
        .filter((node) => !isFolder(node))
        .flatMap((node) =>
          pageFor(node) ? [navItem(pageFor(node)!, options)] : [],
        ),
      groups: nodes.filter(isFolder).map((node) => navGroup(node, options)),
    },
  ];
}
