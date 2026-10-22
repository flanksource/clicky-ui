import type { FilterBarMultiFilterMode } from "@flanksource/clicky-ui";
import type { DashboardState } from "./dashboard-state";
import type { PageComment } from "./useComments";

export function commentProject(page: string): string {
  if (page.startsWith("external:")) return "__external__";
  const project = page.split("/")[0];
  if (!project) throw new Error("Comment page must have a project");
  return project;
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
    const status = comment.status ?? "open";
    const captured = comment.element?.screenshot?.status === "captured";
    return (
      (state.status === "all" ||
        (state.status === "unresolved"
          ? status === "open" || status === "in_progress"
          : status === state.status)) &&
      matchesSelection(commentProject(comment.page), state.projects) &&
      matchesSelection(comment.page, state.pages) &&
      (!state.author || comment.author?.name === state.author) &&
      (state.screenshots === "all" ||
        (state.screenshots === "captured" ? captured : !captured)) &&
      [
        comment.body,
        comment.page,
        comment.author?.name ?? "Anonymous",
        comment.element?.componentName ?? "",
        status.replaceAll("_", " "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });
}
