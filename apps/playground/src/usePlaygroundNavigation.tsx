import {
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Badge, type AppShellNavSection } from "@flanksource/clicky-ui";
import {
  UiFilePlus,
  UiFolder,
  UiPencilSimpleLine,
  UiTrash,
} from "@flanksource/clicky-ui/icons";

import { countOpenCommentsByPage } from "./comments/counts";
import { PLAYGROUND_COMMENT_CONFIG, type PageComment } from "./comments/useComments";
import type { PageAction } from "./editor/PageManagement";
import { buildPlaygroundNavSections } from "./navigation";
import {
  PAGES,
  getMetaVersion,
  pageMeta,
  subscribeMeta,
  type PageEntry,
} from "./registry";

export type PageActionState = {
  action: PageAction;
  page?: PageEntry;
  initialFolder?: string;
};

export function usePlaygroundNavigation({
  active,
  allComments,
  query,
  folders,
  pageHref,
  actionsDisabled,
  disabledReason,
  setPageAction,
}: {
  active: PageEntry | undefined;
  allComments: PageComment[];
  query: string;
  folders: string[];
  pageHref: (slug: string) => string;
  actionsDisabled: boolean;
  disabledReason: string | undefined;
  setPageAction: Dispatch<SetStateAction<PageActionState | null>>;
}): AppShellNavSection[] {
  const metaVersion = useSyncExternalStore(
    subscribeMeta,
    getMetaVersion,
    getMetaVersion,
  );
  const openCommentCounts = useMemo(
    () => countOpenCommentsByPage(allComments, PLAYGROUND_COMMENT_CONFIG),
    [allComments],
  );

  return useMemo(
    () =>
      buildPlaygroundNavSections(PAGES, folders, {
        activeSlug: active?.slug,
        query,
        pageHref,
        metaFor: pageMeta,
        badgeFor: (entry) => commentBadge(openCommentCounts.get(entry.slug) ?? 0),
        folderBadgeFor: (_folder, pages) =>
          commentBadge(
            pages.reduce(
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
        ],
      }),
    [
      active?.slug,
      actionsDisabled,
      disabledReason,
      folders,
      metaVersion,
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
