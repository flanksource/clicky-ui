import { useMemo, type ReactNode } from "react";
import type {
  FilterBarFilter,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import {
  DataTable,
  type DataTableColumn,
  type DataTableInfinite,
  type DataTablePagination,
} from "../data/DataTable";
import type {
  ClickyCommandRuntime,
  ClickyDownloadOptions,
} from "../data/Clicky";
import type {
  CellFilterChange,
  CellFilterMode,
} from "../data/cells/CellFilterActions";
import { cn } from "../lib/utils";
import { ExecutionResult } from "./ExecutionResult";
import { mergeExecutionPages } from "./executionPages";
import { useRowDetailNavigation } from "./rowNavigation";
import type { ExecutionResponse, ResolvedOperation } from "./types";
import type { ParameterSort } from "./formMetadata";

// ResultRenderContext is handed to a host-supplied resultRenderer so it can
// replace the default result surface for selected entities (e.g. render a
// LogsTable for trace/log profiles). `defaultView` is the standard
// OperationResultView element; return it unchanged to keep the default.
export type ResultRenderContext = {
  surfaceKey?: string;
  response: ExecutionResponse | null;
  /** True while the current surface is refreshing its retained response. */
  loading: boolean;
  defaultView: ReactNode;
  filterConfig?: OperationResultFilterConfig;
  // The pager and download menu the default view would have rendered. A
  // replacement surface is still a page of a server-paged result, so it is
  // handed the same controls rather than left to present one page as the whole.
  pagination?: DataTablePagination;
  sort?: ParameterSort;
  download?: ClickyDownloadOptions;
  /**
   * Every page fetched in the current cursor walk, oldest first — `response` is
   * the last of them. Present only while the surface is scrolling infinitely;
   * a renderer that ignores it still shows the newest page and stays correct.
   *
   * The pages arrive unmerged because merging them is a domain decision this
   * layer cannot make: a page is a rendered document, and what concatenating
   * two of them means depends on what the renderer will do with the result. The
   * logs surface flattens each page's table rows and appends; something
   * rendering a summary block would have to do something else entirely, and
   * would be wrong to inherit the logs answer by default.
   */
  pages?: ExecutionResponse[];
  /**
   * Load-more handle for that walk, to hand to a DataTable. Absent when the
   * surface cannot page forward.
   */
  infinite?: DataTableInfinite;
};

// ResultRenderer lets the host app swap the result presentation per surface. It
// receives the current surface key, the raw response, and the default view, and
// returns whatever node should render in its place.
export type ResultRenderer = (ctx: ResultRenderContext) => ReactNode;

// In-table filter inputs for the result table — mirrors what
// parametersToFormConfig produces, surfaced through the DataTable's own
// FilterBar so the filter UI renders identically on every result surface.
export type OperationResultFilterConfig = {
  filters?: FilterBarFilter[];
  search?: FilterBarSearchProps;
  timeRange?: FilterBarRangeProps;
  cellFilters?: Record<string, Record<string, CellFilterMode>>;
  onCellFilterChange?: (change: CellFilterChange) => void;
};

export type OperationResultViewProps = {
  response: ExecutionResponse | null;
  error?: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  commandRuntime?: ClickyCommandRuntime;
  // When set, rows navigate to the entity detail page (/<surface>/<id>).
  detailOperation?: ResolvedOperation | undefined;
  filterConfig?: OperationResultFilterConfig;
  pagination?: DataTablePagination;
  sort?: ParameterSort;
  download?: ClickyDownloadOptions;
  /**
   * Every page of the current cursor walk, oldest first, with `response` as the
   * last. Given both, the default table renders the whole run rather than the
   * newest page — the same accumulation a replacement renderer gets, so a
   * surface does not have to be overridden to scroll.
   */
  pages?: ExecutionResponse[];
  /** Load-more handle for that walk, forwarded to the table's sentinel. */
  infinite?: DataTableInfinite;
};

type ErrorResultRow = {
  error: string;
};

const ERROR_RESULT_COLUMNS: DataTableColumn<ErrorResultRow>[] = [
  {
    key: "error",
    label: "Error",
    grow: true,
    sortable: false,
    resizable: false,
    hideable: false,
  },
];

// OperationResultView is the single result surface rendered by both the entity
// list catalog and the operation runner. It renders the clicky result table
// with its in-table FilterBar, the View/Download menu (automatic via the
// response's requestUrl), pagination, and row→detail navigation — so the
// surface looks and behaves identically wherever a result is shown.
export function OperationResultView({
  response,
  error,
  loading,
  loadingMessage,
  emptyMessage,
  ariaLabel,
  className,
  commandRuntime,
  detailOperation,
  filterConfig,
  pagination,
  sort,
  download,
  pages,
  infinite,
}: OperationResultViewProps) {
  const rowNav = useRowDetailNavigation(detailOperation);
  const filters = filterConfig?.filters;
  // A walk of one page is the page, so the common case costs nothing and the
  // document identity is preserved. `response` gating it keeps a failed newest
  // page from being rendered as a successful run of the pages before it.
  const walked = useMemo(
    () =>
      pages && pages.length > 1 && response != null
        ? mergeExecutionPages(pages)
        : response,
    [pages, response],
  );

  if (error != null) {
    return (
      <div
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        className={cn("mt-3 flex min-h-0 flex-col", className)}
      >
        <DataTable<ErrorResultRow>
          data={[]}
          columns={ERROR_RESULT_COLUMNS}
          error={error}
          className="h-full"
          showGlobalFilter={false}
          showDensityControl={false}
          hideableColumns={false}
          resizableColumns={false}
          persistColumnWidths={false}
          persistColumnVisibility={false}
          persistDensity={false}
          {...(filters && filters.length > 0
            ? { externalFilters: filters }
            : {})}
          {...(filterConfig?.search
            ? { externalSearch: filterConfig.search }
            : {})}
          {...(filterConfig?.timeRange
            ? { externalTimeRange: filterConfig.timeRange }
            : {})}
        />
      </div>
    );
  }

  return (
    <ExecutionResult
      response={walked}
      {...(loading !== undefined ? { loading } : {})}
      {...(loadingMessage ? { loadingMessage } : {})}
      {...(emptyMessage ? { emptyMessage } : {})}
      {...(ariaLabel ? { ariaLabel } : {})}
      {...(className ? { className } : {})}
      {...(commandRuntime ? { commandRuntime } : {})}
      {...(detailOperation
        ? {
            getTableRowHref: rowNav.getRowHref,
            onTableRowClick: rowNav.onRowClick,
            isTableRowClickable: rowNav.isRowClickable,
          }
        : {})}
      {...(filters && filters.length > 0 ? { externalFilters: filters } : {})}
      {...(filterConfig?.search ? { search: filterConfig.search } : {})}
      {...(filterConfig?.timeRange
        ? { timeRange: filterConfig.timeRange }
        : {})}
      {...(filterConfig?.cellFilters
        ? { cellFilters: filterConfig.cellFilters }
        : {})}
      {...(filterConfig?.onCellFilterChange
        ? { onCellFilterChange: filterConfig.onCellFilterChange }
        : {})}
      {...(pagination ? { pagination } : {})}
      {...(sort ? { sort: sort.value, onSortChange: sort.onChange } : {})}
      {...(infinite ? { infinite } : {})}
      {...(download ? { download } : {})}
    />
  );
}
