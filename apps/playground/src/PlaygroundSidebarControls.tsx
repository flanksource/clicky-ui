import { Button, Checkbox, Select } from "@flanksource/clicky-ui";
import { pages } from "./registry";
import { useExternalCatalog } from "./bookmarklet/external-catalog";
import { mergeActivity, matchesActivity, type usePageActivity } from "./sidebar-activity";
import { isRecent } from "./sidebar-visibility";
import type { SidebarState } from "./sidebar-state";
import type { SidebarFilter, SidebarSort } from "./sidebar-activity";

export function PlaygroundSidebarControls({ state, onChange, error, activity, activeSlug }: { state: SidebarState; onChange: (state: Partial<SidebarState>) => void; error: string | null; activity: ReturnType<typeof usePageActivity>; activeSlug: string | undefined }) {
  const external = useExternalCatalog();
  const values = mergeActivity(activity.feedback, activity.updates);
  const older = [...pages().map((page) => page.slug), ...external.pages.map((page) => page.id)].filter((slug) => slug !== activeSlug && !isRecent(values.get(slug)) && matchesActivity(values.get(slug), state.filters, Date.now())).length;
  const toggle = (filter: SidebarFilter, selected: boolean) => onChange({ filters: selected ? [...state.filters, filter] : state.filters.filter((value) => value !== filter) });
  return <div className="space-y-3 text-sidebar-foreground [[data-collapsed=true]_&]:hidden" data-playground-sidebar-controls="">
    <label className="block space-y-1 text-xs font-medium">Sort by<Select aria-label="Sort pages" value={state.sort} onChange={(event) => onChange({ sort: event.target.value as SidebarSort })}
      options={[{ value: "none", label: "Recent activity" }, { value: "updated", label: "Updated" }, { value: "commented", label: "Commented" }, { value: "resolved", label: "Resolved" }]} /></label>
    <fieldset className="space-y-1.5"><legend className="mb-1 text-xs font-medium">Filter pages</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-2"><Checkbox label="Open" checked={state.filters.includes("open")} onChange={(checked) => toggle("open", checked)} /><Checkbox label="Resolved" checked={state.filters.includes("resolved")} onChange={(checked) => toggle("resolved", checked)} /></div>
      <Button size="sm" variant="ghost" disabled={Boolean(state.query.trim())} onClick={() => onChange({ age: state.age === "all" ? "recent" : "all" })}>{state.age === "all" ? "Show recent only" : `Show older (${older})`}</Button>
      <p className="text-[10px] text-sidebar-foreground/65">Source edits or feedback in the last 7 days. Search includes older pages. Open and Resolved include pages with matching threads.</p>
    </fieldset>
    {(state.filters.length > 0 || state.query || state.sort !== "none") && <Button size="sm" variant="ghost" className="h-6 text-sidebar-foreground" onClick={() => onChange({ sort: "none", filters: [], query: "", age: "recent" })}>Reset view</Button>}
    {error && <p role="alert" className="text-xs text-destructive">Page update dates are unavailable: {error}</p>}
  </div>;
}
