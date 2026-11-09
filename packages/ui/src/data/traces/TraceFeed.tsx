import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { FilterBar } from "../../components/FilterBar";
import { Tabs } from "../../layout/Tabs";
import { DataTable, type DataTableColumn } from "../DataTable";
import { TraceView } from "./TraceView";
import { TraceEventStream } from "./TraceEventStream";
import { orderTraceFeed, traceFeedKey, type TraceFeedPage, type TraceFeedRecord, type TraceFeedRequest } from "./trace-feed";

export interface TraceFeedProps {
  kinds: string[];
  loadPage: (request: TraceFeedRequest, signal: AbortSignal) => Promise<TraceFeedPage>;
  follow?: (options: { kind: string; onRecord: (record: TraceFeedRecord) => void; onError: (error: Error) => void; onEnd: () => void }) => () => void;
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

/** A bounded, paged view over heterogeneous trace captures. The source owns
 * querying and resume tokens; paused viewers keep the capture running. */
export function TraceFeed({ kinds, loadPage, follow, renderCapture, presentation = "text" }: TraceFeedProps) {
  const [request, setRequest] = useState<TraceFeedRequest>(() => {
    const values = new URLSearchParams(window.location.search);
    return { kind: values.get("feedKind") ?? "", sort: values.get("feedSort") === "seq" ? "seq" : "timestamp", cursor: "" };
  });
  const [page, setPage] = useState<TraceFeedPage>({ rows: [], nextCursor: "" });
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<Error>();
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [selected, setSelected] = useState<TraceFeedRecord>();
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => {
    const value = new URLSearchParams(window.location.search).get("feedView");
    return value === "raw" || value === "captures" ? value : "stream";
  });
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
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    loadPage(request, controller.signal).then(next => { if (!controller.signal.aborted) { setPage(next); setLoading(false); } }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure : new Error(String(failure)));
    });
    return () => controller.abort();
  }, [request, loadPage, revision]);
  useEffect(() => {
    if (!follow || loading || paused || request.cursor || ended) return;
    return follow({ kind: request.kind, onRecord: record => setPage(previous => {
      const byKey = new Map(previous.rows.map(row => [traceFeedKey(row), row]));
      byKey.set(traceFeedKey(record), record);
      return { ...previous, rows: orderTraceFeed([...byKey.values()], request.sort).slice(-100) };
    }), onError: setError, onEnd: () => setEnded(true) });
  }, [follow, loading, paused, request.kind, request.cursor, request.sort, ended]);
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
  const change = (next: Partial<TraceFeedRequest>) => { setHistory([]); setEnded(false); setSelected(undefined); setRequest(previous => ({ ...previous, ...next, cursor: "" })); };
  return <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
    <FilterBar className="shrink-0" filters={[
      { key: "capture", kind: "enum", label: "Capture", required: true, value: request.kind || "*", onChange: kind => change({ kind: kind === "*" ? "" : kind }), options: [{ value: "*", label: "All events" }, ...kinds.map(kind => ({ value: kind, label: kind }))] },
      { key: "order", kind: "enum", label: "Order", required: true, value: request.sort, onChange: sort => {
        if (sort !== "seq" && sort !== "timestamp") throw new Error(`Unknown trace order: ${sort}`);
        change({ sort });
      }, options: [{ value: "seq", label: "Sequence" }, { value: "timestamp", label: "Timestamp" }] },
    ]} trailing={<>
      {follow && <Button size="sm" variant="outline" onClick={() => setPaused(value => !value)}>{paused ? "Resume" : "Pause"}</Button>}
      <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>Refresh</Button>
      <span role="status" className="whitespace-nowrap text-xs text-muted-foreground">{!kinds.length ? "No captures armed" : ended || !follow ? "Capture complete" : paused ? "Paused" : "Following"}</span>
    </>} />
    {error && <p role="alert">{error.message}</p>}
    <Tabs tabs={[{ id: "stream", label: "Event stream" }, { id: "captures", label: "Captures" }, { id: "raw", label: "Raw stream" }]} value={view} onChange={value => { setView(value); setSelected(undefined); }} />
    <div role="tabpanel" aria-label={view === "raw" ? "Raw stream" : view === "captures" ? "Captures" : "Event stream"} className="flex min-h-0 flex-1 flex-col overflow-auto">
      {view === "stream" ? <>
        <TraceEventStream rows={rows} presentation={presentation} following={!!follow && !paused && !request.cursor} onSelect={setSelected} />
        {selected && <div className="min-h-0 max-h-[40%] shrink-0 overflow-auto rounded border border-border p-3"><Button size="sm" variant="ghost" onClick={() => setSelected(undefined)}>Close event details</Button><TraceView kind={selected.kind} rows={[selected.record]} /></div>}
      </> : view === "raw" ? <>
        <DataTable data={rows} columns={columns} onRowClick={setSelected} emptyMessage="Waiting for records from the armed captures" />
        {selected && <pre aria-label="Raw record" className="mt-3 overflow-auto rounded border border-border bg-muted p-3 text-xs">{JSON.stringify(selected.record, null, 2)}</pre>}
      </> : <div className="space-y-4">
        {!captures.length && <p className="text-sm text-muted-foreground">Waiting for records from the armed captures</p>}
        {captures.map(([key, capture]) => {
          const rendered = renderCapture?.(capture);
          if (rendered === null) return null;
          return <section key={key} aria-label={`${capture.kind} ${capture.stream}`}>
          {captures.length > 1 && <h3 className="mb-2 text-sm font-medium">{capture.kind} · {capture.stream}</h3>}
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
