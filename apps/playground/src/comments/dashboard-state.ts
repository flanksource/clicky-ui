import {
  useHistoryRoute,
  type FilterBarMultiFilterMode,
} from "@flanksource/clicky-ui";

export type DashboardState = {
  status: string;
  projects: Record<string, FilterBarMultiFilterMode>;
  pages: Record<string, FilterBarMultiFilterMode>;
  author: string;
  screenshots: string;
  query: string;
  sort: { key: string; dir: "asc" | "desc" } | null;
};

function parseSelections(
  params: URLSearchParams,
  key: string,
): Record<string, FilterBarMultiFilterMode> {
  const selected: Record<string, FilterBarMultiFilterMode> = {};
  for (const value of params.getAll(`comments.${key}`).filter(Boolean))
    selected[value] = "include";
  for (const value of params
    .getAll(`comments.${key}.exclude`)
    .filter(Boolean)) {
    if (selected[value])
      throw new Error(
        `Comment ${key} cannot be both included and excluded: ${value}`,
      );
    selected[value] = "exclude";
  }
  return selected;
}

function parse(_path: string, search: string): DashboardState {
  const params = new URLSearchParams(search);
  const status = params.get("comments.status") ?? "unresolved";
  const screenshots = params.get("comments.screenshots") ?? "all";
  const key = params.get("comments.sort") ?? "updatedAt";
  const dir = params.get("comments.dir") ?? "desc";
  if (
    ![
      "unresolved",
      "all",
      "open",
      "in_progress",
      "resolved",
      "closed",
    ].includes(status)
  )
    throw new Error(`Invalid comment status filter: ${status}`);
  if (!["all", "captured", "missing"].includes(screenshots))
    throw new Error(`Invalid screenshot filter: ${screenshots}`);
  if (
    ![
      "none",
      "body",
      "page",
      "status",
      "author",
      "createdAt",
      "updatedAt",
    ].includes(key)
  )
    throw new Error(`Invalid comment sort: ${key}`);
  if (dir !== "asc" && dir !== "desc")
    throw new Error(`Invalid comment sort direction: ${dir}`);
  return {
    status,
    screenshots,
    projects: parseSelections(params, "project"),
    pages: parseSelections(params, "page"),
    author: params.get("comments.author") ?? "",
    query: params.get("comments.q") ?? "",
    sort: key === "none" ? null : { key, dir },
  };
}

function build(state: DashboardState): string {
  const url = new URL(window.location.href);
  for (const key of [
    "status",
    "page",
    "page.exclude",
    "project",
    "project.exclude",
    "author",
    "screenshots",
    "q",
    "sort",
    "dir",
  ])
    url.searchParams.delete(`comments.${key}`);
  for (const [key, value] of Object.entries({
    status: state.status,
    author: state.author,
    screenshots: state.screenshots,
    q: state.query,
    sort: state.sort?.key ?? "none",
    dir: state.sort?.dir ?? "desc",
  })) {
    if (value) url.searchParams.set(`comments.${key}`, value);
  }
  for (const [key, values] of Object.entries({
    page: state.pages,
    project: state.projects,
  })) {
    for (const [value, mode] of Object.entries(values).sort(([left], [right]) =>
      left.localeCompare(right),
    )) {
      url.searchParams.append(
        `comments.${key}${mode === "exclude" ? ".exclude" : ""}`,
        value,
      );
    }
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useDashboardState() {
  return useHistoryRoute({ parse, build });
}
