import { useHistoryRoute } from "@flanksource/clicky-ui";
import type { SidebarFilter, SidebarSort } from "./sidebar-activity";

export type SidebarState = { sort: SidebarSort; filters: SidebarFilter[]; query: string; age: "recent" | "all" };

export function parseSidebarState(_path: string, search: string): SidebarState {
  const params = new URLSearchParams(search);
  const age = params.get("sidebar.age") ?? "recent";
  if (age !== "recent" && age !== "all") throw new Error(`Invalid sidebar age: ${age}`);
  const sort = params.get("sidebar.sort") ?? "none";
  const filters = (params.get("sidebar.filters") ?? "").split(",").filter(Boolean);
  if (!["none", "updated", "commented", "resolved"].includes(sort)) throw new Error(`Invalid sidebar sort: ${sort}`);
  const invalidFilter = filters.find((filter) => !["open", "resolved"].includes(filter));
  if (invalidFilter !== undefined) throw new Error(`Invalid sidebar filter: ${invalidFilter}`);
  return { age, sort: sort as SidebarSort, filters: filters as SidebarFilter[], query: params.get("sidebar.q") ?? "" };
}

export function buildSidebarState(state: SidebarState): string {
  const url = new URL(window.location.href);
  for (const key of ["sidebar.sort", "sidebar.filters", "sidebar.q", "sidebar.age"]) url.searchParams.delete(key);
  if (state.sort !== "none") url.searchParams.set("sidebar.sort", state.sort);
  if (state.filters.length) url.searchParams.set("sidebar.filters", state.filters.join(","));
  if (state.age === "all") url.searchParams.set("sidebar.age", "all");
  if (state.query) url.searchParams.set("sidebar.q", state.query);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useSidebarState() { return useHistoryRoute({ parse: parseSidebarState, build: buildSidebarState }); }
