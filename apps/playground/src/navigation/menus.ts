import type { DropdownMenuItem } from "@flanksource/clicky-ui";
import { UiFilePlus, UiFolder, UiPencilSimpleLine, UiTrash } from "@flanksource/clicky-ui/icons";
import type { PageAction } from "../editor/PageManagement";
import type { PageEntry } from "../registry";
import type { NavigationEntry, NavigationRepositoryRef } from "./types";

export type PageActionState = {
  action: PageAction;
  page?: PageEntry;
  initialFolder?: string;
};

/** What a repository folder's context menu does; the repository dialogs and prompt runner live with the caller. */
export type RepositoryMenuActions = {
  refresh: () => void;
  lint: (folder: NavigationRepositoryRef) => void;
  openMarkdown: (repositoryId: string) => void;
  editRules: (folder: NavigationRepositoryRef) => void;
};

export type NavigationMenuDeps = {
  actionsDisabled: boolean;
  disabledReason: string | undefined;
  setPageAction: (state: PageActionState) => void;
  /** The registry page behind a page slug; the page actions edit that registry entry. */
  pageFor: (slug: string) => PageEntry | undefined;
  repository: RepositoryMenuActions;
};

export type EntryMenu = { items: DropdownMenuItem[]; label: string };

/**
 * The context menus an entry carries. A folder has one for its row; a page folder that is also a page
 * (`slug` set) has a second, for its link, holding the folder actions followed by the page actions.
 * Documents, external pages and the External pages folder have none.
 */
export type EntryMenus = { group?: EntryMenu; item?: EntryMenu };

const MISSING_PAGE = "This page is not in the loaded page list yet; reload the playground";

function pageMenu(entry: NavigationEntry, deps: NavigationMenuDeps): DropdownMenuItem[] {
  const page = entry.slug === undefined ? undefined : deps.pageFor(entry.slug);
  const disabled = deps.actionsDisabled || page === undefined;
  const title = deps.disabledReason ?? (page === undefined ? MISSING_PAGE : undefined);
  const item = (label: string, action: PageAction, icon: NonNullable<DropdownMenuItem["icon"]>, group?: string): DropdownMenuItem => ({
    label,
    ...(group ? { group } : {}),
    icon,
    disabled,
    ...(title && disabled ? { title } : {}),
    onSelect: () => {
      if (!page) throw new Error(`${action} needs a loaded page for "${entry.slug}"`);
      deps.setPageAction({ action, page });
    },
  });
  return [item("Rename", "rename", UiPencilSimpleLine, "Page"), item("Move", "move", UiFolder), item("Delete", "delete", UiTrash)];
}

function pageFolderMenu(entry: NavigationEntry, deps: NavigationMenuDeps): DropdownMenuItem[] {
  const folder = entry.folderPath;
  if (folder === undefined) throw new Error(`Page folder ${entry.key} has no folderPath`);
  const item = (label: string, action: PageAction, icon: NonNullable<DropdownMenuItem["icon"]>, group?: string): DropdownMenuItem => ({
    label,
    ...(group ? { group } : {}),
    icon,
    disabled: deps.actionsDisabled,
    ...(deps.disabledReason ? { title: deps.disabledReason } : {}),
    onSelect: () => deps.setPageAction({ action, initialFolder: folder }),
  });
  return [item("New page", "new-page", UiFilePlus, "Folder"), item("New folder", "new-folder", UiFolder), item("Delete folder", "delete-folder", UiTrash)];
}

function repositoryFolderMenu(entry: NavigationEntry, deps: NavigationMenuDeps): DropdownMenuItem[] {
  const folder = entry.repository;
  if (!folder) throw new Error(`Repository folder ${entry.key} has no repository reference`);
  const { repository } = deps;
  return [
    { label: "Refresh", onSelect: repository.refresh },
    { label: "Run prompt linter…", onSelect: () => repository.lint(folder) },
    { label: "Open Markdown by path…", onSelect: () => repository.openMarkdown(folder.id) },
    { label: "Sidebar folder and ignore rules…", onSelect: () => repository.editRules(folder) },
  ];
}

export function entryMenus(entry: NavigationEntry, deps: NavigationMenuDeps): EntryMenus {
  if (entry.source === "pages" && entry.kind === "page") return { item: { items: pageMenu(entry, deps), label: `${entry.label} page actions` } };
  if (entry.source === "pages" && entry.kind === "folder") {
    const folder = pageFolderMenu(entry, deps);
    return {
      group: { items: folder, label: `${entry.label} folder actions` },
      ...(entry.slug === undefined ? {} : { item: { items: [...folder, ...pageMenu(entry, deps)], label: `${entry.label} page actions` } }),
    };
  }
  if (entry.source === "repository" && entry.kind === "folder") return { group: { items: repositoryFolderMenu(entry, deps), label: `${entry.label} folder actions` } };
  return {};
}
