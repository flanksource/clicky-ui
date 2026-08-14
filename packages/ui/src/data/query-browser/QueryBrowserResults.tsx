import {
  DataTable,
  type DataTableColumn,
  type DataTableMenuAction,
  type DataTablePagination,
} from "../DataTable";
import { Properties } from "../Properties";
import type { serverFiltersToFilterBar } from "../data-table-server-filters";
import type { QueryBrowserResult } from "./QueryBrowser.types";

type QueryBrowserResultsProps = {
  result: QueryBrowserResult | null;
  pending: boolean;
  title?: string;
  queryLabel: string;
  columns: DataTableColumn<Record<string, unknown>>[];
  filterConfig: ReturnType<typeof serverFiltersToFilterBar>;
  serverFiltered: boolean;
  pagination?: DataTablePagination;
  /** Extra entries for the table's overflow menu — "Debug" among them. */
  menuActions?: DataTableMenuAction[];
};

export function QueryBrowserResults({
  result,
  pending,
  title,
  queryLabel,
  columns,
  filterConfig,
  serverFiltered,
  pagination,
  menuActions,
}: QueryBrowserResultsProps) {
  if (!result) {
    return (
      <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
        Run a query to see results.
      </div>
    );
  }
  const rows = result.rows ?? [];
  const described = result.columns ?? [];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          {rows.length.toLocaleString()} rows{result.truncated ? "+" : ""}
        </span>
        {result.truncated && (
          <span className="text-amber-600 [[data-theme=dark]_&]:text-amber-400">
            stopped at the console&apos;s{" "}
            {(result.limit ?? rows.length).toLocaleString()}-row bound; narrow
            the query to see the rest
          </span>
        )}
        {result.affectedRows !== undefined && (
          <span>{result.affectedRows.toLocaleString()} affected</span>
        )}
        {result.durationMs !== undefined && (
          <span>{Math.round(result.durationMs)} ms</span>
        )}
        {result.message && <span>{result.message}</span>}
      </div>
      {rows.length > 0 || described.length > 0 ? (
        <DataTable
          data={rows}
          columns={columns}
          loading={pending}
          autoFilter={false}
          {...(serverFiltered
            ? {
                manualFilter: true,
                externalFilters: filterConfig.filters,
                ...(filterConfig.timeRange
                  ? { externalTimeRange: filterConfig.timeRange }
                  : {}),
              }
            : { showGlobalFilter: true })}
          showFullscreenControl
          fullscreenTitle={title ?? queryLabel}
          detailStyle="dialog"
          detailDialogTitle="Row details"
          renderExpandedRow={(row) => (
            <Properties
              items={Object.entries(row).map(([key, value]) => ({
                key,
                value,
              }))}
              renderLabel={(key) => key}
              density="compact"
            />
          )}
          {...(pagination ? { pagination } : {})}
          {...(menuActions && menuActions.length > 0 ? { menuActions } : {})}
          className="min-h-72 flex-1"
        />
      ) : (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          {result.message ?? "Statement completed with no rows."}
        </div>
      )}
    </div>
  );
}
