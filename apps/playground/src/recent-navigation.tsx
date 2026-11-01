import type {
  AppShellNavItem,
  AppShellNavSection,
} from "@flanksource/clicky-ui";
import {
  matchesActivity,
  type PageActivity,
  type SidebarFilter,
} from "./sidebar-activity";

type RecentPage = {
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
  activeSlug,
  pageHref,
  loading,
}: {
  entries: RecentPage[];
  activity: Map<string, PageActivity>;
  query: string;
  filters: SidebarFilter[];
  activeSlug: string | undefined;
  pageHref: (slug: string) => string;
  loading: boolean;
}): AppShellNavSection {
  const recent = (slug: string) => Math.max(activity.get(slug)?.updated ?? 0, activity.get(slug)?.commented ?? 0);
  const needle = query.trim().toLowerCase();
  const now = Date.now();
  return {
    label: "Recent",
    loading,
    items: entries
      .filter((page) => recent(page.slug) > 0)
      .filter((page) =>
        `${page.title} ${page.slug} ${page.description ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
      .filter((page) => matchesActivity(activity.get(page.slug), filters, now))
      .sort(
        (left, right) =>
          recent(right.slug) - recent(left.slug) ||
          left.slug.localeCompare(right.slug),
      )
      .slice(0, 8)
      .map((page) => {
        const names = [...(activity.get(page.slug)?.waitingOn ?? [])].sort();
        const status = names.length
          ? `Waiting on ${names.join(", ")}`
          : "No pending feedback";
        return {
          key: `recent:${page.slug}`,
          icon: page.icon,
          to: pageHref(page.slug),
          active: activeSlug === page.slug,
          label: (
            <span
              className="block min-w-0"
              title={`${page.slug}\n${status}`}
              data-recent-page={page.slug}
            >
              <span className="block truncate">{page.title}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-sidebar-foreground/65">
                {names.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-sidebar-primary"
                  />
                )}
                <span className="truncate">{status}</span>
              </span>
            </span>
          ),
        };
      }),
  };
}
