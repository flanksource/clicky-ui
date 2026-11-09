import { useMemo, type ReactNode } from "react";
import { Button } from "../../../components";
import type { DataTableProps } from "../../DataTable";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { ResultTable } from "./TraceResults";
import type { Span, Summary } from "./api";
import { spanTraces } from "./span-traces";
import { DataTable, type DataTableColumn } from "../../DataTable";
import { ServerTimingBadge } from "../../ServerTimingBadge";
import type { ServerTimingMetric } from "../../server-timing";

export type OtelTraceTableProps = Pick<
  DataTableProps<Summary>,
  | "externalFilters"
  | "externalSearch"
  | "externalTimeRange"
  | "pagination"
  | "infinite"
  | "loading"
  | "menuActions"
  | "sort"
  | "onSortChange"
  | "manualSort"
  | "cellFilters"
  | "onCellFilterChange"
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
  /** Places the open trace's title elsewhere (e.g. a breadcrumb in the app shell's top bar), replacing the inline "Back to traces" link. */
  renderTraceTitle?: (title: ReactNode) => ReactNode;
  /** The listing response's Server-Timing metrics, shown as a badge in the listing's filter bar. */
  serverTiming?: readonly ServerTimingMetric[];
};

export function OtelTraceTable({
  spans,
  listing,
  selectedTraceId,
  selectedSpanId,
  onSelectTrace,
  onSelectSpan,
  traceHref,
  renderTraceTitle,
  serverTiming,
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
  // One row per trace, at its root span's position in the loaded rows: those
  // arrive in the server's sort, which the listing must keep.
  const listingRows =
    listing &&
    result.traces
      ?.map((trace) => {
        const ids = new Set(trace.spans.map((span) => span.spanId));
        const root = trace.spans.find(
          (span) => !span.parentId || !ids.has(span.parentId),
        )!;
        const position = listing.rows.findIndex((row) => {
          const span = row._trace as Span | undefined;
          return span?.traceId === root.traceId && span.spanId === root.spanId;
        });
        if (position < 0)
          throw new Error(`Trace ${root.traceId} is missing its mapped root row`);
        return { position, row: { ...listing.rows[position]!, _traceId: trace.summary.traceId } };
      })
      .sort((a, b) => a.position - b.position)
      .map(({ row }) => row);
  return (
    // A flex column so the listing's DataTable fills a bounded parent: its body
    // scrolls and the pagination footer stays on screen.
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <p className="shrink-0 text-sm text-muted-foreground">
        Traces from loaded rows. Filters and paging can leave traces incomplete.
      </p>
      {result.error ? (
        <p role="alert">Cannot render traces: {result.error}</p>
      ) : selectedTraceId ? (
        <>
          {!renderTraceTitle && (
            <Button variant="link" className="self-start" onClick={() => onSelectTrace()}>
              Back to traces
            </Button>
          )}
          {selected ? (
            <OtelTraceDetail
              trace={selected}
              {...(selectedSpanId ? { selectedSpanId } : {})}
              {...(renderTraceTitle ? { renderTitle: renderTraceTitle } : {})}
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
          {...(serverTiming?.length
            ? { filterBarProps: { trailing: <ServerTimingBadge metrics={serverTiming} /> } }
            : {})}
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
