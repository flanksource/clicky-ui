import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import type { ClickyDocument, ClickyNode, ClickyRow } from "../data/Clicky";
import type { StaticIconComponent } from "../data/Icon";
import type { ChatContextItem } from "../data/ai/context";
import { UiAdd, UiTable } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { Modal } from "../overlay/Modal";
import { CommandOutput } from "./CommandOutput";
import {
  dataTablePaginationFromForm,
  packParameterValues,
  parametersToFormConfig,
  useDebouncedRecord,
  type ParameterValues,
} from "./formMetadata";
import {
  filterOperationsBySurface,
  findSurfaceDetailOperation,
  findSurfaceListOperation,
  getClickySurfaces,
  getOperationClickyMeta,
} from "./clickyMetadata";
import { getClickyRowId } from "./rowNavigation";
import { resolveSurfaceIcon } from "./surfaceIconMap";
import type {
  ClickySurface,
  ExecutionResponse,
  ResolvedOperation,
} from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";
import {
  clickyRowRecord,
  contextItemFromEntityRow,
  entityContextItemID,
} from "./OperationEntityContextPicker.model";

export type EntityContextSurfaceFilter = (
  surface: ClickySurface,
  listOperation: ResolvedOperation,
) => boolean;

export type EntityContextSurfaceText = (
  surface: ClickySurface,
  listOperation: ResolvedOperation,
) => string;

export type EntityContextSurfaceIcon = (
  surface: ClickySurface,
  listOperation: ResolvedOperation,
) => string | StaticIconComponent | undefined;

export type EntityContextSurfaceColor = (
  surface: ClickySurface,
  listOperation: ResolvedOperation,
) => string | undefined;

export type EntityContextGroupIcon = (
  group: string,
) => string | StaticIconComponent | undefined;

export type EntityContextGroupColor = (group: string) => string | undefined;

export type OperationEntityContextPickerProps = {
  client: OperationsApiClient;
  items: ChatContextItem[];
  onAdd: (item: ChatContextItem) => void;
  onAddMany?: (items: ChatContextItem[]) => void;
  surfaceFilter?: EntityContextSurfaceFilter;
  surfaceLabel?: EntityContextSurfaceText;
  surfaceGroup?: EntityContextSurfaceText;
  surfaceIcon?: EntityContextSurfaceIcon;
  surfaceColor?: EntityContextSurfaceColor;
  /** Icon for a top-level provider/group row (the submenu trigger). */
  surfaceGroupIcon?: EntityContextGroupIcon;
  /** Icon colour for a top-level provider/group row. */
  surfaceGroupColor?: EntityContextGroupColor;
  triggerLabel?: string;
};

type ContextSurface = {
  surface: ClickySurface;
  listOperation: ResolvedOperation;
  detailOperation?: ResolvedOperation;
};

export function OperationEntityContextPicker({
  client,
  items,
  onAdd,
  onAddMany,
  surfaceFilter,
  surfaceLabel,
  surfaceGroup,
  surfaceIcon,
  surfaceColor,
  surfaceGroupIcon,
  surfaceGroupColor,
  triggerLabel = "Add context",
}: OperationEntityContextPickerProps) {
  const {
    operations,
    spec,
    isLoading: operationsLoading,
  } = useOperations(client);
  const [open, setOpen] = useState(false);
  const [surfaceKey, setSurfaceKey] = useState("");
  const [filters, setFilters] = useState<ParameterValues>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, ClickyRow>>(
    {},
  );
  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState("");

  const surfaces = useMemo<ContextSurface[]>(() => {
    return getClickySurfaces(spec)
      .flatMap((surface): ContextSurface[] => {
        const surfaceOperations = filterOperationsBySurface(
          operations,
          surface.key,
        );
        const listOperation = findSurfaceListOperation(
          surfaceOperations,
          surface.key,
        );
        if (!listOperation || listOperation.method.toUpperCase() !== "GET")
          return [];
        if (surfaceFilter && !surfaceFilter(surface, listOperation)) return [];
        const detailOperation = findSurfaceDetailOperation(
          surfaceOperations,
          surface.key,
        );
        return [
          {
            surface,
            listOperation,
            ...(detailOperation ? { detailOperation } : {}),
          },
        ];
      })
      .sort((left, right) => {
        const leftGroup =
          surfaceGroup?.(left.surface, left.listOperation) ??
          left.surface.parent ??
          "";
        const rightGroup =
          surfaceGroup?.(right.surface, right.listOperation) ??
          right.surface.parent ??
          "";
        return (
          leftGroup.localeCompare(rightGroup) ||
          left.surface.title.localeCompare(right.surface.title)
        );
      });
  }, [operations, spec, surfaceFilter, surfaceGroup]);

  useEffect(() => {
    setFilters({});
    setSelectedRows({});
    setAttachError("");
  }, [surfaceKey]);

  const selected = surfaces.find((entry) => entry.surface.key === surfaceKey);
  const parameters = selected?.listOperation.operation.parameters ?? [];
  const debouncedFilters = useDebouncedRecord(filters, 250);
  const packedFilters = useMemo(
    () => packParameterValues(debouncedFilters, parameters),
    [debouncedFilters, parameters],
  );

  const lookupQuery = useQuery({
    queryKey: [
      "entity-context-lookup",
      selected?.listOperation.path,
      packedFilters,
    ],
    queryFn: async () =>
      (await client.lookupFilters?.(
        selected!.listOperation.path,
        selected!.listOperation.method,
        packedFilters,
        { Accept: "application/json+clicky" },
      )) ?? { filters: {} },
    enabled:
      open &&
      !!selected &&
      !!client.lookupFilters &&
      parameters.some((parameter) => parameter.in === "query"),
    staleTime: 30_000,
    retry: 0,
  });

  const listQuery = useQuery<ExecutionResponse>({
    queryKey: [
      "entity-context-list",
      selected?.listOperation.path,
      packedFilters,
    ],
    queryFn: () =>
      client.executeCommand(
        selected!.listOperation.path,
        selected!.listOperation.method,
        packedFilters,
        { Accept: "application/json+clicky" },
      ),
    enabled: open && !!selected,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  const filterConfig = useMemo(
    () =>
      parametersToFormConfig(parameters, filters, setFilters, {
        includeLocations: ["query"],
        lookup: lookupQuery.data,
      }),
    [filters, lookupQuery.data, parameters],
  );
  const pagination = useMemo(
    () => dataTablePaginationFromForm(filterConfig.pagination, listQuery.data),
    [filterConfig.pagination, listQuery.data],
  );
  const existingIDs = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );
  const markedListResponse = useMemo(
    () => markAttachedRows(listQuery.data, selected?.surface.key, existingIDs),
    [existingIDs, listQuery.data, selected?.surface.key],
  );

  const hydrateRow = useCallback(
    async (row: ClickyRow) => {
      if (!selected) throw new Error("Select an entity type first.");
      const recordID = getClickyRowId(row);
      if (!recordID) {
        throw new Error("This row does not expose a stable record ID.");
      }
      const contextID = entityContextItemID(selected.surface.key, recordID);
      if (existingIDs.has(contextID)) {
        throw new Error("This record is already attached.");
      }

      let record: unknown = clickyRowRecord(row);
      if (selected.detailOperation) {
        const detailMeta = getOperationClickyMeta(selected.detailOperation);
        const idParam =
          detailMeta?.idParam ??
          selected.detailOperation.operation.parameters?.find(
            (parameter) => parameter.in === "path",
          )?.name ??
          "id";
        const detailParameterNames = new Set(
          selected.detailOperation.operation.parameters?.map(
            (parameter) => parameter.name,
          ) ?? [],
        );
        const detailParams = Object.fromEntries(
          Object.entries(packedFilters).filter(([key]) =>
            detailParameterNames.has(key),
          ),
        );
        detailParams[idParam] = recordID;
        const response = await client.executeCommand(
          selected.detailOperation.path,
          selected.detailOperation.method,
          detailParams,
          { Accept: "application/json" },
        );
        record = response.parsed ?? parseResponseJSON(response) ?? record;
      }

      const contextItem = contextItemFromEntityRow(
        selected.surface,
        row,
        record,
      );
      if (!contextItem)
        throw new Error("This row does not expose a stable record ID.");
      return contextItem;
    },
    [client, existingIDs, packedFilters, selected],
  );

  const attachSelected = useCallback(async () => {
    const rows = Object.values(selectedRows);
    if (rows.length === 0) return;
    setAttaching(true);
    setAttachError("");
    const results = await Promise.allSettled(rows.map(hydrateRow));
    const added = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const failures = results.flatMap((result) =>
      result.status === "rejected" ? [result.reason] : [],
    );
    if (added.length > 0) {
      if (onAddMany) onAddMany(added);
      else added.forEach(onAdd);
    }
    setAttaching(false);
    if (failures.length > 0) {
      const first = failures[0];
      setAttachError(
        `${failures.length} record${failures.length === 1 ? "" : "s"} could not be attached: ${first instanceof Error ? first.message : String(first)}`,
      );
      return;
    }
    setSelectedRows({});
    setOpen(false);
  }, [hydrateRow, onAdd, onAddMany, selectedRows]);

  const menuItems = useMemo<DropdownMenuItem[]>(() => {
    // `surfaces` is pre-sorted by group then title, so bucketing by group in
    // insertion order yields a stable provider → type tree without re-sorting.
    const groups: Array<{ group: string; leaves: DropdownMenuItem[] }> = [];
    const byGroup = new Map<string, DropdownMenuItem[]>();
    for (const entry of surfaces) {
      const group =
        surfaceGroup?.(entry.surface, entry.listOperation) ??
        entry.surface.parent ??
        "Other";
      const label =
        surfaceLabel?.(entry.surface, entry.listOperation) ??
        entry.surface.title;
      const icon =
        surfaceIcon?.(entry.surface, entry.listOperation) ??
        resolveSurfaceIcon(entry.surface.icon) ??
        UiTable;
      const iconColor = surfaceColor?.(entry.surface, entry.listOperation);
      const leaf: DropdownMenuItem = {
        label,
        title: label,
        icon,
        ...(iconColor ? { iconColor } : {}),
        onSelect: () => {
          setSurfaceKey(entry.surface.key);
          setOpen(true);
        },
      };
      let bucket = byGroup.get(group);
      if (!bucket) {
        bucket = [];
        byGroup.set(group, bucket);
        groups.push({ group, leaves: bucket });
      }
      bucket.push(leaf);
    }

    // A single group would nest everything under one lone submenu; render its
    // types flat instead.
    if (groups.length <= 1) return groups[0]?.leaves ?? [];

    return groups.map(({ group, leaves }): DropdownMenuItem => {
      const groupColor = surfaceGroupColor?.(group);
      // A submenu child already sits under its group header — don't repeat the
      // group name in the child label. The tooltip (title) and the detail dialog
      // keep the full label.
      const prefix = `${group} `;
      const children = leaves.map((leaf) =>
        typeof leaf.label === "string" && leaf.label.startsWith(prefix)
          ? { ...leaf, label: leaf.label.slice(prefix.length) }
          : leaf,
      );
      return {
        label: group,
        title: group,
        icon: surfaceGroupIcon?.(group) ?? leaves[0]?.icon ?? UiTable,
        ...(groupColor ? { iconColor: groupColor } : {}),
        onSelect: () => {},
        children,
      };
    });
  }, [
    surfaceColor,
    surfaceGroup,
    surfaceGroupColor,
    surfaceGroupIcon,
    surfaceIcon,
    surfaceLabel,
    surfaces,
  ]);

  const selectedCount = Object.keys(selectedRows).length;
  const selectedLabel = selected
    ? (surfaceLabel?.(selected.surface, selected.listOperation) ??
      selected.surface.title)
    : "records";

  return (
    <>
      <DropdownMenu
        label={triggerLabel}
        icon={UiAdd}
        variant="ghost"
        size="sm"
        align="left"
        menuLabel="Context entity types"
        menuClassName="min-w-56"
        items={
          menuItems.length > 0
            ? menuItems
            : [
                {
                  label: operationsLoading
                    ? "Loading entity types…"
                    : "No entity listings available",
                  disabled: true,
                  onSelect: () => {},
                },
              ]
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Add ${selectedLabel} context`}
        size="2xl"
        expandable
        scrollBody={false}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {selectedCount === 0
                ? "Select one or more records from the table."
                : `${selectedCount} record${selectedCount === 1 ? "" : "s"} selected`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={attaching}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void attachSelected()}
                disabled={selectedCount === 0 || attaching}
              >
                {attaching
                  ? "Adding…"
                  : selectedCount > 0
                    ? `Add ${selectedCount} record${selectedCount === 1 ? "" : "s"}`
                    : "Add records"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {surfaces.length === 0 && !operationsLoading ? (
            <p className="text-sm text-muted-foreground">
              No attachable entity surfaces are available.
            </p>
          ) : null}
          {lookupQuery.error ? (
            <PickerError error={lookupQuery.error} prefix="Load filters" />
          ) : null}
          {listQuery.error ? (
            <PickerError error={listQuery.error} prefix="Load records" />
          ) : null}
          {attachError ? (
            <PickerError error={attachError} prefix="Attach record" />
          ) : null}
          {attaching ? (
            <div role="status" className="text-xs text-muted-foreground">
              Loading full record details and adding context…
            </div>
          ) : null}

          {selected ? (
            <CommandOutput
              bare
              className="mt-0 flex-1"
              response={markedListResponse ?? null}
              loading={listQuery.isLoading || listQuery.isFetching}
              loadingMessage="Loading records…"
              emptyMessage="No matching records."
              ariaLabel="Context records"
              rowSelection={{
                selectedRowIds: Object.keys(selectedRows),
                // Keep selections made on other pages: reconcile the table's
                // next id set against the rows on the current page, falling back
                // to the already-known row for ids from previously-viewed pages.
                onSelectionChange: (nextIds, rows) => {
                  const rowByID = new Map(
                    rows.flatMap((row) => {
                      const id = getClickyRowId(row);
                      return id ? [[id, row] as const] : [];
                    }),
                  );
                  setSelectedRows((prev) =>
                    Object.fromEntries(
                      nextIds.flatMap((id) => {
                        const row = rowByID.get(id) ?? prev[id];
                        return row ? [[id, row] as const] : [];
                      }),
                    ),
                  );
                },
                getRowId: (row, index) =>
                  getClickyRowId(row) ?? `context-row-${index}`,
                isRowSelectable: (row) => {
                  const id = getClickyRowId(row);
                  return (
                    !!id &&
                    !existingIDs.has(
                      entityContextItemID(selected.surface.key, id),
                    )
                  );
                },
                toggleOnRowClick: true,
              }}
              {...(filterConfig.search ? { search: filterConfig.search } : {})}
              {...(filterConfig.timeRange
                ? { timeRange: filterConfig.timeRange }
                : {})}
              {...(filterConfig.filters.length
                ? { externalFilters: filterConfig.filters }
                : {})}
              {...(pagination ? { pagination } : {})}
            />
          ) : null}

          {items.length ? (
            <p className="text-xs text-muted-foreground">
              {items.length} context {items.length === 1 ? "record" : "records"}{" "}
              attached. Attached rows are disabled.
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

function parseResponseJSON(response: ExecutionResponse): unknown {
  const text = response.stdout || response.output || "";
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function markAttachedRows(
  response: ExecutionResponse | undefined,
  surfaceKey: string | undefined,
  existingIDs: Set<string>,
): ExecutionResponse | undefined {
  if (!response || !surfaceKey || existingIDs.size === 0 || !response.parsed)
    return response;
  const parsed = response.parsed as Partial<ClickyDocument> &
    Partial<ClickyNode>;
  const node = parsed.version === 1 && parsed.node ? parsed.node : parsed;
  if (node.kind !== "table" || !node.rows?.length) return response;
  const tableNode = node as ClickyNode;
  const attached = tableNode.rows!.map((row) => {
    const id = getClickyRowId(row);
    return !!id && existingIDs.has(entityContextItemID(surfaceKey, id));
  });
  if (!attached.some(Boolean)) return response;

  const markerColumn = {
    name: "__chat_context",
    label: "Context",
    shrink: true,
  };
  const markedNode: ClickyNode = {
    ...tableNode,
    kind: "table",
    columns: [...(tableNode.columns ?? []), markerColumn],
    rows: tableNode.rows!.map((row, index) => ({
      ...row,
      cells: {
        ...row.cells,
        __chat_context: attached[index]
          ? { kind: "badge", badgeLabel: "Attached" }
          : { kind: "text", text: "", plain: "" },
      },
    })),
  };
  return {
    ...response,
    parsed:
      parsed.version === 1
        ? { ...(parsed as ClickyDocument), node: markedNode }
        : markedNode,
  };
}

function PickerError({ error, prefix }: { error: unknown; prefix: string }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <span className="font-medium">{prefix}:</span> {message}
    </div>
  );
}
