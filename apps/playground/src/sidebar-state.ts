import { useHistoryRoute } from "@flanksource/clicky-ui";
import type { SidebarFilter, SidebarSort } from "./sidebar-activity";

export type SidebarState = { sort: SidebarSort; filters: SidebarFilter[]; query: string };

function parse(_path: string, search: string): SidebarState {
  const params = new URLSearchParams(search);
  const sort = params.get("sidebar.sort") ?? "none";
  const filters = (params.get("sidebar.filters") ?? "").split(",").filter(Boolean);
  if (!["none", "updated", "commented", "resolved"].includes(sort)) throw new Error(`Invalid sidebar sort: ${sort}`);
  if (filters.some((filter) => !["open", "resolved", "recent"].includes(filter))) throw new Error("Invalid sidebar filters");
  return { sort: sort as SidebarSort, filters: filters as SidebarFilter[], query: params.get("sidebar.q") ?? "" };
}

function build(state: SidebarState): string {
  const url = new URL(window.location.href);
  for (const key of ["sidebar.sort", "sidebar.filters", "sidebar.q"]) url.searchParams.delete(key);
  if (state.sort !== "none") url.searchParams.set("sidebar.sort", state.sort);
  if (state.filters.length) url.searchParams.set("sidebar.filters", state.filters.join(","));
  if (state.query) url.searchParams.set("sidebar.q", state.query);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useSidebarState() { return useHistoryRoute({ parse, build }); }
