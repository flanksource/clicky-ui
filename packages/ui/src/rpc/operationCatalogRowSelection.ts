import type { ClickyNode, ClickyRow, ClickyTableRowSelection } from "../data/Clicky";
import { documentOf, mapFirstTable } from "./executionPages";
import type { ParameterValues } from "./formMetadata";
import { getClickyRowId } from "./rowNavigation";
import type {
  ExecutionResponse,
  OperationLookupResponse,
  OperationRequestValues,
  ResolvedOperation,
} from "./types";
import type { OperationsApiClient } from "./useOperations";

export type OperationCatalogRowSelectionMode = "single" | "multi";

export type OperationCatalogRowSelectionContext = {
  /**
   * The catalog's effective list filters (locked values included) when the
   * selection changed — what a host needs to fetch the picked rows' details
   * under the same scope the list was read in.
   */
  filters: ParameterValues;
};

/** Rows that are listed but cannot be picked, badged in a trailing column. */
export type OperationCatalogUnavailableRows = {
  isUnavailable: (row: ClickyRow) => boolean;
  /** Badge text on an unavailable row, e.g. "Attached". */
  label: string;
  /** Header of the badge column. */
  columnLabel: string;
};

export type OperationCatalogRowSelection = {
  /** `single` keeps at most one row checked: checking a row replaces the last. */
  mode: OperationCatalogRowSelectionMode;
  /** Controlled ids, read through `getClickyRowId`. */
  selectedRowIds: string[];
  /**
   * Called with the next ids and the rows among them that are loaded on the
   * current page — a row checked on an earlier page is not in `rows`.
   */
  onSelectionChange: (
    ids: string[],
    rows: ClickyRow[],
    context: OperationCatalogRowSelectionContext,
  ) => void;
  unavailableRows?: OperationCatalogUnavailableRows;
};

/**
 * nextPickedRowIds applies the selection mode to the id set the table
 * proposes. Single mode keeps the one row just checked. The table offers no
 * header or group checkbox in single mode (`selectAll: false`), so a proposal
 * adding several rows at once is a broken invariant and throws.
 */
export function nextPickedRowIds(
  mode: OperationCatalogRowSelectionMode,
  previous: readonly string[],
  next: readonly string[],
): string[] {
  if (mode === "multi") return [...next];
  assertSingleSelection(previous);
  const added = next.filter((id) => !previous.includes(id));
  if (added.length === 0) return [...next];
  if (added.length === 1) return [added[0]!];
  throw new Error(
    `OperationCatalog single-mode selection was offered ${added.length} new rows at once (${added.join(", ")}); only a row checkbox or row click may change it`,
  );
}

function assertSingleSelection(ids: readonly string[]) {
  if (ids.length > 1) {
    throw new Error(
      `OperationCatalog single-mode selection holds ${ids.length} ids (${ids.join(", ")}); pass at most one`,
    );
  }
}

/** Adapts a host's picker selection to the result table's row selection. */
export function pickerTableRowSelection(
  selection: OperationCatalogRowSelection,
  filters: ParameterValues,
): ClickyTableRowSelection {
  const { mode, selectedRowIds, onSelectionChange, unavailableRows } = selection;
  if (mode === "single") assertSingleSelection(selectedRowIds);
  return {
    selectedRowIds,
    toggleOnRowClick: true,
    selectAll: mode === "multi",
    getRowId: (row, index) => getClickyRowId(row) ?? `operation-catalog-row-${index}`,
    isRowSelectable: (row) =>
      getClickyRowId(row) != null && !unavailableRows?.isUnavailable(row),
    onSelectionChange: (nextIds, rows) => {
      const ids = nextPickedRowIds(mode, selectedRowIds, nextIds);
      const picked = rows.filter((row) => {
        const id = getClickyRowId(row);
        return id != null && ids.includes(id);
      });
      onSelectionChange(ids, picked, { filters });
    },
  };
}

const UNAVAILABLE_COLUMN = "__unavailable";

/**
 * markUnavailableRows appends a badge column naming why a row cannot be
 * picked. A response with no unavailable row is returned by identity.
 */
export function markUnavailableRows(
  response: ExecutionResponse,
  unavailable: OperationCatalogUnavailableRows,
): ExecutionResponse {
  const document = documentOf(response);
  if (!document) return response;
  let marked = false;
  const node = mapFirstTable(document.node, (table): ClickyNode => {
    const flags = (table.rows ?? []).map(unavailable.isUnavailable);
    if (!flags.some(Boolean)) return table;
    marked = true;
    return {
      ...table,
      columns: [
        ...(table.columns ?? []),
        { name: UNAVAILABLE_COLUMN, label: unavailable.columnLabel, shrink: true },
      ],
      rows: (table.rows ?? []).map((row, index) => ({
        ...row,
        cells: {
          ...row.cells,
          [UNAVAILABLE_COLUMN]: flags[index]
            ? { kind: "badge", badgeLabel: unavailable.label }
            : { kind: "text", text: "", plain: "" },
        },
      })),
    };
  }).node;
  if (!marked) return response;
  const parsed = { ...document, node };
  return { ...response, parsed, stdout: JSON.stringify(parsed) };
}

/**
 * The react-query key and fetcher of a list surface's filter lookup. Shared so
 * a host reading the same lookup (the picker's scope line) observes the entry
 * the catalog fetches instead of issuing its own request.
 */
export function operationLookupQuery(
  client: OperationsApiClient,
  endpoint: ResolvedOperation | undefined,
  lookupParameters: OperationRequestValues,
) {
  return {
    queryKey: ["operation-lookup", endpoint?.method, endpoint?.path, lookupParameters] as const,
    queryFn: async (): Promise<OperationLookupResponse> => {
      if (!endpoint) throw new Error("operation lookup ran without a list operation");
      return (
        (await client.lookupFilters?.(endpoint.path, endpoint.method, lookupParameters, {
          Accept: "application/json+clicky",
        })) ?? { filters: {} }
      );
    },
  };
}
