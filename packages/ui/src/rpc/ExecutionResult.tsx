import {
  Clicky,
  parseClickyData,
  type ClickyCommandRuntime,
  type ClickyDocument,
  type ClickyNode,
  type ClickyTableRowHref,
  type ClickyTableRowClick,
  type ClickyTableRowPredicate,
} from "../data/Clicky";
import { DataTable, type DataTableColumn } from "../data/DataTable";
import type {
  FilterBarFilter,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import { cn } from "../lib/utils";
import { parseJsonBody } from "./classify";
import type { ExecutionResponse } from "./types";

type LoadingResultRow = {
  result: string;
  status: string;
  updated: string;
  details: string;
};

const LOADING_RESULT_COLUMNS: DataTableColumn<LoadingResultRow>[] = [
  { key: "result", label: "Result", grow: true },
  { key: "status", label: "Status", shrink: true },
  { key: "updated", label: "Updated", shrink: true },
  { key: "details", label: "Details", grow: true },
];

export type ExecutionResultProps = {
  response?: ExecutionResponse | null;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  commandRuntime?: ClickyCommandRuntime;
  onTableRowClick?: ClickyTableRowClick;
  getTableRowHref?: ClickyTableRowHref;
  isTableRowClickable?: ClickyTableRowPredicate;
  /** Caller-owned search input published into the embedded table's FilterBar. */
  search?: FilterBarSearchProps;
  /** Caller-owned time-range control published into the embedded table's FilterBar. */
  timeRange?: FilterBarRangeProps;
  /** Caller-owned filter pills published into the embedded table's FilterBar. */
  externalFilters?: FilterBarFilter[];
};

export function ExecutionResult({
  response,
  loading = false,
  loadingMessage = "Loading execution results…",
  emptyMessage = "No response yet.",
  ariaLabel = "Response body",
  className,
  commandRuntime,
  onTableRowClick,
  getTableRowHref,
  isTableRowClickable,
  search,
  timeRange,
  externalFilters,
}: ExecutionResultProps) {
  if (loading) {
    return (
      <div role="region" aria-label={ariaLabel} className={cn("mt-3", className)}>
        <DataTable<LoadingResultRow>
          data={[]}
          columns={LOADING_RESULT_COLUMNS}
          loading
          loadingMessage={loadingMessage}
          loadingRowCount={8}
          showGlobalFilter={false}
          showDensityControl={false}
          hideableColumns={false}
          resizableColumns={false}
          persistColumnWidths={false}
          persistColumnVisibility={false}
          persistDensity={false}
        />
      </div>
    );
  }

  if (!response) {
    return <p className={cn("mt-3 text-sm text-muted-foreground", className)}>{emptyMessage}</p>;
  }

  const rawText = response.stdout || response.output || response.message || "";
  const parsedPayload = response.parsed ?? parseJsonBody(response);
  const clickyPayload: string | ClickyNode | ClickyDocument | undefined =
    typeof parsedPayload === "string" ||
    (parsedPayload != null && typeof parsedPayload === "object")
      ? (parsedPayload as ClickyNode | ClickyDocument)
      : rawText;
  const parsedClicky = clickyPayload === "" ? null : parseClickyData(clickyPayload);

  if (parsedClicky?.ok) {
    return (
      <div role="region" aria-label={ariaLabel} className={cn("mt-3", className)}>
        <Clicky
          data={parsedClicky.document}
          {...(response.requestUrl ? { url: response.requestUrl } : {})}
          {...(commandRuntime ? { commandRuntime } : {})}
          {...(onTableRowClick ? { onTableRowClick } : {})}
          {...(getTableRowHref ? { getTableRowHref } : {})}
          {...(isTableRowClickable ? { isTableRowClickable } : {})}
          {...(search ? { search } : {})}
          {...(timeRange ? { timeRange } : {})}
          {...(externalFilters ? { externalFilters } : {})}
        />
      </div>
    );
  }

  const renderedText = parsedPayload != null ? JSON.stringify(parsedPayload, null, 2) : rawText;

  if (!renderedText) {
    return (
      <p className={cn("mt-3 text-sm text-muted-foreground", className)}>
        Response completed with no body.
      </p>
    );
  }

  return (
    <pre
      aria-label={ariaLabel}
      className={cn("mt-3 overflow-auto rounded-md bg-muted p-4 text-xs", className)}
    >
      {renderedText}
    </pre>
  );
}
