import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import type { FilterExtension } from "../components/filter-bar-utils";
import type { ClickyCellRenderers, ClickyRow } from "../data/Clicky";
import { Modal } from "../overlay/Modal";
import {
  filterOperationsBySurface,
  findSurfaceListOperation,
  getClickySurfaces,
} from "./clickyMetadata";
import type { RenderLink } from "./EndpointList";
import { packLookupParameterValues } from "./formMetadata";
import { OperationCatalog } from "./OperationCatalog";
import {
  operationLookupQuery,
  type OperationCatalogRowSelectionContext,
  type OperationCatalogRowSelectionMode,
  type OperationCatalogUnavailableRows,
} from "./operationCatalogRowSelection";
import { lockedScopeEntries, reconcilePickedRows } from "./OperationEntityPicker.model";
import { getClickyRowId } from "./rowNavigation";
import { useOperations, type OperationsApiClient } from "./useOperations";

export type OperationEntityPickerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  client: OperationsApiClient;
  /** The clicky surface whose list operation supplies the rows. */
  surfaceKey: string;
  /** Defaults to "single": checking a row replaces the previous one. */
  mode?: OperationCatalogRowSelectionMode;
  /** Ids checked each time the dialog opens. */
  selected?: string[];
  /**
   * Called by Select with the checked ids and, in the same order, the row of
   * each id the reader checked while the dialog was open — an id carried in
   * through `selected` and left untouched has no row. `context.filters` is the
   * list scope at the last selection change (the opening scope when the reader
   * never changed it). The dialog closes when this returns or resolves; a
   * rejection is shown in the dialog, which stays open.
   */
  onSelect: (
    ids: string[],
    rows: ClickyRow[],
    context: OperationCatalogRowSelectionContext,
  ) => void | Promise<void>;
  /** Pinned list parameters, shown only as the read-only "Scoped to" line. */
  lockedValues?: Record<string, string>;
  /** Display names for locked parameter keys, overriding the filter labels. */
  lockedLabels?: Record<string, string>;
  /** Editable starting values for the dialog's filters. */
  initialValues?: Record<string, string>;
  unavailableRows?: OperationCatalogUnavailableRows;
  /** Label of the confirm button; defaults to "Select" / "Selecting…". */
  selectLabel?: (state: { count: number; pending: boolean }) => string;
  /** Extra content under the table. */
  note?: ReactNode;
  filterPre?: FilterExtension[];
  hiddenColumns?: string[];
  cellRenderers?: ClickyCellRenderers;
};

const EMPTY_VALUES: Record<string, string> = {};
const EMPTY_IDS: string[] = [];

const defaultSelectLabel = ({ pending }: { pending: boolean }) =>
  pending ? "Selecting…" : "Select";

// In picker mode OperationCatalog refuses a surface without a list operation
// before it would render its endpoint links, so no link is ever rendered.
const pickerRenderLink: RenderLink = () => {
  throw new Error("OperationEntityPicker renders no endpoint links");
};

/**
 * OperationEntityPicker is a dialog for picking one or more rows from a clicky
 * surface's list operation, optionally scoped by locked parameter values. It is
 * OperationCatalog in picker mode (a checkbox per row, row click toggles) plus
 * a Cancel / Select footer.
 */
export function OperationEntityPicker({
  open,
  onClose,
  title,
  client,
  surfaceKey,
  mode = "single",
  selected = EMPTY_IDS,
  onSelect,
  lockedValues = EMPTY_VALUES,
  lockedLabels,
  initialValues = EMPTY_VALUES,
  unavailableRows,
  selectLabel = defaultSelectLabel,
  note,
  filterPre,
  hiddenColumns,
  cellRenderers,
}: OperationEntityPickerProps) {
  const openingContext = useMemo(
    () => ({ filters: { ...initialValues, ...lockedValues } }),
    [initialValues, lockedValues],
  );
  const [ids, setIds] = useState<string[]>(selected);
  const [rowsById, setRowsById] = useState<Record<string, ClickyRow>>({});
  const [context, setContext] = useState(openingContext);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  // Reset on every open, during render so the table never shows the last
  // session's checks for a frame (Modal stays mounted for its exit transition).
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setIds(selected);
      setRowsById({});
      setContext(openingContext);
      setPending(false);
      setError("");
    }
  }

  const { operations, spec } = useOperations(client);
  const listOperation = useMemo(
    () =>
      findSurfaceListOperation(filterOperationsBySurface(operations, surfaceKey), surfaceKey),
    [operations, surfaceKey],
  );
  const surface = getClickySurfaces(spec).find((entry) => entry.key === surfaceKey);
  const listParameters = listOperation?.operation.parameters;
  // Observes (never fetches) the lookup the catalog issues for the opening
  // scope, so the scope line can name a locked GUID by its option label.
  const lookup = useQuery({
    ...operationLookupQuery(
      client,
      listOperation,
      packLookupParameterValues(openingContext.filters, listParameters ?? []),
    ),
    enabled: false,
  });
  const scope = useMemo(
    () =>
      listParameters
        ? lockedScopeEntries({
            lockedValues,
            lockedLabels,
            parameters: listParameters,
            lookup: lookup.data,
            components: spec?.components?.["x-clicky-filters"],
          })
        : [],
    [listParameters, lockedLabels, lockedValues, lookup.data, spec],
  );

  const pickedRows = ids.flatMap((id) => {
    const row = rowsById[id];
    return row ? [row] : [];
  });
  const confirm = async () => {
    setPending(true);
    setError("");
    try {
      await onSelect(ids, pickedRows, context);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
      return;
    }
    setPending(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="2xl"
      expandable
      scrollBody={false}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{ids.length} selected</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void confirm()}
              disabled={ids.length === 0 || pending}
            >
              {selectLabel({ count: ids.length, pending })}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {scope.length > 0 ? (
          <p className="text-xs text-muted-foreground" data-slot="operation-picker-scope">
            {`Scoped to: ${scope.map((entry) => `${entry.label} = ${entry.value}`).join(" · ")}`}
          </p>
        ) : null}
        {error ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col">
          <OperationCatalog
            key={surfaceKey}
            definition={{
              key: surfaceKey,
              title: surface?.title ?? surfaceKey,
              description: surface?.description ?? "",
            }}
            entities={[]}
            client={client}
            surfaceKey={surfaceKey}
            renderLink={pickerRenderLink}
            urlState={false}
            lockedValues={lockedValues}
            initialValues={initialValues}
            {...(filterPre ? { filterPre } : {})}
            {...(hiddenColumns ? { hiddenColumns } : {})}
            {...(cellRenderers ? { cellRenderers } : {})}
            rowSelection={{
              mode,
              selectedRowIds: ids,
              onSelectionChange: (next, rows, nextContext) => {
                const loaded = new Map(
                  rows.flatMap((row) => {
                    const id = getClickyRowId(row);
                    return id ? [[id, row] as const] : [];
                  }),
                );
                setIds(next);
                setRowsById((prev) => reconcilePickedRows(prev, next, loaded));
                setContext(nextContext);
              },
              ...(unavailableRows ? { unavailableRows } : {}),
            }}
          />
        </div>
        {note}
      </div>
    </Modal>
  );
}
