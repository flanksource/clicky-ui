import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { FilterBar } from "../../components/FilterBar";
import { Tabs } from "../../layout/Tabs";
import { DataTable, type DataTableColumn } from "../DataTable";
import { TraceView } from "./TraceView";
import { TraceEventStream } from "./TraceEventStream";
import { orderTraceFeed, type TraceFeedRecord, type TraceFeedRequest, type TraceFeedSource } from "./trace-feed";
import { useTraceFeed } from "./use-trace-feed";

export interface TraceFeedProps extends TraceFeedSource {
  kinds: string[];
  /** Return a capture view, null to omit it, or undefined for the built-in renderer. Raw records remain available. */
  renderCapture?: (capture: { kind: string; stream: string; records: TraceFeedRecord["record"][] }) => ReactNode;
  presentation?: "text" | "ansi";
}

const columns: DataTableColumn<TraceFeedRecord>[] = [
  { key: "seq", label: "Seq" },
  { key: "timestamp", label: "Time", kind: "timestamp" },
  { key: "kind", label: "Capture" },
  { key: "summary", label: "Record" },
];

const captureViewPrefix = "capture:";

function TraceFeedFilters({ kinds, request, live, paused, ended, onChange, onTogglePause, onRefresh }: {
  kinds: string[];
  request: TraceFeedRequest;
  live: boolean;
  paused: boolean;
  ended: boolean;
  onChange: (request: Partial<TraceFeedRequest>) => void;
  onTogglePause: () => void;
  onRefresh: () => void;
}) {
  return <FilterBar className="shrink-0" filters={[
    { key: "capture", kind: "enum", label: "Capture", required: true, value: request.kind || "*", onChange: kind => onChange({ kind: kind === "*" ? "" : kind }), options: [{ value: "*", label: "All events" }, ...kinds.map(kind => ({ value: kind, label: kind }))] },
    { key: "order", kind: "enum", label: "Order", required: true, value: request.sort, onChange: sort => {
      if (sort !== "seq" && sort !== "timestamp") throw new Error(`Unknown trace order: ${sort}`);
      onChange({ sort });
    }, options: [{ value: "seq", label: "Sequence" }, { value: "timestamp", label: "Timestamp" }] },
  ]} trailing={<>
    {live && <Button size="sm" variant="outline" onClick={onTogglePause}>{paused ? "Resume" : "Pause"}</Button>}
    <Button size="sm" variant="outline" onClick={onRefresh}>Refresh</Button>
    <span role="status" className="whitespace-nowrap text-xs text-muted-foreground">{!kinds.length ? "No captures armed" : ended || !live ? "Capture complete" : paused ? "Paused" : "Following"}</span>
  </>} />;
}

/** A bounded, paged view over heterogeneous trace captures. The source owns
 * querying and resume tokens; paused viewers keep the capture running. */
export function TraceFeed({ kinds, renderCapture, presentation = "text", ...source }: TraceFeedProps) {
  const [request, setRequest] = useState<TraceFeedRequest>(() => {
    const values = new URLSearchParams(window.location.search);
    return { kind: values.get("feedKind") ?? "", sort: values.get("feedSort") === "seq" ? "seq" : "timestamp", cursor: "" };
  });
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<TraceFeedRecord>();
  const [view, setView] = useState(() => {
    const value = new URLSearchParams(window.location.search).get("feedView");
    return value === "raw" || (value?.startsWith(captureViewPrefix) && kinds.includes(value.slice(captureViewPrefix.length))) ? value : "stream";
  });
  const viewKind = view.startsWith(captureViewPrefix) ? view.slice(captureViewPrefix.length) : undefined;
  useEffect(() => {
    const values = new URLSearchParams(window.location.search);
    if (view !== "stream") values.set("feedView", view); else values.delete("feedView");
    window.history.replaceState(null, "", `${window.location.pathname}?${values}${window.location.hash}`);
  }, [view]);
  useEffect(() => {
    const values = new URLSearchParams(window.location.search);
    if (request.kind) values.set("feedKind", request.kind); else values.delete("feedKind");
    values.set("feedSort", request.sort);
    window.history.replaceState(null, "", `${window.location.pathname}?${values}${window.location.hash}`);
  }, [request.kind, request.sort]);
  const { page, error, paused, ended, resetEnded, togglePaused, refresh } = useTraceFeed(request, source);
  const rows = useMemo(() => orderTraceFeed(page.rows, request.sort), [page.rows, request.sort]);
  const captures = useMemo(() => {
    const grouped = new Map<string, { kind: string; stream: string; records: TraceFeedRecord["record"][] }>();
    for (const row of rows) {
      const key = `${row.kind}/${row.stream}`;
      const capture = grouped.get(key) ?? { kind: row.kind, stream: row.stream, records: [] };
      capture.records.push(row.record);
      grouped.set(key, capture);
    }
    return [...grouped.entries()];
  }, [rows]);
  const kindCaptures = captures.filter(([, capture]) => capture.kind === viewKind);
  const viewLabel = view === "raw" ? "Raw stream" : viewKind ?? "Event stream";
  const change = (next: Partial<TraceFeedRequest>) => { setHistory([]); resetEnded(); setSelected(undefined); setRequest(previous => ({ ...previous, ...next, cursor: "" })); };
  return <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
    <TraceFeedFilters kinds={kinds} request={request} live={!!source.follow} paused={paused} ended={ended} onChange={change} onTogglePause={togglePaused} onRefresh={refresh} />
    {error && <p role="alert">{error.message}</p>}
    <Tabs className="shrink-0 flex-wrap" tabs={[
      { id: "stream", label: "Event stream" },
      ...kinds.map(kind => ({ id: `${captureViewPrefix}${kind}`, label: kind, count: rows.filter(row => row.kind === kind).length })),
      { id: "raw", label: "Raw stream" },
    ]} value={view} onChange={value => { setView(value); setSelected(undefined); }} />
    <div role="tabpanel" aria-label={viewLabel} className="flex min-h-0 flex-1 flex-col overflow-auto">
      {view === "stream" ? <>
        <TraceEventStream rows={rows} presentation={presentation} following={!!source.follow && !paused && !request.cursor} onSelect={setSelected} />
        {selected && <div className="min-h-0 max-h-[40%] shrink-0 overflow-auto rounded border border-border p-3"><Button size="sm" variant="ghost" onClick={() => setSelected(undefined)}>Close event details</Button><TraceView kind={selected.kind} rows={[selected.record]} /></div>}
      </> : view === "raw" ? <>
        <DataTable data={rows} columns={columns} onRowClick={setSelected} emptyMessage="Waiting for records from the armed captures" />
        {selected && <pre aria-label="Raw record" className="mt-3 overflow-auto rounded border border-border bg-muted p-3 text-xs">{JSON.stringify(selected.record, null, 2)}</pre>}
      </> : <div className="space-y-4">
        {!kindCaptures.length && <p className="text-sm text-muted-foreground">Waiting for {viewKind} records</p>}
        {kindCaptures.map(([key, capture]) => {
          const rendered = renderCapture?.(capture);
          if (rendered === null) return null;
          return <section key={key} aria-label={`${capture.kind} ${capture.stream}`}>
          {kindCaptures.length > 1 && <h3 className="mb-2 text-sm font-medium">{capture.stream}</h3>}
          {rendered === undefined ? <TraceView kind={capture.kind} rows={capture.records} /> : rendered}
        </section>;
        })}
      </div>}
    </div>
    <div className="flex gap-2">
      <Button variant="outline" disabled={!history.length} onClick={() => {
        const cursor = history[history.length - 1];
        if (cursor === undefined) throw new Error("Missing previous trace page");
        setHistory(values => values.slice(0, -1)); setRequest(previous => ({ ...previous, cursor }));
      }}>Previous</Button>
      <Button variant="outline" disabled={!page.nextCursor} onClick={() => {
        setHistory(values => [...values, request.cursor]); setRequest(previous => ({ ...previous, cursor: page.nextCursor }));
      }}>Next</Button>
    </div>
  </div>;
}
