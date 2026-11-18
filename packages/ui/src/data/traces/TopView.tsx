import { Button } from "../../components/button";
import { FilterBar, type FilterBarFilter } from "../../components/FilterBar";
import { Clicky, ClickyNodeView, type ClickyDocument, type ClickyProps } from "../Clicky";
import { WeightedProfile } from "./WeightedProfile";
import { formatDuration } from "../../lib/format";
import type { WeightedHierarchy } from "./weighted-layout";

export interface SampleFrame {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string;
  observed: number;
  retained: number;
  limit: number;
  summary?: { activePlanLimit?: number };
}

export interface TopMetric {
  key: string;
  label: string;
  unit?: string;
  view: string;
}

export interface TopViewState {
  frame: string;
  source: string;
  metric: string;
  view: string;
  search: string;
  zoom: string;
  paused: boolean;
}

export interface TopViewProps {
  frames: SampleFrame[];
  selectedFrames?: SampleFrame[];
  perSource?: boolean;
  frame?: SampleFrame;
  metrics: TopMetric[];
  table?: ClickyDocument;
  hierarchy?: WeightedHierarchy;
  state: TopViewState;
  onChange: (change: Partial<TopViewState>) => void;
  onRefresh: () => void;
  loading?: boolean;
  error?: string;
  tableProps?: Omit<ClickyProps, "data">;
}

/** The host owns fetching and URL state; this view owns sample and metric controls. */
export function TopView({ frames, selectedFrames, perSource, frame, metrics, table, hierarchy, state, onChange, onRefresh, loading, error, tableProps }: TopViewProps) {
  const { timeRange, ...innerTableProps } = tableProps ?? {};
  const metric = metrics.find(candidate => candidate.key === (state.metric || hierarchy?.metric));
  const view = state.view || metric?.view || "table";
  const sources = [...new Set(frames.map(sample => sample.source))];
  const filters: FilterBarFilter[] = [
    { key: "source", kind: "enum", label: "Source", value: state.source, options: [{ value: "", label: perSource ? "All sources · latest per source" : "Latest source" }, ...sources.map(source => ({ value: source, label: source }))], onChange: source => onChange({ source, frame: "", zoom: "" }) },
    { key: "sample", kind: "enum", label: "Sample", value: state.frame, options: [{ value: "", label: "Latest complete" }, ...frames.filter(sample => !state.source || sample.source === state.source).toReversed().map(sample => ({ value: sample.id, label: new Date(sample.completedAt).toLocaleString() }))], onChange: id => onChange({ frame: id, zoom: "" }) },
    ...(metrics.length ? [{ key: "metric", kind: "enum" as const, label: "Metric", value: metric?.key ?? "", options: metrics.map(item => ({ value: item.key, label: item.label })), onChange: (key: string) => onChange({ metric: key, view: "", zoom: "" }) }] : []),
  ];
  return <section aria-label="Top sample" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
    <FilterBar filters={[...filters, ...(tableProps?.externalFilters ?? [])]} {...(timeRange ? { timeRange } : {})} search={{ value: state.search, onChange: search => onChange({ search }), ariaLabel: "Search sample", placeholder: "Search sample" }} trailing={<>
      <Button variant="outline" size="sm" onClick={() => onChange({ paused: !state.paused })}>{state.paused ? "Resume live" : "Pause"}</Button>
      <Button variant="outline" size="sm" loading={!!loading} onClick={onRefresh}>Refresh</Button>
    </>} />
    {frame && <p className="shrink-0 text-sm text-muted-foreground">{frame.source} · <time dateTime={frame.completedAt} title={`${frame.startedAt} – ${frame.completedAt}`}>{new Date(frame.completedAt).toLocaleString()}</time> · window {formatDuration(new Date(frame.completedAt).getTime() - new Date(frame.startedAt).getTime())} · {formatDuration(Math.max(0, Date.now() - new Date(frame.completedAt).getTime()))} ago · {frame.retained} retained of {frame.observed} observed{frame.limit > 0 ? ` · capture limit ${frame.limit}` : ""}{frame.summary?.activePlanLimit ? ` · active plan limit ${frame.summary.activePlanLimit} · evictions retained` : ""}{frame.observed > frame.retained ? " · capture truncated" : ""}</p>}
    {selectedFrames && selectedFrames.length > 1 && <details className="shrink-0 text-sm text-muted-foreground">
      <summary>{selectedFrames.length} source samples · {selectedFrames.reduce((sum, sample) => sum + sample.retained, 0)} retained of {selectedFrames.reduce((sum, sample) => sum + sample.observed, 0)} observed across all sources</summary>
      <ul className="max-h-24 overflow-auto">{selectedFrames.map(sample => <li key={sample.id}>{sample.source} · {sample.startedAt} – {sample.completedAt} · {sample.retained}/{sample.observed} rows{sample.limit ? ` · capture limit ${sample.limit}` : ""}</li>)}</ul>
    </details>}
    {error && <p role="alert" className="shrink-0 text-sm text-destructive">{error}</p>}
    {hierarchy && <div role="group" aria-label="Profile view" className="flex shrink-0 gap-1">
      {[metric?.view, "table"].filter((item, index, values): item is string => !!item && values.indexOf(item) === index).map(item => <Button key={item} variant={view === item ? "secondary" : "ghost"} size="sm" onClick={() => onChange({ view: item })}>{item === "flamegraph" ? "Flamegraph" : item === "treemap" ? "Treemap" : "Table"}</Button>)}
    </div>}
    {hierarchy && (view === "flamegraph" || view === "treemap")
      ? <WeightedProfile hierarchy={hierarchy} mode={view} zoom={state.zoom} search={state.search} onZoom={zoom => onChange({ zoom })} />
      : table ? <Clicky {...innerTableProps} externalFilters={[]} data={table} loading={!!loading} className="min-h-0 flex-1"
        detailStyle="dialog" renderRowDetail={tableProps?.renderRowDetail ?? (raw => {
          const detail = table.node.rows?.find(row => row.cells.seq?.filterValue === raw.seq)?.detail;
          return detail ? <ClickyNodeView node={detail} /> : null;
        })} /> : <p role="status" className="p-4">{loading ? "Reading complete samples…" : "Complete samples unavailable. Open history to inspect stored records."}</p>}
  </section>;
}
