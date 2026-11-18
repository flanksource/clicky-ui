import { Button, Checkbox, Select } from "@flanksource/clicky-ui";
import type { SidebarFilter, SidebarSort } from "./sidebar-activity";
import type { SidebarState } from "./sidebar-state";

export const SORT_OPTIONS: { value: SidebarSort; label: string }[] = [
  { value: "none", label: "Latest activity" },
  { value: "updated", label: "Source edited" },
  { value: "commented", label: "Last commented" },
  { value: "resolved", label: "Last resolved" },
];

const FILTER_HELP = "Source edits or feedback in the last 7 days. Search includes older pages. Open and Resolved include pages with matching threads.";

type Props = {
  state: SidebarState;
  onChange: (state: Partial<SidebarState>, options?: { replace?: boolean }) => void;
  /** Pages and external pages the recent-only view hides, from the navigation root; unknown until it loads. */
  olderCount: number | undefined;
  commentsError: string | null;
  updatesError: string | null;
};

export function PlaygroundSidebarControls({ state, onChange, olderCount, commentsError, updatesError }: Props) {
  const toggle = (filter: SidebarFilter, selected: boolean) => onChange({ filters: selected ? [...state.filters, filter] : state.filters.filter((value) => value !== filter) });
  return <div className="space-y-3 text-sidebar-foreground" data-playground-sidebar-controls="">
    <label className="block space-y-1 text-xs font-medium">Sort by<Select aria-label="Sort pages" value={state.sort} onChange={(event) => onChange({ sort: event.target.value as SidebarSort })} options={SORT_OPTIONS} /></label>
    <fieldset className="space-y-1.5" title={FILTER_HELP}><legend className="mb-1 text-xs font-medium" title={FILTER_HELP}>Filter pages</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-2"><Checkbox label="Open" checked={state.filters.includes("open")} onChange={(checked) => toggle("open", checked)} /><Checkbox label="Resolved" checked={state.filters.includes("resolved")} onChange={(checked) => toggle("resolved", checked)} /></div>
      <Button size="sm" variant="ghost" disabled={Boolean(state.query.trim())} onClick={() => onChange({ age: state.age === "all" ? "recent" : "all" })}>{state.age === "all" ? "Show recent only" : olderCount === undefined ? "Show older" : `Show older (${olderCount})`}</Button>
    </fieldset>
    {(state.filters.length > 0 || state.query || state.sort !== "none" || state.age === "all") && <Button size="sm" variant="ghost" className="h-6 text-sidebar-foreground" onClick={() => onChange({ sort: "none", filters: [], query: "", age: "recent" })}>Reset view</Button>}
    {commentsError && <p role="alert" className="text-xs text-destructive">Comment counts are unavailable: {commentsError}</p>}
    {updatesError && <p role="alert" className="text-xs text-destructive">Page update dates are unavailable: {updatesError}</p>}
  </div>;
}
