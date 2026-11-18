import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type {
  AppShellNavItem,
  AppShellNavSection,
} from "@flanksource/clicky-ui";
import { UiFileCode, UiLinkExternal } from "@flanksource/clicky-ui/icons";
import { useExternalCatalog } from "./bookmarklet/external-catalog";
import {
  getMetaVersion,
  loadMetadata,
  pageMeta,
  pageTitle,
  pages,
  subscribeMeta,
} from "./registry";
import {
  matchesActivity,
  type PageActivity,
  type SidebarFilter,
} from "./sidebar-activity";
import { isRecent } from "./sidebar-visibility";
import { repositoryPage } from "./documents/catalog";

type RecentPage = {
  kind?: "pages" | "external" | "markdown";
  slug: string;
  title: string;
  description?: string;
  icon: NonNullable<AppShellNavItem["icon"]>;
};

export function buildRecentSection({
  entries,
  activity,
  query,
  filters,
  pageHref,
  loading,
}: {
  entries: RecentPage[];
  activity: Map<string, PageActivity>;
  query: string;
  filters: SidebarFilter[];
  pageHref: (slug: string) => string;
  loading: boolean;
}): AppShellNavSection {
  const recent = (slug: string) =>
    Math.max(
      activity.get(slug)?.updated ?? 0,
      activity.get(slug)?.commented ?? 0,
    );
  const needle = query.trim().toLowerCase();
  const now = Date.now();
  const sorted = entries
    .filter((page) => isRecent(activity.get(page.slug), now))
    .filter((page) =>
      `${page.title} ${page.slug} ${page.description ?? ""}`
        .toLowerCase()
        .includes(needle),
    )
    .filter((page) => matchesActivity(activity.get(page.slug), filters))
    .sort(
      (left, right) =>
        recent(right.slug) - recent(left.slug) ||
        left.slug.localeCompare(right.slug),
    );
  const items = sorted.map((page) => {
    const names = [...(activity.get(page.slug)?.waitingOn ?? [])].sort();
    const status = names.length
      ? `Waiting on ${names.join(", ")}`
      : "No pending feedback";
    return {
      key: `recent:${page.slug}`,
      icon: page.icon,
      to: pageHref(page.slug),
      label: (
        <span
          className="block min-w-0"
          title={`${page.slug}\n${status}`}
          data-recent-page={page.slug}
        >
          <span className="block truncate">{page.title}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {names.length > 0 && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
            )}
            <span className="truncate">{status}</span>
          </span>
        </span>
      ),
    };
  });
  return {
    label: "Recent",
    loading,
    items,
    groups: (["external", "pages", "markdown"] as const).map((kind) => ({
      key: kind,
      label:
        kind === "external"
          ? "External"
          : kind === "pages"
            ? "Pages"
            : "Markdown",
      items: items.filter(
        (_, index) => (sorted[index]?.kind ?? "pages") === kind,
      ),
    })),
  };
}

/**
 * The header Recent dropdown: pages and external pages edited or commented in the last 7 days.
 * Their page metadata (title, icon) is loaded here, together with the open page's, because the
 * sidebar tree no longer touches the registry.
 */
export function useRecentSection({
  activeSlug,
  activity,
  query,
  filters,
  pageHref,
  loading,
}: {
  activeSlug: string | undefined;
  activity: Map<string, PageActivity>;
  query: string;
  filters: SidebarFilter[];
  pageHref: (slug: string) => string;
  loading: boolean;
}): { recent: AppShellNavSection; metadataError: string | null } {
  const external = useExternalCatalog();
  const metaVersion = useSyncExternalStore(
    subscribeMeta,
    getMetaVersion,
    getMetaVersion,
  );
  // pages() reads the registry store, which metaVersion tracks.
  const entries = useMemo(() => pages(), [metaVersion]);
  const wanted = entries.filter(
    (page) => page.slug === activeSlug || isRecent(activity.get(page.slug)),
  );
  const wantedKey = wanted.map((page) => page.slug).join("\n");
  const [metadataError, setMetadataError] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    void loadMetadata(wanted).then(
      () => {
        if (!disposed) setMetadataError(null);
      },
      (cause: unknown) => {
        if (!disposed)
          setMetadataError(
            cause instanceof Error ? cause.message : String(cause),
          );
      },
    );
    return () => {
      disposed = true;
    };
  }, [wantedKey]);
  const recent = useMemo(
    () =>
      buildRecentSection({
        entries: [
          ...entries.map((page) => ({
            kind:
              page.kind === "markdown"
                ? ("markdown" as const)
                : ("pages" as const),
            slug: page.slug,
            title: pageTitle(page),
            description: pageMeta(page)?.description ?? "",
            icon: pageMeta(page)?.icon ?? UiFileCode,
          })),
          ...external.pages.map((page) => ({
            kind: "external" as const,
            slug: page.id,
            title: page.title,
            description: page.urls.join(" "),
            icon: UiLinkExternal,
          })),
          ...[...activity.keys()]
            .filter((slug) => slug.startsWith("document:"))
            .map((slug) => {
              const page = repositoryPage(slug);
              return {
                kind: "markdown" as const,
                slug,
                title: page.title ?? page.file,
                description: page.file,
                icon: UiFileCode,
              };
            }),
        ],
        activity,
        query,
        filters,
        pageHref,
        loading,
      }),
    [
      entries,
      metaVersion,
      external.pages,
      activity,
      query,
      filters,
      pageHref,
      loading,
    ],
  );
  return { recent, metadataError };
}
