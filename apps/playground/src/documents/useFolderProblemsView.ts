import {
  useHistoryRoute,
  LINT_GROUPINGS,
  type LintFilters,
  type LintGrouping,
  type LintView,
} from "@flanksource/clicky-ui";

type FolderProblemsView = {
  grouping: LintGrouping;
  view: LintView;
  filters: LintFilters;
  selected: string | null;
  expandAll: boolean | null;
};

function parse(_path: string, search: string): FolderProblemsView {
  const params = new URLSearchParams(search);
  const grouping = params.get("problems.grouping") ?? "file-linter-rule";
  const view = params.get("problems.view") ?? "table";
  if (!LINT_GROUPINGS.includes(grouping as LintGrouping))
    throw new Error("Invalid problem grouping");
  if (view !== "table" && view !== "tree")
    throw new Error("Invalid problem view");
  const decode = (key: string) =>
    new Map(
      params
        .getAll(key)
        .map((token) => [
          token.startsWith("!") ? token.slice(1) : token,
          token.startsWith("!") ? ("exclude" as const) : ("include" as const),
        ]),
    );
  const severity = decode("problems.severity");
  if (
    [...severity.keys()].some(
      (value) => !["error", "warning", "info"].includes(value),
    )
  )
    throw new Error("Invalid problem severity");
  const expanded = params.get("problems.expanded");
  if (expanded !== null && expanded !== "true" && expanded !== "false")
    throw new Error("Invalid problem expansion state");
  return {
    grouping: grouping as LintGrouping,
    view,
    filters: {
      severity: severity as LintFilters["severity"],
      linter: decode("problems.linter"),
    },
    selected: params.get("problems.selected"),
    expandAll: expanded === null ? null : expanded === "true",
  };
}

function build(state: FolderProblemsView) {
  const url = new URL(window.location.href);
  for (const [name, value] of Object.entries({
    grouping: state.grouping,
    view: state.view,
    selected: state.selected,
    expanded: state.expandAll,
  })) {
    url.searchParams.delete(`problems.${name}`);
    if (value !== null) url.searchParams.set(`problems.${name}`, String(value));
  }
  for (const [name, values] of Object.entries(state.filters)) {
    url.searchParams.delete(`problems.${name}`);
    for (const [value, mode] of values)
      url.searchParams.append(
        `problems.${name}`,
        `${mode === "exclude" ? "!" : ""}${value}`,
      );
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useFolderProblemsView() {
  return useHistoryRoute({ parse, build });
}
