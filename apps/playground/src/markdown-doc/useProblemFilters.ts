import { useHistoryRoute } from "@flanksource/clicky-ui";
import type { ProblemFilters } from "@flanksource/clicky-ui/file-findings";

function parse(_path: string, search: string): ProblemFilters {
  const params = new URLSearchParams(search);
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
    throw new Error("Invalid problem severity filter");
  return {
    severity: severity as ProblemFilters["severity"],
    type: decode("problems.type"),
  };
}
function build(filters: ProblemFilters) {
  const url = new URL(window.location.href);
  for (const [key, values] of [
    ["problems.severity", filters.severity],
    ["problems.type", filters.type],
  ] as const) {
    url.searchParams.delete(key);
    for (const [value, mode] of values)
      url.searchParams.append(key, `${mode === "exclude" ? "!" : ""}${value}`);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
export function useProblemFilters() {
  return useHistoryRoute({ parse, build });
}
