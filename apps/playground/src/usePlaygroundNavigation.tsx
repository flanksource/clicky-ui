import {
  useEffect,
  useState,
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
  UiFileCode,
  UiFilePlus,
  UiFolder,
  UiLinkExternal,
  UiPencilSimpleLine,
  UiTrash,
} from "@flanksource/clicky-ui/icons";

import type { FeedbackActivity } from "../plugins/comment-activity";
import type { PageAction } from "./editor/PageManagement";
import { buildPlaygroundNavSections } from "./navigation";
import { buildRecentSection } from "./recent-navigation";
import { useExternalCatalog } from "./bookmarklet/external-catalog";
import { mergeActivity, matchesActivity, type SidebarSort, type SidebarFilter } from "./sidebar-activity";
import { visibleByAge } from "./sidebar-visibility";
import {
  loadMetadata,
  getMetaVersion,
  pageMeta,
  pageTitle,
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
  feedback,
  age,
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
  feedback: Record<string, FeedbackActivity>;
  age: "recent" | "all";
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
  const activity = useMemo(() => mergeActivity(feedback, updates), [feedback, updates]);
  const entries = pages();
  const visible = entries.filter((page) => visibleByAge({ slug: page.slug, age, query, activeSlug, activity: activity.get(page.slug) }));
  const metadataKey = (!activeSlug ? entries : visible).map((page) => page.slug).join("\n");
  const [metadataError, setMetadataError] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    void loadMetadata(pages().filter((page) => metadataKey.split("\n").includes(page.slug))).then(
      () => { if (!disposed) setMetadataError(null); },
      (cause: unknown) => { if (!disposed) setMetadataError(cause instanceof Error ? cause.message : String(cause)); },
    );
    return () => { disposed = true; };
  }, [metadataKey]);
  const openCommentCounts = useMemo(() => new Map([...activity].map(([slug, value]) => [slug, value.openCount])), [activity]);

  return useMemo(
    () => [
      ...(metadataError ? [{ label: "Metadata error", items: [{ key: "metadata-error", label: <span role="alert">{metadataError}</span>, to: pageHref(activeSlug ?? "") }] }] : []),
      buildRecentSection({
        entries: [
          ...visible.map((page) => ({
            slug: page.slug,
            title: pageTitle(page),
            description: pageMeta(page)?.description ?? "",
            icon: pageMeta(page)?.icon ?? UiFileCode,
          })),
          ...external.pages.filter((page) => visibleByAge({ slug: page.id, age, query, activeSlug, activity: activity.get(page.id) })).map((page) => ({
            slug: page.id,
            title: page.title,
            description: page.urls.join(" "),
            icon: UiLinkExternal,
          })),
        ],
        activity,
        query,
        filters,
        activeSlug,
        pageHref,
        loading,
      }),
      ...buildPlaygroundNavSections(visible, age === "all" && !query ? folders : folders.filter((folder) => visible.some((page) => page.slug.startsWith(`${folder}/`))), {
        activeSlug,
        query,
        activity: sort === "none" ? new Map([...activity].map(([slug, value]) => [slug, { ...value, updated: Math.max(value.updated, value.commented) }])) : activity,
        sort: sort === "none" ? "updated" : sort,
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
          .filter((page) => visibleByAge({ slug: page.id, age, query, activeSlug, activity: activity.get(page.id) }) && matchesActivity(activity.get(page.id), filters, Date.now()))
          .sort((left, right) => sort === "none"
            ? Math.max(activity.get(right.id)?.updated ?? 0, activity.get(right.id)?.commented ?? 0) - Math.max(activity.get(left.id)?.updated ?? 0, activity.get(left.id)?.commented ?? 0)
            : (activity.get(right.id)?.[sort] ?? 0) - (activity.get(left.id)?.[sort] ?? 0))
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
      feedback,
  age,
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
      metadataKey,
      metadataError,
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
