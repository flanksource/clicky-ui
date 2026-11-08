import { useEffect, useState } from "react";
import { Button, SearchInput } from "../../../components";
import { UiLoader } from "../../../icons";
import { QueryBar } from "./QueryBar";
import { ResultSummary, ResultTable, Scatter } from "./TraceResults";
import type { SearchValues, SearchResult, Source } from "./api";

/** The search's page size when the request names none, as the trace search service defaults it. */
const DEFAULT_LIMIT = 100;

export function OtelTraceSearch({ value, result, sources, runs = [], loading = false, error, onChange, onOpen, href, onCancel, onRetry, allowRecords = true }: {
  value: SearchValues; result?: SearchResult; sources: Source[]; runs?: string[];
  loading?: boolean; error?: string; onChange: (value: Partial<SearchValues>) => void;
  onOpen: (id: string) => void; href: (id: string) => string; onCancel: () => void; onRetry: () => void;
  allowRecords?: boolean;
}) {
  const [jump, setJump] = useState("");
  const [notice, setNotice] = useState<string>();
  const [cancelled, setCancelled] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!loading) return;
    setCancelled(false);
    const start = Date.now();
    setElapsed(0);
    const timer = setInterval(() => setElapsed(Date.now() - start), 100);
    return () => clearInterval(timer);
  }, [loading]);
  const limit = value.limit || DEFAULT_LIMIT;
  return <section className="flex min-h-0 min-w-0 flex-col gap-3">
    <form className="flex flex-wrap items-center justify-between gap-2" onSubmit={event => {
      event.preventDefault();
      if (!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/i.test(jump.trim())) return setNotice("A trace ID is 16 or 32 hex characters.");
      setNotice(undefined); onOpen(jump.trim().toLowerCase());
    }}>
      <h2 className="text-xl font-semibold">Traces</h2>
      <div className="flex min-w-0 gap-2"><SearchInput shortcut={null} aria-label="Trace ID" placeholder="Jump to trace ID" value={jump} onChange={setJump} /><Button type="submit" variant="outline">Open</Button></div>
    </form>
    <QueryBar value={value} sources={sources} runs={runs} allowRecords={allowRecords} onChange={onChange} onError={setNotice} {...(result ? { result } : {})}
      trailing={loading && <span className="inline-flex h-7 items-center rounded-md border border-input bg-background text-xs">
        <span role="status" className="flex items-center gap-1.5 whitespace-nowrap px-2 tabular-nums text-muted-foreground"><UiLoader className="size-3.5 animate-spin" aria-hidden />Searching… {(elapsed / 1000).toFixed(1)} s</span>
        <Button size="sm" variant="ghost" className="h-full rounded-l-none border-l border-input px-2 text-xs" onClick={() => { setCancelled(true); onCancel(); }}>Cancel</Button>
      </span>} />
    {notice && <p role="alert">{notice}</p>}
    {cancelled && !loading && <p role="status">Search cancelled. Any results shown are from the previous search. <Button size="sm" variant="outline" onClick={onRetry}>Search again</Button></p>}
    {error && result && <p role="status">Showing results from the previous search.</p>}
    {error && <div role="alert">{error} <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button></div>}
    {result && <div aria-busy={loading} className="min-h-0 min-w-0 space-y-3">
      <ResultSummary result={result} />
      {result.traces.length > 0 && <Scatter traces={result.traces} onOpen={onOpen} />}
      <ResultTable traces={result.traces} href={href} onOpen={onOpen} now={Date.now()} tableProps={{
        pagination: {
          page: Math.floor((value.offset ?? 0) / limit), pageSize: limit, total: result.total,
          onPageChange: page => onChange({ offset: page * limit || undefined }),
          onPageSizeChange: pageSize => onChange({ limit: pageSize, offset: undefined }),
        },
      }} />
    </div>}
  </section>;
}
