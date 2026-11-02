import { useMemo } from "react";
import { Button } from "../../../components";
import type { DataTableProps } from "../../DataTable";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { ResultTable } from "./TraceResults";
import type { Span, Summary } from "./api";
import { spanTraces } from "./span-traces";

export type OtelTraceTableProps = Pick<DataTableProps<Summary>, "externalFilters" | "externalSearch" | "externalTimeRange" | "pagination" | "infinite" | "loading"> & {
  spans: readonly Span[];
  selectedTraceId?: string;
  selectedSpanId?: string;
  onSelectTrace: (id?: string) => void;
  onSelectSpan: (id: string) => void;
  traceHref: (id: string) => string;
};

export function OtelTraceTable({ spans, selectedTraceId, selectedSpanId, onSelectTrace, onSelectSpan, traceHref, ...tableProps }: OtelTraceTableProps) {
  const result = useMemo(() => {
    try { return { traces: spanTraces(spans) }; }
    catch (error) { return { error: error instanceof Error ? error.message : String(error) }; }
  }, [spans]);
  const selected = result.traces?.find(trace => trace.summary.traceId === selectedTraceId);
  return <div className="min-h-0 min-w-0 space-y-3">
    <p className="text-sm text-muted-foreground">Traces from loaded rows. Filters and paging can leave traces incomplete.</p>
    {result.error ? <p role="alert">Cannot render traces: {result.error}</p> : selectedTraceId ? <>
      <Button variant="link" onClick={() => onSelectTrace()}>Back to traces</Button>
      {selected ? <OtelTraceDetail trace={selected} {...(selectedSpanId ? { selectedSpanId } : {})} onSelectSpan={onSelectSpan} /> : <p role="status">This trace is not in the loaded rows. Return to traces or adjust the profile filters.</p>}
    </> : <ResultTable traces={result.traces!.map(trace => trace.summary)} href={traceHref} onOpen={onSelectTrace} now={Date.now()} tableProps={tableProps} />}
  </div>;
}
