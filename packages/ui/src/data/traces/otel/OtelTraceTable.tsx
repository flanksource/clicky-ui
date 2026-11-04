import { useMemo } from "react";
import { Button } from "../../../components";
import type { DataTableProps } from "../../DataTable";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { ResultTable } from "./TraceResults";
import type { Span, Summary } from "./api";
import { spanTraces } from "./span-traces";
import { DataTable, type DataTableColumn } from "../../DataTable";

export type OtelTraceTableProps = Pick<
  DataTableProps<Summary>,
  | "externalFilters"
  | "externalSearch"
  | "externalTimeRange"
  | "pagination"
  | "infinite"
  | "loading"
> & {
  spans: readonly Span[];
  listing?: {
    rows: Record<string, unknown>[];
    columns: DataTableColumn<Record<string, unknown>>[];
    linkRows?: boolean;
  };
  selectedTraceId?: string;
  selectedSpanId?: string;
  onSelectTrace: (id?: string) => void;
  onSelectSpan: (id: string) => void;
  traceHref: (id: string) => string;
};

export function OtelTraceTable({
  spans,
  listing,
  selectedTraceId,
  selectedSpanId,
  onSelectTrace,
  onSelectSpan,
  traceHref,
  ...tableProps
}: OtelTraceTableProps) {
  const result = useMemo(() => {
    try {
      return { traces: spanTraces(spans) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [spans]);
  const selected = result.traces?.find(
    (trace) => trace.summary.traceId === selectedTraceId,
  );
  const listingRows =
    listing &&
    result.traces?.map((trace) => {
      const ids = new Set(trace.spans.map((span) => span.spanId));
      const root = trace.spans.find(
        (span) => !span.parentId || !ids.has(span.parentId),
      )!;
      const source = listing?.rows.find((row) => {
        const span = row._trace as Span | undefined;
        return span?.traceId === root.traceId && span.spanId === root.spanId;
      });
      if (!source)
        throw new Error(`Trace ${root.traceId} is missing its mapped root row`);
      return { ...source, _traceId: trace.summary.traceId };
    });
  return (
    <div className="min-h-0 min-w-0 space-y-3">
      <p className="text-sm text-muted-foreground">
        Traces from loaded rows. Filters and paging can leave traces incomplete.
      </p>
      {result.error ? (
        <p role="alert">Cannot render traces: {result.error}</p>
      ) : selectedTraceId ? (
        <>
          <Button variant="link" onClick={() => onSelectTrace()}>
            Back to traces
          </Button>
          {selected ? (
            <OtelTraceDetail
              trace={selected}
              {...(selectedSpanId ? { selectedSpanId } : {})}
              onSelectSpan={onSelectSpan}
            />
          ) : (
            <p role="status">
              This trace is not in the loaded rows. Return to traces or adjust
              the profile filters.
            </p>
          )}
        </>
      ) : listing ? (
        <DataTable
          {...tableProps}
          data={listingRows!}
          columns={listing.columns}
          autoFilter={false}
          getRowId={(row) => String(row._traceId)}
          onRowClick={(row) => onSelectTrace(String(row._traceId))}
          {...(listing.linkRows === false
            ? {}
            : {
                getRowHref: (row: Record<string, unknown>) =>
                  traceHref(String(row._traceId)),
              })}
        />
      ) : (
        <ResultTable
          traces={result.traces!.map((trace) => trace.summary)}
          href={traceHref}
          onOpen={onSelectTrace}
          now={Date.now()}
          tableProps={tableProps}
        />
      )}
    </div>
  );
}
