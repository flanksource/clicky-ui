import { useMemo, useState, type ReactNode } from "react";
import {
  getFilterTokens,
  type DataTableColumn,
  type DataTableRowDetailContext,
} from "./DataTable";
import { Properties, type PropertiesAction, type PropertiesItem } from "./Properties";
import {
  TagActionsProvider,
  TagPropertiesList,
  type TagActionsContextValue,
  normalizeTags,
} from "./cells/TagList";
import { formatPropertyLabel } from "./properties-utils";
import type { LogsTableRow } from "./LogsTable";
import { asRecord } from "./log-utils";
import { UiChevronDown, UiChevronRight, UiCopy, UiZoomIn, UiZoomOut } from "../icons";

const TAGS_PATH = "details.tags";

// Key column shrinks to its content (no min/fixed width), never wider than 30ch.
const DETAIL_ROW_CLASS = "grid-cols-[fit-content(30ch)_minmax(0,1fr)]";

export function renderLogDetails(
  row: LogsTableRow,
  context: DataTableRowDetailContext<LogsTableRow>,
): ReactNode {
  return (
    <LogDetails
      row={row}
      filterActions={context.filterActionsByColumn}
      columns={context.columns}
    />
  );
}

/**
 * Maps a top-level detail field path (`details.<columnKey>`) to its column key.
 * Returns undefined for nested paths and the tags array, which have their own
 * filter affordances.
 */
function fieldColumnKey(path: string): string | undefined {
  if (!path.startsWith("details.") || path === TAGS_PATH) return undefined;
  const rest = path.slice("details.".length);
  return rest && !rest.includes(".") ? rest : undefined;
}

function LogDetails({
  row,
  filterActions,
  columns,
}: {
  row: LogsTableRow;
  filterActions: Record<string, TagActionsContextValue>;
  columns: DataTableColumn<LogsTableRow>[];
}) {
  const [openPaths, setOpenPaths] = useState<Record<string, boolean>>({});
  const setPathOpen = (path: string, open: boolean) => {
    setOpenPaths((current) => ({ ...current, [path]: open }));
  };
  const details = useMemo(() => buildProcessedLogDetails(row), [row]);

  const labelForPath = (path: string) => formatPropertyLabel(path.split(".").pop() ?? path);

  const columnByKey = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );

  // Include/exclude is wired only for fields whose column is a multi/nested-multi
  // (tristate) filter; other columns (high-cardinality text, number, timestamp)
  // don't honor multiFilters, so they get no filter actions. The toggle token
  // must match the column's filter token (e.g. a status column maps "INFO" to a
  // normalized status), so it is derived via getFilterTokens rather than the
  // displayed value.
  const fieldFilter = (
    path: string,
  ): { actions: TagActionsContextValue; token: string } | undefined => {
    const key = fieldColumnKey(path);
    if (!key) return undefined;
    const actions = filterActions[key];
    const column = columnByKey.get(key);
    if (!actions || !column) return undefined;
    const token = getFilterTokens(row, column)[0];
    return token ? { actions, token } : undefined;
  };

  const prefixActions: PropertiesAction<unknown>[] = [
    {
      id: "expand",
      icon: UiChevronRight,
      label: (key) => `Expand ${labelForPath(key)}`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !!item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(true),
    },
    {
      id: "collapse",
      icon: UiChevronDown,
      label: (key) => `Collapse ${labelForPath(key)}`,
      visible: (_k, _v, item) => !!item.expandable,
      disabled: (_k, _v, item) => !item.expanded,
      onClick: (_k, _v, item) => item.onToggle?.(false),
    },
    {
      id: "include",
      icon: UiZoomIn,
      label: (key) => `Include ${labelForPath(key)}`,
      visible: (key) => !!fieldFilter(key),
      onClick: (key) => {
        const filter = fieldFilter(key);
        filter?.actions.toggleInclude(filter.token);
      },
    },
    {
      id: "exclude",
      icon: UiZoomOut,
      label: (key) => `Exclude ${labelForPath(key)}`,
      visible: (key) => !!fieldFilter(key),
      onClick: (key) => {
        const filter = fieldFilter(key);
        filter?.actions.toggleExclude(filter.token);
      },
    },
  ];

  // Copy sits immediately after the value (suffix), separate from the leading
  // expand/collapse/include/exclude controls.
  const suffixActions: PropertiesAction<unknown>[] = [
    {
      id: "copy",
      icon: UiCopy,
      label: (key) => `Copy ${labelForPath(key)}`,
      visible: (key) => key !== TAGS_PATH,
      onClick: (_k, value) => copyLogDetailsValue(value),
    },
  ];

  const renderLabel = (key: string) => labelForPath(key);
  const renderValue = (key: string, value: unknown, item: PropertiesItem<unknown>) => {
    if (key === TAGS_PATH) {
      const count = Array.isArray(value) ? value.length : 0;
      return <span className="font-mono text-muted-foreground">[{count} tags]</span>;
    }
    return item.expandable ? <LogValueSummary value={value} /> : <LogScalarValue value={value} />;
  };

  const toItems = (value: unknown, path: string, depth: number): PropertiesItem<unknown>[] =>
    getValueEntries(value).map(([key, entryValue]) => {
      const entryPath = `${path}.${String(key)}`;
      const isTags = entryPath === TAGS_PATH;
      const expandable = isTags || isExpandableValue(entryValue);
      const open = openPaths[entryPath] ?? depth < 1;
      return {
        key: entryPath,
        value: entryValue,
        expandable,
        expanded: open,
        onToggle: (next) => setPathOpen(entryPath, next),
        renderChildren: () =>
          isTags ? (
            <TagPropertiesList
              tags={normalizeTags(entryValue as string[])}
              rowClassName={DETAIL_ROW_CLASS}
            />
          ) : (
            <Properties
              density="compact"
              items={toItems(entryValue, entryPath, depth + 1)}
              renderLabel={renderLabel}
              renderValue={renderValue}
              prefixActions={prefixActions}
              suffixActions={suffixActions}
              rowClassName={DETAIL_ROW_CLASS}
              className="mt-density-1"
            />
          ),
      };
    });

  const properties = (
    <Properties
      density="compact"
      items={toItems(details, "details", 0)}
      renderLabel={renderLabel}
      renderValue={renderValue}
      prefixActions={prefixActions}
      suffixActions={suffixActions}
      rowClassName={DETAIL_ROW_CLASS}
    />
  );

  const tagActions = filterActions["tags"];
  return (
    <div className="space-y-density-3 text-xs">
      {tagActions ? (
        <TagActionsProvider value={tagActions}>{properties}</TagActionsProvider>
      ) : (
        properties
      )}
    </div>
  );
}

function LogValueSummary({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return <span className="font-mono text-muted-foreground">[{value.length} items]</span>;
  }
  const record = asRecord(value);
  if (record) {
    const count = Object.keys(record).length;
    return (
      <span className="font-mono text-muted-foreground">
        {"{ "}
        {count} properties{" }"}
      </span>
    );
  }
  return <LogScalarValue value={value} />;
}

function LogScalarValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="font-mono italic text-muted-foreground">null</span>;
  }

  if (typeof value === "string") {
    return (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground">
        {value}
      </pre>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="font-mono text-blue-700 dark:text-blue-400">{String(value)}</span>;
  }

  return (
    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground">
      {stablePrettyString(value)}
    </pre>
  );
}

function getValueEntries(value: unknown): Array<[string | number, unknown]> {
  if (Array.isArray(value)) {
    return value.map((entry, index) => [index, entry]);
  }
  return Object.entries(asRecord(value) ?? {});
}

function isExpandableValue(value: unknown) {
  return getValueEntries(value).length > 0;
}

function stablePrettyString(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function copyLogDetailsValue(value: unknown) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    Promise.resolve(navigator.clipboard.writeText(stablePrettyString(value))).catch(
      () => undefined,
    );
  }
}

function buildProcessedLogDetails(row: LogsTableRow): Record<string, unknown> {
  const attributes = buildProcessedLogAttributes(row);
  return stripEmptyProperties({
    timestamp: row.timestamp,
    level: row.level,
    pod: row.pod,
    logger: row.logger,
    thread: row.thread,
    message: row.message,
    tags: row.tags,
    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
  });
}

function buildProcessedLogAttributes(row: LogsTableRow): Record<string, unknown> {
  const attributes = {
    ...asRecord(row.raw),
    ...asRecord(row.parsedLine),
  };
  const hiddenKeys = new Set([
    "@timestamp",
    "container",
    "event.dataset",
    "labels",
    "level",
    "line",
    "log.level",
    "log.logger",
    "logger",
    "message",
    "msg",
    "pod",
    "process.thread.name",
    "service",
    "service.name",
    "severity",
    "thread",
    "time",
    "timestamp",
  ]);

  return stripEmptyProperties(
    Object.fromEntries(Object.entries(attributes).filter(([key]) => !hiddenKeys.has(key))),
  );
}

function stripEmptyProperties(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value == null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );
}
