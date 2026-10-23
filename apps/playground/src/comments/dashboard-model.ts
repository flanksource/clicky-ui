import type { FilterBarMultiFilterMode } from "@flanksource/clicky-ui";
// The copied watcher script loads this file under plain Node type stripping,
// which needs the extension and an import-free module on the other side.
import {
  IMPLICIT_STATUS,
  isUnresolvedStatus,
} from "../../plugins/comments-statuses.ts";
// Same constraint as above, so this relative source import (not the package
// entry, which resolves to a built dist) keeps the module Node-loadable.
import { matchesTreeSelection } from "../../../../packages/ui/src/lib/path-tree.ts";
import type { DashboardState } from "./dashboard-state";
import type { PageComment } from "./useComments";

/** Assignee filter value that selects roots nobody holds. */
export const UNASSIGNED = "__unassigned__";

/**
 * Synthetic root of the Pages tree that holds every `external:<uuid>` page.
 * Page slugs are lowercase alphanumerics and hyphens, so this can never be the
 * first segment of a real page.
 */
export const EXTERNAL_PAGES_ROOT = "__external__";

export function commentProject(page: string): string {
  if (page.startsWith("external:")) return EXTERNAL_PAGES_ROOT;
  const project = page.split("/")[0];
  if (!project) throw new Error("Comment page must have a project");
  return project;
}

/**
 * The Pages tree path of a comment's page. External pages have no "/" of their
 * own, so they sit one level under the synthetic root; the tree builder and the
 * matcher both go through here so a root key selects exactly those pages.
 */
export function commentPageTreePath(page: string): string {
  return page.startsWith("external:") ? `${EXTERNAL_PAGES_ROOT}/${page}` : page;
}

function matchesSelection(
  value: string,
  selected: Record<string, FilterBarMultiFilterMode>,
): boolean {
  if (selected[value] === "exclude") return false;
  const included = Object.entries(selected).filter(
    ([, mode]) => mode === "include",
  );
  return included.length === 0 || selected[value] === "include";
}

export function filterDashboardComments(
  comments: PageComment[],
  state: DashboardState,
): PageComment[] {
  const query = state.query.trim().toLowerCase();
  return comments.filter((comment) => {
    if (comment.parentId) return false;
    const status = comment.status ?? IMPLICIT_STATUS;
    const captured = comment.element?.screenshot?.status === "captured";
    return (
      (state.status === "all" ||
        (state.status === "unresolved"
          ? isUnresolvedStatus(status)
          : status === state.status)) &&
      matchesSelection(commentProject(comment.page), state.projects) &&
      matchesTreeSelection(commentPageTreePath(comment.page), state.pages) &&
      (!state.author || comment.author?.name === state.author) &&
      (!state.assignee ||
        (state.assignee === UNASSIGNED
          ? !comment.assignee
          : comment.assignee?.name === state.assignee)) &&
      (state.screenshots === "all" ||
        (state.screenshots === "captured" ? captured : !captured)) &&
      [
        comment.body,
        comment.page,
        comment.author?.name ?? "Anonymous",
        comment.assignee?.name ?? "",
        comment.element?.componentName ?? "",
        status.replaceAll("_", " "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });
}
