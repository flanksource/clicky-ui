import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { ClickyRow } from "../data/Clicky";
import type { StaticIconComponent } from "../data/Icon";
import type { ChatContextItem } from "../data/ai/context";
import { UiAdd, UiTable } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { packParameterValues, type ParameterValues } from "./formMetadata";
import {
  filterOperationsBySurface,
  findSurfaceDetailOperation,
  findSurfaceListOperation,
  getClickySurfaces,
  getOperationClickyMeta,
} from "./clickyMetadata";
import { OperationEntityPicker } from "./OperationEntityPicker";
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

// EntityContextSurfaceRenderContext is handed to a host-supplied surfaceRenderer
// so it can replace the picker dialog for selected surfaces, the way
// ResultRenderer replaces a result surface. The generic dialog lists whatever
// the entity's list operation returns, which is the right default and the wrong
// answer for a surface the host already browses with a purpose-built UI — a
// document tree, a map, a calendar. `defaultView` is the standard dialog;
// return it unchanged to keep it.
//
// The whole dialog is replaced rather than only its body: a replacement that
// owns selection has to own the confirm button too, or the footer would count
// rows the host is no longer tracking.
export type EntityContextSurfaceRenderContext = {
  surface: ClickySurface;
  listOperation: ResolvedOperation;
  detailOperation?: ResolvedOperation;
  /** Already-attached items, so a replacement can disable them. */
  items: ChatContextItem[];
  onAdd: (item: ChatContextItem) => void;
  onAddMany: (items: ChatContextItem[]) => void;
  /** True while this surface is the one chosen from the dropdown. */
  open: boolean;
  close: () => void;
  defaultView: ReactNode;
};

export type EntityContextSurfaceRenderer = (
  ctx: EntityContextSurfaceRenderContext,
) => ReactNode;

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
  /** Replaces the picker dialog for surfaces the host browses its own way. */
  surfaceRenderer?: EntityContextSurfaceRenderer;
  triggerLabel?: string;
};

type ContextSurface = {
  surface: ClickySurface;
  listOperation: ResolvedOperation;
  detailOperation?: ResolvedOperation;
};

const plural = (count: number) => (count === 1 ? "" : "s");

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
  surfaceRenderer,
  triggerLabel = "Add context",
}: OperationEntityContextPickerProps) {
  const {
    operations,
    spec,
    isLoading: operationsLoading,
  } = useOperations(client);
  const [open, setOpen] = useState(false);
  const [surfaceKey, setSurfaceKey] = useState("");

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

  const selected = surfaces.find((entry) => entry.surface.key === surfaceKey);
  const existingIDs = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );

  const hydrateRow = useCallback(
    async (row: ClickyRow, listFilters: ParameterValues) => {
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
        // The list's own scope (a database, an environment) rides along to the
        // detail call wherever the detail operation accepts the same parameter.
        const packedFilters = packParameterValues(
          listFilters,
          selected.listOperation.operation.parameters ?? [],
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
    [client, existingIDs, selected],
  );

  // Adds every record that hydrates, then rejects with the failures so the
  // picker keeps the dialog open and shows them.
  const attachRows = useCallback(
    async (rows: ClickyRow[], listFilters: ParameterValues) => {
      const results = await Promise.allSettled(
        rows.map((row) => hydrateRow(row, listFilters)),
      );
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
      if (failures.length > 0) {
        const first = failures[0];
        throw new Error(
          `${failures.length} record${plural(failures.length)} could not be attached: ${first instanceof Error ? first.message : String(first)}`,
        );
      }
    },
    [hydrateRow, onAdd, onAddMany],
  );

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

  const trigger = (
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
  );

  if (!selected) return trigger;

  const selectedLabel =
    surfaceLabel?.(selected.surface, selected.listOperation) ??
    selected.surface.title;
  const selectedSurfaceKey = selected.surface.key;
  const defaultDialog = (
    <OperationEntityPicker
      open={open}
      onClose={() => setOpen(false)}
      title={`Add ${selectedLabel} context`}
      client={client}
      surfaceKey={selectedSurfaceKey}
      mode="multi"
      onSelect={(_ids, rows, { filters }) => attachRows(rows, filters)}
      unavailableRows={{
        isUnavailable: (row) => {
          const id = getClickyRowId(row);
          return (
            !!id && existingIDs.has(entityContextItemID(selectedSurfaceKey, id))
          );
        },
        label: "Attached",
        columnLabel: "Context",
      }}
      selectLabel={({ count, pending }) =>
        pending
          ? "Adding…"
          : count > 0
            ? `Add ${count} record${plural(count)}`
            : "Add records"
      }
      note={
        items.length ? (
          <p className="text-xs text-muted-foreground">
            {items.length} context {items.length === 1 ? "record" : "records"}{" "}
            attached. Attached rows are disabled.
          </p>
        ) : null
      }
    />
  );

  return (
    <>
      {trigger}
      {surfaceRenderer
        ? surfaceRenderer({
            surface: selected.surface,
            listOperation: selected.listOperation,
            ...(selected.detailOperation
              ? { detailOperation: selected.detailOperation }
              : {}),
            items,
            onAdd,
            onAddMany: (added) =>
              onAddMany ? onAddMany(added) : added.forEach(onAdd),
            open,
            close: () => setOpen(false),
            defaultView: defaultDialog,
          })
        : defaultDialog}
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
