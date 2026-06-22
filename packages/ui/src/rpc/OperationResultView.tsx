import type { ReactNode } from "react";
import type {
  FilterBarFilter,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import type { DataTablePagination } from "../data/DataTable";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { ExecutionResult } from "./ExecutionResult";
import { useRowDetailNavigation } from "./rowNavigation";
import type { ExecutionResponse, ResolvedOperation } from "./types";

// ResultRenderContext is handed to a host-supplied resultRenderer so it can
// replace the default result surface for selected entities (e.g. render a
// LogsTable for trace/log profiles). `defaultView` is the standard
// OperationResultView element; return it unchanged to keep the default.
export type ResultRenderContext = {
  surfaceKey?: string;
  response: ExecutionResponse | null;
  defaultView: ReactNode;
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
};

export type OperationResultViewProps = {
  response: ExecutionResponse | null;
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
};

// OperationResultView is the single result surface rendered by both the entity
// list catalog and the operation runner. It renders the clicky result table
// with its in-table FilterBar, the View/Download menu (automatic via the
// response's requestUrl), pagination, and row→detail navigation — so the
// surface looks and behaves identically wherever a result is shown.
export function OperationResultView({
  response,
  loading,
  loadingMessage,
  emptyMessage,
  ariaLabel,
  className,
  commandRuntime,
  detailOperation,
  filterConfig,
  pagination,
}: OperationResultViewProps) {
  const rowNav = useRowDetailNavigation(detailOperation);
  const filters = filterConfig?.filters;

  return (
    <ExecutionResult
      response={response}
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
      {...(pagination ? { pagination } : {})}
    />
  );
}
