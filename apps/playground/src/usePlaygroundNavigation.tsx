import {
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Badge,
  type AppShellNavDrag,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import {
  UiFilePlus,
  UiFolder,
  UiLinkExternal,
  UiPencilSimpleLine,
  UiTrash,
} from "@flanksource/clicky-ui/icons";

import { countOpenCommentsByPage } from "./comments/counts";
import {
  PLAYGROUND_COMMENT_CONFIG,
  type PageComment,
} from "./comments/useComments";
import type { PageAction } from "./editor/PageManagement";
import { buildPlaygroundNavSections } from "./navigation";
import { useExternalCatalog } from "./bookmarklet/external-catalog";
import { activityByPage, matchesActivity, type SidebarSort, type SidebarFilter } from "./sidebar-activity";
import {
  getMetaVersion,
  pageMeta,
  pages,
  subscribeMeta,
  type PageEntry,
} from "./registry";

export type PageActionState = {
  action: PageAction;
  page?: PageEntry;
  initialFolder?: string;
};

export function usePlaygroundNavigation({
  activeSlug,
  allComments,
  query,
  onQueryChange,
  sort,
  filters,
  updates,
  loading,
  folders,
  pageHref,
  actionsDisabled,
  disabledReason,
  drag,
  setPageAction,
}: {
  activeSlug: string | undefined;
  allComments: PageComment[];
  query: string;
  onQueryChange: (query: string) => void;
  sort: SidebarSort;
  filters: SidebarFilter[];
  updates: Record<string, string>;
  loading: boolean;
  folders: string[];
  pageHref: (slug: string) => string;
  actionsDisabled: boolean;
  disabledReason: string | undefined;
  drag: AppShellNavDrag;
  setPageAction: Dispatch<SetStateAction<PageActionState | null>>;
}): AppShellNavSection[] {
  const metaVersion = useSyncExternalStore(
    subscribeMeta,
    getMetaVersion,
    getMetaVersion,
  );
  const external = useExternalCatalog();
  const activity = useMemo(() => activityByPage(allComments, updates), [allComments, updates]);
  const openCommentCounts = useMemo(
    () => countOpenCommentsByPage(allComments, PLAYGROUND_COMMENT_CONFIG),
    [allComments],
  );

  return useMemo(
    () => [
      ...buildPlaygroundNavSections(pages(), folders, {
        activeSlug,
        query,
        activity,
        sort,
        filters,
        pageHref,
        drag,
        metaFor: pageMeta,
        badgeFor: (entry) =>
          commentBadge(openCommentCounts.get(entry.slug) ?? 0),
        folderBadgeFor: (_folder, folderPages) =>
          commentBadge(
            folderPages.reduce(
              (total, page) => total + (openCommentCounts.get(page.slug) ?? 0),
              0,
            ),
          ),
        contextMenuForPage: (entry) => [
          {
            label: "Rename",
            group: "Page",
            icon: UiPencilSimpleLine,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () => setPageAction({ action: "rename", page: entry }),
          },
          {
            label: "Move",
            icon: UiFolder,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () => setPageAction({ action: "move", page: entry }),
          },
          {
            label: "Delete",
            icon: UiTrash,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () => setPageAction({ action: "delete", page: entry }),
          },
        ],
        contextMenuForFolder: (folder) => [
          {
            label: "New page",
            group: "Folder",
            icon: UiFilePlus,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () =>
              setPageAction({ action: "new-page", initialFolder: folder }),
          },
          {
            label: "New folder",
            icon: UiFolder,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () =>
              setPageAction({ action: "new-folder", initialFolder: folder }),
          },
          {
            label: "Delete folder",
            icon: UiTrash,
            disabled: actionsDisabled,
            ...(disabledReason ? { title: disabledReason } : {}),
            onSelect: () =>
              setPageAction({ action: "delete-folder", initialFolder: folder }),
          },
        ],
      }).map((section) => ({ ...section, loading, search: { value: query, onChange: onQueryChange, label: "Filter artifacts" } })),
      {
        label: "External pages",
        variant: "tree",
        loading,
        items: external.pages
          .filter((page) =>
            `${page.title} ${page.urls.join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .filter((page) => matchesActivity(activity.get(page.id), filters, Date.now()))
          .sort((left, right) => sort === "none" ? 0 : (activity.get(right.id)?.[sort] ?? 0) - (activity.get(left.id)?.[sort] ?? 0))
          .map((page) => ({
            key: page.id,
            icon: UiLinkExternal,
            active: activeSlug === page.id,
            label: page.title,
            to: pageHref(page.id),
            badge: commentBadge(openCommentCounts.get(page.id) ?? 0),
          })),
      },
    ],
    [
      activeSlug,
      activity,
      sort,
      filters,
      onQueryChange,
      loading,
      actionsDisabled,
      disabledReason,
      drag,
      folders,
      metaVersion,
      external.pages,
      openCommentCounts,
      pageHref,
      query,
      setPageAction,
    ],
  );
}

function commentBadge(count: number) {
  return count > 0 ? (
    <Badge
      clickToCopy={false}
      count={count}
      size="xxs"
      tone="info"
      variant="soft"
    />
  ) : null;
}
