import { useMemo, type ReactNode } from "react";
import { Button } from "../../../components";
import type { DataTableProps } from "../../DataTable";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { ResultTable } from "./TraceResults";
import type { Span, Summary } from "./api";
import { spanTraces, traceRoot } from "./span-traces";
import { DataTable, type DataTableColumn } from "../../DataTable";
import { ServerTimingBadge } from "../../ServerTimingBadge";
import { Callout } from "../../Callout";
import type { ServerTimingMetric } from "../../server-timing";
import {
  FilterBar,
  type FilterBarFilter,
  type FilterBarSearchProps,
} from "../../../components/FilterBar";

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
  /**
   * The selected trace fetched on its own, so the listing's span filters and
   * paging never decide which of its spans exist. Without it the trace is
   * assembled from `spans`, which can leave it incomplete.
   */
  openTrace?: OtelOpenTrace;
};

export type OtelOpenTrace = {
  /** The trace's spans loaded so far, across every page fetched. */
  spans: readonly Span[];
  /** Spans the source holds for the trace, when it reports a count. */
  total?: number;
  loading: boolean;
  /** Nothing usable loaded; replaces the trace. */
  error?: string;
  /** The spans shown are incomplete (e.g. the source stopped paging); shown above the trace. */
  warning?: string;
  /** Fetches the next page; set only while the source has more spans. */
  onLoadMore?: () => void;
  /** Spans the active filters select, matched by the source; unset when no filter is active. */
  matchingSpanIds?: ReadonlySet<string>;
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
  openTrace,
  ...tableProps
}: OtelTraceTableProps) {
  const listingRows = listing?.rows;
  const result = useMemo(() => {
    try {
      const traces = spanTraces(spans);
      // One row per trace, at its root span's position in the loaded rows: those
      // arrive in the server's sort, which the listing must keep. The detail
      // view does not use them, so they are only mapped while listing.
      const rows =
        listingRows && !selectedTraceId
          ? traces
              .map((trace) => {
                const root = traceRoot(trace.spans);
                const position = listingRows.findIndex((row) => {
                  const span = row._trace as Span | undefined;
                  return span?.traceId === root.traceId && span.spanId === root.spanId;
                });
                if (position < 0)
                  throw new Error(`Trace ${root.traceId} is missing its mapped root row`);
                return { position, row: { ...listingRows[position]!, _traceId: trace.summary.traceId } };
              })
              .sort((a, b) => a.position - b.position)
              .map(({ row }) => row)
          : undefined;
      return { traces, rows };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [spans, listingRows, selectedTraceId]);
  const opened = useMemo(() => {
    if (!openTrace) return undefined;
    try {
      return { trace: spanTraces(openTrace.spans).find((trace) => trace.summary.traceId === selectedTraceId) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [openTrace, selectedTraceId]);
  const selected = opened
    ? opened.trace
    : result.traces?.find((trace) => trace.summary.traceId === selectedTraceId);
  const openError = openTrace?.error ?? opened?.error;
  const openHeader = openTrace && (
    <OpenTraceHeader trace={openTrace} filters={tableProps.externalFilters} search={tableProps.externalSearch} />
  );
  return (
    // A flex column so the listing's DataTable fills a bounded parent: its body
    // scrolls and the pagination footer stays on screen.
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      {!(selectedTraceId && openTrace) && (
        <p className="shrink-0 text-sm text-muted-foreground">
          Traces from loaded rows. Filters and paging can leave traces incomplete.
        </p>
      )}
      {result.error && !(selectedTraceId && openTrace) ? (
        <p role="alert">Cannot render traces: {result.error}</p>
      ) : selectedTraceId ? (
        <>
          {!renderTraceTitle && (
            <Button variant="link" className="self-start" onClick={() => onSelectTrace()}>
              Back to traces
            </Button>
          )}
          {openError ? (
            <p role="alert">Cannot load trace: {openError}</p>
          ) : selected ? (
            <OtelTraceDetail
              trace={selected}
              {...(selectedSpanId ? { selectedSpanId } : {})}
              {...(renderTraceTitle ? { renderTitle: renderTraceTitle } : {})}
              {...(openTrace?.matchingSpanIds ? { visibleSpanIds: openTrace.matchingSpanIds } : {})}
              {...(openHeader ? { header: openHeader } : {})}
              onSelectSpan={onSelectSpan}
            />
          ) : openTrace?.onLoadMore ? openHeader : openTrace?.loading ? (
            <p role="status">Loading trace…</p>
          ) : (
            <p role="status">
              {openTrace
                ? "The source holds no spans for this trace."
                : "This trace is not in the loaded rows. Return to traces or adjust the profile filters."}
            </p>
          )}
        </>
      ) : listing ? (
        <DataTable
          {...tableProps}
          {...(serverTiming?.length
            ? { filterBarProps: { trailing: <ServerTimingBadge metrics={serverTiming} /> } }
            : {})}
          data={result.rows!}
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

// The listing's filter bar, carried into the open trace: the same controls
// now pick spans inside it rather than which traces the listing shows.
function OpenTraceHeader({
  trace,
  filters,
  search,
}: {
  trace: OtelOpenTrace;
  filters: FilterBarFilter[] | undefined;
  search: FilterBarSearchProps | undefined;
}) {
  const { total, onLoadMore, matchingSpanIds } = trace;
  const loaded = trace.spans.length;
  const progress = [
    onLoadMore || (total !== undefined && loaded < total)
      ? `${loaded}${total === undefined ? "" : ` of ${total}`} spans loaded`
      : undefined,
    matchingSpanIds
      ? `${matchingSpanIds.size}${total === undefined ? " loaded" : ` of ${total}`} spans match`
      : undefined,
  ].filter(Boolean);
  return (
    <div className="space-y-2">
      {trace.warning && (
        <Callout variant="warning" title="Incomplete trace">
          <p className="whitespace-pre-line text-sm">{trace.warning}</p>
        </Callout>
      )}
      {(filters?.length || search) && (
        <FilterBar filters={filters ?? []} {...(search ? { search } : {})} />
      )}
      {(progress.length > 0 || trace.loading) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span role="status">
            {progress.join(" · ")}
            {trace.loading ? `${progress.length ? " · " : ""}loading…` : ""}
          </span>
          {trace.onLoadMore && !trace.loading && (
            <Button size="sm" variant="outline" onClick={trace.onLoadMore}>
              Load more spans
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
