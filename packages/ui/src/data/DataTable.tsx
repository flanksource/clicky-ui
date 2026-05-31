import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TdHTMLAttributes,
} from "react";
import { useSort, type SortDir } from "../hooks/use-sort";
import { DensityValueProvider, type Density } from "../hooks/use-density";
import { useResolvedTheme, type Theme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import { Modal, type ModalSize } from "../overlay/Modal";
import {
  FilterBar,
  FilterBarFilterPanel,
  FilterBarRangePanel,
  clearFilterBarFilter,
  isFilterBarFilterActive,
  type FilterBarFilter,
  type FilterBarMultiFilterMode,
  type FilterBarNumberValue,
  type FilterBarProps,
  type FilterBarRangePreset,
  type FilterBarRangeProps,
  type FilterBarSearchProps,
} from "../components/FilterBar";
import type { MultiSelectOption } from "../components/MultiSelect";
import { Icon, type StaticIconComponent } from "./Icon";
import {
  UiClose,
  UiEllipsis,
  UiEyeClosed,
  UiFilterFilled,
  UiFilter,
  UiFullscreen,
  UiResizeVertical,
  UiCheck,
  UiDesktop,
  UiListDashes,
  UiListFlat,
  UiMoon,
  UiRows,
  UiSun,
} from "@flanksource/icons/ui";
import { SortableHeader } from "./SortableHeader";
import {
  Timestamp,
  chooseTimestampFormat,
  modeToFormat,
  parseTimestamp,
  resolveDateMath,
  type TimestampFormat,
  type TimestampOptions,
} from "./cells/Timestamp";
import {
  TagActionsProvider,
  TagList,
  normalizeTags,
  splitTagToken,
  tagActionsFromRecord,
  tagFilterTokens,
  type TagActionsContextValue,
  type TagFilterMode,
  type TagsOptions,
  type TagsValue,
} from "./cells/TagList";
import { StatusDot } from "./cells/StatusDot";
import { normalizeStatus } from "./cells/status-mapping";
import type { BadgeStatus } from "./Badge";

export type { TimestampOptions, TagsOptions };

export type DataTableColumnKind = "timestamp" | "tags" | "status";

export type StatusOptions<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** Maps the raw cell value to a badge status. Return null to fall back to text. */
  map?: (raw: unknown, row: T) => BadgeStatus | null;
  /** Show the normalized status label next to the dot. */
  showLabel?: boolean;
  /** Tooltip text for the status cell. */
  title?: (raw: unknown, row: T) => string;
};

type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

type InternalRow<T> = {
  id: string;
  row: T;
};

type GeneratedFilter<T extends Record<string, unknown>> = {
  column: DataTableColumn<T>;
  kind: "text" | "multi" | "nested-multi" | "number";
  options: MultiSelectOption[];
  groups?: Array<{
    groupKey: string;
    label?: string;
    options: MultiSelectOption[];
  }>;
  numberBounds?: {
    min: number;
    max: number;
    step: number;
  };
};

const DEFAULT_COLUMN_MIN_WIDTH = 64;
const DEFAULT_COLUMN_WIDTH = 160;
const DEFAULT_GROW_COLUMN_WIDTH = 224;
const DEFAULT_SHRINK_COLUMN_WIDTH = 96;
const COLUMN_WIDTH_STORAGE_PREFIX = "clicky-ui-data-table-column-widths";
const COLUMN_VISIBILITY_STORAGE_PREFIX =
  "clicky-ui-data-table-column-visibility";
const DENSITY_STORAGE_PREFIX = "clicky-ui-data-table-density";

const DENSITY_OPTIONS: Array<{
  value: Density;
  icon: StaticIconComponent;
  label: string;
}> = [
  { value: "compact", icon: UiRows, label: "Compact" },
  { value: "comfortable", icon: UiListFlat, label: "Comfortable" },
  { value: "spacious", icon: UiListDashes, label: "Spacious" },
];

const DATA_TABLE_HEADER_DENSITY_CLASS =
  "px-2.5 py-1.5 density-compact:px-2 density-compact:py-1 density-comfortable:px-2.5 density-comfortable:py-1.5 density-spacious:px-4 density-spacious:py-3";
const DATA_TABLE_CELL_DENSITY_CLASS =
  "px-2.5 py-1.5 density-compact:px-2 density-compact:py-0.5 density-comfortable:px-2.5 density-comfortable:py-1.5 density-spacious:px-4 density-spacious:py-3";

type ColumnMenuState = {
  x: number;
  y: number;
  columnKey?: string;
};

export type DataTableRowDetailContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  columns: DataTableColumn<T>[];
  visibleColumns: DataTableColumn<T>[];
  tagActionsByColumn: Record<string, TagActionsContextValue>;
};

// Mirrors the preset list used by the trace UI's TraceFilters so log/trace
// tables share the same vocabulary out of the box.
const TIMESTAMP_RANGE_PRESETS: FilterBarRangePreset[] = [
  { label: "Last 5 minutes", from: "now-5m", to: "now" },
  { label: "Last 15 minutes", from: "now-15m", to: "now" },
  { label: "Last 1 hour", from: "now-1h", to: "now" },
  { label: "Last 6 hours", from: "now-6h", to: "now" },
  { label: "Last 24 hours", from: "now-24h", to: "now" },
  { label: "Last 7 days", from: "now-7d", to: "now" },
  { label: "Last 30 days", from: "now-30d", to: "now" },
];

export type DataTableColumn<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** Field path or stable column id. Dotted paths read nested row values. */
  key: string;
  /** Header label. */
  label: ReactNode;
  /** Enables header click sorting for this column. */
  sortable?: boolean;
  /** Enables a generated column filter when `autoFilter` is true. */
  filterable?: boolean;
  /** Prefer allocating extra width to this column. */
  grow?: boolean;
  /** Prefer keeping this column compact. */
  shrink?: boolean;
  /** Allows users to drag the column separator. */
  resizable?: boolean;
  /** Allows the column to be toggled from the column menu. */
  hideable?: boolean;
  /** Minimum column width in pixels. */
  minWidth?: number;
  /** Maximum column width in pixels. */
  maxWidth?: number;
  /** Cell and header text alignment. */
  align?: "left" | "center" | "right";
  /** Custom cell renderer. */
  render?: (value: unknown, row: T) => ReactNode;
  /** Sort key derived from the raw value and row. */
  sortValue?: (value: unknown, row: T) => unknown;
  /** Filter token or tokens derived from the raw value and row. */
  filterValue?: (value: unknown, row: T) => FilterValue;
  /** Classes applied to cells in this column. */
  cellClassName?: string;
  /** Classes applied to the header cell. */
  headerClassName?: string;
  /**
   * Built-in cell kind. When set, DataTable supplies a default renderer,
   * a default `sortValue` and a default `filterValue` (all overridable).
   * - "timestamp": adaptive format (relative / time / short / iso) chosen
   *   from the spread of values in `data`.
   * - "tags": chip list with `+N` overflow; auto-multi-filter on tag tokens.
   * - "status": colored dot with the standard error/warning/success palette
   *   (token-mapped — "ERROR", "failed", "fatal" all collapse to "error").
   */
  kind?: DataTableColumnKind;
  timestamp?: TimestampOptions;
  tags?: TagsOptions;
  status?: StatusOptions<T>;
};

export type DataTableColumnInput<
  T extends Record<string, unknown> = Record<string, unknown>,
> = DataTableColumn<T> | string;

/**
 * Server-side pagination control surfaced as a footer strip below the table.
 * The DataTable never slices data itself; callers refetch when the page or
 * pageSize changes.
 */
export type DataTablePagination = {
  /** Current zero-indexed page. */
  page: number;
  /** Number of rows requested per page. */
  pageSize: number;
  /** Total row count if known; enables "Page X of Y". */
  total?: number;
  /** Called when the user moves to another page. */
  onPageChange: (page: number) => void;
  /** Called when the page size select changes. */
  onPageSizeChange: (pageSize: number) => void;
  /** Available page sizes. Defaults to [25, 50, 100, 200]. */
  pageSizeOptions?: number[];
};

type DataTableInnerProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** Rows to render. The table does not fetch or mutate row data. */
  data: T[];
  /**
   * Column descriptors. Pass a bare string for a default column —
   * `"foo"` is equivalent to `{ key: "foo", label: "foo" }` — handy for
   * ad-hoc query results where the column metadata is just a list of names.
   * Mix and match strings with full descriptors as needed.
   */
  columns: Array<DataTableColumnInput<T>>;
  /** Shows skeleton/loading rows instead of data rows. */
  loading?: boolean;
  /** Message shown while `loading` is true. */
  loadingMessage?: ReactNode;
  /** Number of skeleton rows to render while loading. */
  loadingRowCount?: number;
  /** Message used when there are no rows after filtering. */
  emptyMessage?: string;
  /** Classes applied to the table shell. */
  className?: string;
  /** Generate filters from filterable columns. */
  autoFilter?: boolean;
  /** Show the global search input. */
  showGlobalFilter?: boolean;
  /** Controlled global search value. */
  globalFilter?: string;
  /** Called when the global search changes. */
  onGlobalFilterChange?: (value: string) => void;
  /** Placeholder for the global search input. */
  globalFilterPlaceholder?: string;
  /** Initial sort state. */
  defaultSort?: { key: string; dir?: SortDir };
  /** Extra props forwarded to the internal FilterBar. */
  filterBarProps?: Omit<FilterBarProps, "search" | "filters">;
  /**
   * Caller-owned search input rendered in the FilterBar's search slot. Unlike
   * `globalFilter`, this does NOT filter rows client-side — it is a controlled
   * input the caller wires to a server-side query (e.g., an operation's `q`
   * parameter). Takes precedence over the built-in global filter input.
   */
  externalSearch?: FilterBarSearchProps;
  /**
   * Caller-owned time-range control rendered in the FilterBar. Like
   * `externalSearch`/`externalFilters`, it does NOT filter rows client-side —
   * the caller wires it to a server-side query (e.g. an operation's
   * `time-from`/`time-to` parameters). Takes precedence over any
   * column-derived time range.
   */
  externalTimeRange?: FilterBarRangeProps;
  /**
   * Extra filter pills supplied by the caller (e.g., operation query
   * parameters surfaced via parametersToFormConfig) that should appear in the
   * FilterBar alongside the column-derived filters. Rendered before the
   * column filters so the caller's natural ordering wins.
   */
  externalFilters?: FilterBarFilter[];
  /**
   * Server-side pagination footer. When provided, a small page-size / prev /
   * next strip is rendered below the table; the DataTable does NOT slice
   * `data` itself, callers are expected to refetch when `onPageChange` or
   * `onPageSizeChange` fires.
   */
  pagination?: DataTablePagination;
  /** Stable row id extractor. Defaults to the row index. */
  getRowId?: (row: T, index: number) => string;
  /** Called when a clickable row is selected. */
  onRowClick?: (row: T) => void;
  /** Predicate controlling whether a row is clickable. */
  isRowClickable?: (row: T) => boolean;
  /** Optional href for row link affordances. */
  getRowHref?: (row: T) => string | undefined;
  /** Detail content rendered for expanded rows or dialog details. */
  renderExpandedRow?: (
    row: T,
    context: DataTableRowDetailContext<T>,
  ) => ReactNode;
  /**
   * How `renderExpandedRow` detail is surfaced when a row is clicked.
   * - "row" (default): expands an inline detail row beneath the clicked row.
   *   Multiple rows can be open at once.
   * - "dialog": opens the detail content in a centered modal; one row at a
   *   time. The same `renderExpandedRow` (and its context) drives both styles.
   */
  detailStyle?: "row" | "dialog";
  /**
   * Title for the detail dialog (detailStyle="dialog"). Pass a function to
   * derive a per-row title, e.g. `(row) => \`Session ${row.sessionId}\``.
   */
  detailDialogTitle?: ReactNode | ((row: T) => ReactNode);
  /** Modal size for the detail dialog. Defaults to "lg". */
  detailDialogSize?: ModalSize;
  /** Enables column drag resize handles. */
  resizableColumns?: boolean;
  /** Persists column widths to localStorage. */
  persistColumnWidths?: boolean;
  /** Storage key for persisted column widths. */
  columnResizeStorageKey?: string;
  /** Enables column visibility controls. */
  hideableColumns?: boolean;
  /** Persists column visibility to localStorage. */
  persistColumnVisibility?: boolean;
  /** Storage key for persisted column visibility. */
  columnVisibilityStorageKey?: string;
  /** Controlled row density. */
  density?: Density;
  /** Initial row density for uncontrolled usage. */
  defaultDensity?: Density;
  /** Called when density changes. */
  onDensityChange?: (density: Density | undefined) => void;
  /** Persists density to localStorage. */
  persistDensity?: boolean;
  /** Storage key for persisted density. */
  densityStorageKey?: string;
  /** Shows density controls in the column menu. */
  showDensityControl?: boolean;
  /**
   * Current value of the theme menu shown in the column / preferences popover.
   * The inner DataTable does not apply this value itself — it's the menu's
   * displayed selection. The outer `DataTable` wrapper manages this state and
   * paints a wrapper-level `data-theme`.
   */
  themeMenuValue?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /** Shows theme controls in the column menu. */
  showThemeControl?: boolean;
  /** Shows per-column filter buttons in table headers. */
  showHeaderFilters?: boolean;
};

export type DataTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = Omit<DataTableInnerProps<T>, "themeMenuValue"> & {
  /**
   * Initial / controlled theme value for the column-menu Theme section.
   * When `onThemeChange` is omitted, the DataTable manages this internally
   * (seeded from `theme`) and applies `data-theme` to its root so the table
   * reflects the choice without requiring an enclosing `<ThemeProvider>`.
   */
  theme?: Theme;
  /**
   * Render a fullscreen-toggle button in the FilterBar's trailing slot
   * (just before the column-menu trigger). When clicked, the table re-renders
   * inside a full-viewport `<Modal>`. Defaults to `false`.
   */
  showFullscreenControl?: boolean;
  /** Title shown in the fullscreen modal. */
  fullscreenTitle?: ReactNode;
  /**
   * `aria-label` and `title` for the fullscreen toggle button. Defaults to
   * "Open table full screen". LogsTable overrides to "Open logs full screen".
   */
  fullscreenButtonLabel?: string;
};

function DataTableInner<T extends Record<string, unknown>>({
  data,
  columns: columnsInput,
  loading = false,
  loadingMessage = "Loading results…",
  loadingRowCount = 8,
  emptyMessage: _emptyMessage = "No data",
  className,
  autoFilter = false,
  showGlobalFilter = true,
  globalFilter,
  onGlobalFilterChange,
  globalFilterPlaceholder = "Search all columns…",
  defaultSort,
  filterBarProps,
  externalSearch,
  externalTimeRange,
  externalFilters,
  pagination,
  getRowId,
  onRowClick,
  isRowClickable,
  getRowHref,
  renderExpandedRow,
  detailStyle = "row",
  detailDialogTitle,
  detailDialogSize = "lg",
  resizableColumns = true,
  persistColumnWidths = true,
  columnResizeStorageKey,
  hideableColumns = true,
  persistColumnVisibility = true,
  columnVisibilityStorageKey,
  density,
  defaultDensity,
  onDensityChange,
  persistDensity = true,
  densityStorageKey,
  showDensityControl,
  themeMenuValue,
  onThemeChange,
  showThemeControl = false,
  showHeaderFilters = true,
}: DataTableInnerProps<T>) {
  const columns = useMemo<DataTableColumn<T>[]>(
    () =>
      columnsInput.map((column) =>
        typeof column === "string" ? { key: column, label: column } : column,
      ),
    [columnsInput],
  );
  const columnKeysSignature = useMemo(
    () => columns.map((column) => column.key).join("|"),
    [columns],
  );
  const resolvedColumnResizeStorageKey =
    columnResizeStorageKey ??
    `${COLUMN_WIDTH_STORAGE_PREFIX}:${columnKeysSignature}`;
  const resolvedColumnVisibilityStorageKey =
    columnVisibilityStorageKey ??
    `${COLUMN_VISIBILITY_STORAGE_PREFIX}:${columnKeysSignature}`;
  const resolvedDensityStorageKey =
    densityStorageKey ?? `${DENSITY_STORAGE_PREFIX}:${columnKeysSignature}`;
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () =>
      persistColumnWidths
        ? readStoredColumnWidths(resolvedColumnResizeStorageKey, columns)
        : {},
  );
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(
    () =>
      persistColumnVisibility
        ? readStoredHiddenColumns(resolvedColumnVisibilityStorageKey, columns)
        : {},
  );
  const densityControlled = density !== undefined;
  const [localDensityOverride, setLocalDensityOverride] = useState<
    Density | undefined
  >(() => {
    if (densityControlled) return density;
    if (persistDensity)
      return (
        readStoredDensityOverride(resolvedDensityStorageKey) ?? defaultDensity
      );
    return defaultDensity;
  });
  const [columnMenu, setColumnMenu] = useState<ColumnMenuState | null>(null);
  const [headerFilterMenu, setHeaderFilterMenu] =
    useState<ColumnMenuState | null>(null);
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [multiFilters, setMultiFilters] = useState<
    Record<string, Record<string, FilterBarMultiFilterMode>>
  >({});
  const [numberFilters, setNumberFilters] = useState<
    Record<string, FilterBarNumberValue>
  >({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [detailRow, setDetailRow] = useState<InternalRow<T> | null>(null);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");
  const [timeRangeFilter, setTimeRangeFilter] = useState<{
    from: string;
    to: string;
  }>(() => {
    const seed = columns.find(
      (column) => column.kind === "timestamp" && column.timestamp?.defaultRange,
    );
    return {
      from: seed?.timestamp?.defaultRange?.from ?? "",
      to: seed?.timestamp?.defaultRange?.to ?? "",
    };
  });

  useEffect(() => {
    setColumnWidths((current) => {
      const stored = persistColumnWidths
        ? readStoredColumnWidths(resolvedColumnResizeStorageKey, columns)
        : {};
      const next = pruneColumnWidths({ ...stored, ...current }, columns);
      return sameColumnWidths(current, next) ? current : next;
    });
  }, [
    columnKeysSignature,
    persistColumnWidths,
    resolvedColumnResizeStorageKey,
  ]);

  useEffect(() => {
    if (!persistColumnWidths) return;
    writeStoredColumnWidths(resolvedColumnResizeStorageKey, columnWidths);
  }, [columnWidths, persistColumnWidths, resolvedColumnResizeStorageKey]);

  useEffect(() => {
    setHiddenColumns((current) => {
      const stored = persistColumnVisibility
        ? readStoredHiddenColumns(resolvedColumnVisibilityStorageKey, columns)
        : {};
      const next = pruneHiddenColumns({ ...stored, ...current }, columns);
      return sameHiddenColumns(current, next) ? current : next;
    });
  }, [
    columnKeysSignature,
    persistColumnVisibility,
    resolvedColumnVisibilityStorageKey,
  ]);

  useEffect(() => {
    if (!persistColumnVisibility) return;
    writeStoredHiddenColumns(resolvedColumnVisibilityStorageKey, hiddenColumns);
  }, [
    hiddenColumns,
    persistColumnVisibility,
    resolvedColumnVisibilityStorageKey,
  ]);

  useEffect(() => {
    if (densityControlled) return;
    setLocalDensityOverride(
      persistDensity
        ? (readStoredDensityOverride(resolvedDensityStorageKey) ??
            defaultDensity)
        : defaultDensity,
    );
  }, [
    defaultDensity,
    densityControlled,
    persistDensity,
    resolvedDensityStorageKey,
  ]);

  useEffect(() => {
    if (densityControlled || !persistDensity) return;
    writeStoredDensityOverride(resolvedDensityStorageKey, localDensityOverride);
  }, [
    densityControlled,
    localDensityOverride,
    persistDensity,
    resolvedDensityStorageKey,
  ]);

  useEffect(() => {
    if (!columnMenu && !headerFilterMenu) return;

    const close = () => {
      setColumnMenu(null);
      setHeaderFilterMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("click", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [columnMenu, headerFilterMenu]);

  const rows = useMemo<InternalRow<T>[]>(
    () =>
      data.map((row, index) => ({
        id: getRowId?.(row, index) ?? String(index),
        row,
      })),
    [data, getRowId],
  );

  const timestampFormats = useMemo<Record<string, TimestampFormat>>(() => {
    const out: Record<string, TimestampFormat> = {};
    for (const column of columns) {
      if (column.kind !== "timestamp") continue;
      const dates: Date[] = [];
      for (const row of data) {
        const raw = resolvePath(row, column.key);
        const parsed = parseTimestamp(raw);
        if (parsed) dates.push(parsed);
      }
      const dataFormat = chooseTimestampFormat(dates);
      out[column.key] = modeToFormat(
        column.timestamp?.mode ?? "auto",
        dataFormat,
      );
    }
    return out;
  }, [columns, data]);

  const effectiveColumns = useMemo<DataTableColumn<T>[]>(
    () =>
      columns.map((column) =>
        applyKindDefaults<T>(column, timestampFormats[column.key]),
      ),
    [columns, timestampFormats],
  );

  const visibleColumns = useMemo(() => {
    if (!hideableColumns) return effectiveColumns;
    const next = effectiveColumns.filter(
      (column) => !hiddenColumns[column.key],
    );
    return next.length > 0 ? next : effectiveColumns;
  }, [effectiveColumns, hiddenColumns, hideableColumns]);

  const hideableColumnCount = useMemo(
    () => effectiveColumns.filter(isColumnHideable).length,
    [effectiveColumns],
  );

  const visibleHideableColumnCount = useMemo(
    () => visibleColumns.filter(isColumnHideable).length,
    [visibleColumns],
  );

  const showColumnVisibilityControl =
    hideableColumns && hideableColumnCount > 1;
  const resolvedShowDensityControl =
    showDensityControl ?? showColumnVisibilityControl;
  const showTablePreferencesControl =
    showColumnVisibilityControl ||
    resolvedShowDensityControl ||
    showThemeControl;
  const densityOverride = densityControlled ? density : localDensityOverride;

  // For each kind:"tags" column, expose a TagActions value backed by this
  // table's multiFilters slot. The + / − icons inside each tag mutate the
  // same Record<token, mode> shape that the filter-bar dropdown uses, so
  // the existing filter pipeline picks up the change without changes.
  const tagActionsByColumn = useMemo(() => {
    const out: Record<string, TagActionsContextValue> = {};
    for (const column of visibleColumns) {
      if (column.kind !== "tags") continue;
      const columnKey = column.key;
      const current = (multiFilters[columnKey] ?? {}) as Record<
        string,
        TagFilterMode
      >;
      const handler = (next: Record<string, TagFilterMode>) =>
        setMultiFilters((state) => updateFilterRecord(state, columnKey, next));
      out[columnKey] = tagActionsFromRecord(current, handler);
    }
    return out;
  }, [multiFilters, visibleColumns]);

  // The first kind:"timestamp" column (with autoRangeFilter not disabled) gets
  // the auto-mounted FilterBar time-range picker. The user can override by
  // supplying their own filterBarProps.timeRange.
  const timeRangeColumn = useMemo(() => {
    if (filterBarProps?.timeRange) return null;
    return (
      visibleColumns.find(
        (column) =>
          column.kind === "timestamp" &&
          column.filterable !== false &&
          column.timestamp?.autoRangeFilter !== false,
      ) ?? null
    );
  }, [filterBarProps?.timeRange, visibleColumns]);

  const filterableColumns = useMemo(
    () =>
      visibleColumns.filter((column) => {
        if (column.filterable === false) return false;
        // Timestamp columns are filtered through the time-range picker, not
        // a per-column text/multi filter. Skip them in auto-filter generation.
        if (column.kind === "timestamp") return false;
        return true;
      }),
    [visibleColumns],
  );

  const generatedFilters = useMemo<GeneratedFilter<T>[]>(() => {
    if (!autoFilter || loading) return [];

    return filterableColumns.map((column) => {
      const numberBounds = getNumericFilterBounds(rows, column);
      if (numberBounds) {
        return {
          column,
          kind: "number" as const,
          options: [],
          numberBounds,
        };
      }

      const values = new Set<string>();

      for (const record of rows) {
        for (const token of getFilterTokens(record.row, column)) {
          if (token) values.add(token);
        }
      }

      const options = Array.from(values)
        .sort((left, right) =>
          left.localeCompare(right, undefined, { numeric: true }),
        )
        .map((value) => ({ value, label: value }));

      // Tag columns naturally have higher cardinality (e.g. infra labels);
      // we let the multi-filter scale to 50 distinct values before falling
      // back to free-text search.
      const multiCap = column.kind === "tags" ? 50 : 20;

      const fitsMulti = options.length >= 2 && options.length <= multiCap;

      // For tag columns we group tokens by their key so the filter renders
      // as a two-level submenu (env → prod/staging, tier → edge/core, …).
      // Falls back to a flat multi when there's only one key (or none).
      if (column.kind === "tags" && fitsMulti) {
        const separator = column.tags?.separator ?? "=";
        const groups = groupTagOptions(options, separator);
        if (groups.length >= 2) {
          return {
            column,
            kind: "nested-multi" as const,
            options,
            groups,
          };
        }
      }

      return {
        column,
        kind: fitsMulti ? "multi" : "text",
        options,
      };
    });
  }, [autoFilter, filterableColumns, loading, rows]);

  useEffect(() => {
    setTextFilters((current) =>
      pruneTextFilterState(current, generatedFilters),
    );
    setMultiFilters((current) =>
      pruneMultiFilterState(current, generatedFilters),
    );
    setNumberFilters((current) =>
      pruneNumberFilterState(current, generatedFilters),
    );
  }, [generatedFilters]);

  const globalFilterControlled = globalFilter !== undefined;
  const effectiveGlobalFilter = globalFilterControlled
    ? globalFilter
    : localGlobalFilter;
  const setEffectiveGlobalFilter = globalFilterControlled
    ? (onGlobalFilterChange ?? (() => {}))
    : setLocalGlobalFilter;
  const nativeFilters = useMemo<FilterBarFilter[]>(
    () =>
      generatedFilters.map((filter): FilterBarFilter => {
        const columnKey = filter.column.key;
        if (filter.kind === "multi") {
          return {
            key: columnKey,
            kind: "multi",
            label: labelText(filter.column),
            value: multiFilters[columnKey] ?? {},
            onChange: (next) =>
              setMultiFilters((current) =>
                updateFilterRecord(current, columnKey, next),
              ),
            options: filter.options,
          };
        }
        if (filter.kind === "nested-multi") {
          return {
            key: columnKey,
            kind: "nested-multi",
            label: labelText(filter.column),
            value: multiFilters[columnKey] ?? {},
            onChange: (next) =>
              setMultiFilters((current) =>
                updateFilterRecord(current, columnKey, next),
              ),
            groups: filter.groups ?? [],
          };
        }
        if (filter.kind === "number") {
          const numberFilter: Extract<FilterBarFilter, { kind: "number" }> = {
            key: columnKey,
            kind: "number",
            label: labelText(filter.column),
            value: numberFilters[columnKey] ?? {},
            onChange: (next: FilterBarNumberValue) =>
              setNumberFilters((current) =>
                updateNumberFilterValue(current, columnKey, next),
              ),
          };
          if (filter.numberBounds?.min !== undefined) {
            numberFilter.domainMin = filter.numberBounds.min;
          }
          if (filter.numberBounds?.max !== undefined) {
            numberFilter.domainMax = filter.numberBounds.max;
          }
          if (filter.numberBounds?.step !== undefined) {
            numberFilter.step = filter.numberBounds.step;
          }
          return numberFilter;
        }
        return {
          key: columnKey,
          kind: "text",
          label: labelText(filter.column),
          value: textFilters[columnKey] ?? "",
          onChange: (next: string) =>
            setTextFilters((current) =>
              updateFilterValue(current, columnKey, next),
            ),
        };
      }),
    [generatedFilters, multiFilters, numberFilters, textFilters],
  );
  const nativeFilterByColumn = useMemo(
    () => new Map(nativeFilters.map((filter) => [filter.key, filter])),
    [nativeFilters],
  );
  const hasCustomFilterBarContent = Boolean(
    filterBarProps?.leading ||
    filterBarProps?.children ||
    filterBarProps?.trailing ||
    filterBarProps?.timeRange ||
    filterBarProps?.dateRange,
  );
  const autoTimeRange = useMemo<FilterBarRangeProps | null>(() => {
    if (!autoFilter || !timeRangeColumn) return null;
    const next: FilterBarRangeProps = {
      from: timeRangeFilter.from,
      to: timeRangeFilter.to,
      onApply: (from, to) => setTimeRangeFilter({ from, to }),
      presets:
        timeRangeColumn.timestamp?.rangePresets ?? TIMESTAMP_RANGE_PRESETS,
      fromPlaceholder: "now-24h",
      toPlaceholder: "now",
      emptyLabel: "Any time",
    };
    if (timeRangeColumn.timestamp?.timeEnabled !== undefined) {
      next.timeEnabled = timeRangeColumn.timestamp.timeEnabled;
    }
    if (timeRangeColumn.timestamp?.timeZone) {
      next.timeZone = timeRangeColumn.timestamp.timeZone;
    }
    if (timeRangeColumn.timestamp?.timeZones) {
      next.timeZones = timeRangeColumn.timestamp.timeZones;
    }
    return next;
  }, [autoFilter, timeRangeColumn, timeRangeFilter.from, timeRangeFilter.to]);
  const showFilterBar =
    (autoFilter &&
      (showGlobalFilter || nativeFilters.length > 0 || !!autoTimeRange)) ||
    !!externalSearch ||
    !!externalTimeRange ||
    (externalFilters && externalFilters.length > 0) ||
    hasCustomFilterBarContent ||
    showTablePreferencesControl;
  const setDensityOverride = (next: Density | undefined) => {
    if (!densityControlled) setLocalDensityOverride(next);
    onDensityChange?.(next);
  };
  const filterBarTrailing = showTablePreferencesControl ? (
    <>
      {filterBarProps?.trailing}
      <ColumnVisibilityTrigger
        onOpen={(event) => setColumnMenu(menuStateFromTrigger(event))}
      />
    </>
  ) : (
    filterBarProps?.trailing
  );
  const showHeaderFilterControls = autoFilter && showHeaderFilters;

  const filteredRows = useMemo(() => {
    const globalNeedle = effectiveGlobalFilter.trim().toLowerCase();
    const now = new Date();
    const rangeFromDate = timeRangeColumn
      ? resolveDateMath(timeRangeFilter.from, now)
      : null;
    const rangeToDate = timeRangeColumn
      ? resolveDateMath(timeRangeFilter.to, now)
      : null;
    const rangeColumnKey = timeRangeColumn?.key;

    return rows.filter(({ row }) => {
      if (rangeColumnKey && (rangeFromDate || rangeToDate)) {
        const raw = resolvePath(row, rangeColumnKey);
        const ts = parseTimestamp(raw);
        if (!ts) return false;
        if (rangeFromDate && ts.getTime() < rangeFromDate.getTime())
          return false;
        if (rangeToDate && ts.getTime() > rangeToDate.getTime()) return false;
      }

      if (globalNeedle) {
        const haystack = filterableColumns
          .flatMap((column) => getFilterTokens(row, column))
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(globalNeedle)) {
          return false;
        }
      }

      for (const filter of generatedFilters) {
        const tokens = getFilterTokens(row, filter.column);

        if (filter.kind === "text") {
          const needle = (textFilters[filter.column.key] ?? "")
            .trim()
            .toLowerCase();
          if (
            needle &&
            !tokens.some((token) => token.toLowerCase().includes(needle))
          ) {
            return false;
          }
        } else if (filter.kind === "number") {
          const range = numberFilters[filter.column.key] ?? {};
          const min = parseNumberInput(range.min);
          const max = parseNumberInput(range.max);
          const hasMin = String(range.min ?? "").trim() !== "";
          const hasMax = String(range.max ?? "").trim() !== "";

          if (hasMin || hasMax) {
            const values = getFilterNumbers(row, filter.column);
            const matches = values.some(
              (value) =>
                (min == null || value >= min) && (max == null || value <= max),
            );

            if (!matches) {
              return false;
            }
          }
        } else {
          const selected = multiFilters[filter.column.key] ?? {};
          const include = Object.entries(selected)
            .filter(([, mode]) => mode === "include")
            .map(([value]) => value);
          const exclude = Object.entries(selected)
            .filter(([, mode]) => mode === "exclude")
            .map(([value]) => value);

          if (
            include.length > 0 &&
            !tokens.some((token) => include.includes(token))
          ) {
            return false;
          }

          if (
            exclude.length > 0 &&
            tokens.some((token) => exclude.includes(token))
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    effectiveGlobalFilter,
    filterableColumns,
    generatedFilters,
    multiFilters,
    numberFilters,
    rows,
    textFilters,
    timeRangeColumn,
    timeRangeFilter.from,
    timeRangeFilter.to,
  ]);

  const sortResolvers = useMemo(
    () =>
      Object.fromEntries(
        effectiveColumns.map((column) => [
          column.key,
          (record: InternalRow<T>) => getSortValue(record.row, column),
        ]),
      ) as Record<string, (record: InternalRow<T>) => unknown>,
    [effectiveColumns],
  );

  const { sorted, sort, toggle } = useSort(filteredRows, {
    defaultDir: defaultSort?.dir ?? "asc",
    resolvers: sortResolvers,
    ...(defaultSort?.key ? { defaultKey: defaultSort.key } : {}),
  });

  const startColumnResize = (
    event: ReactMouseEvent<HTMLElement>,
    column: DataTableColumn<T>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const header = event.currentTarget.closest("th");
    const measuredWidth = header?.getBoundingClientRect().width ?? 0;
    const startWidth =
      measuredWidth || columnWidths[column.key] || defaultColumnWidth(column);

    const onMove = (moveEvent: MouseEvent) => {
      const nextWidth = clampColumnWidth(
        column,
        startWidth + moveEvent.clientX - startX,
      );
      setColumnWidths((current) => ({
        ...current,
        [column.key]: nextWidth,
      }));
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const autoFitColumn = (
    event: ReactMouseEvent<HTMLElement>,
    column: DataTableColumn<T>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const header = event.currentTarget.closest("th");
    const table = event.currentTarget.closest("table");
    if (!header || !table) return;

    const columnIndex = Array.from(
      header.parentElement?.children ?? [],
    ).indexOf(header);
    if (columnIndex < 0) return;

    const width = measureColumnContentWidth(table, columnIndex, column);
    setColumnWidths((current) => ({
      ...current,
      [column.key]: width,
    }));
  };

  const toggleColumnVisibility = (column: DataTableColumn<T>) => {
    if (!isColumnHideable(column)) return;

    setHiddenColumns((current) => {
      const hidden = current[column.key] === true;
      if (!hidden && visibleHideableColumnCount <= 1) return current;

      const next = { ...current };
      if (hidden) {
        delete next[column.key];
      } else {
        next[column.key] = true;
      }

      return pruneHiddenColumns(next, columns);
    });
  };

  const showAllColumns = () => setHiddenColumns({});

  const openHeaderColumnMenu = (
    event: ReactMouseEvent<HTMLTableCellElement>,
    column: DataTableColumn<T>,
  ) => {
    if (!showColumnVisibilityControl) return;
    event.preventDefault();
    setColumnMenu(menuStateFromPointer(event, column.key));
  };

  const openHeaderFilterMenu = (
    event: ReactMouseEvent<HTMLElement>,
    columnKey: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setHeaderFilterMenu(menuStateFromTrigger(event, columnKey));
  };

  return (
    <DensityValueProvider density={densityOverride ?? "comfortable"}>
      <div
        className={cn("flex min-h-0 flex-col gap-3", className)}
        data-density={densityOverride}
      >
        {showFilterBar && (
          <FilterBar
            {...filterBarProps}
            {...(externalSearch
              ? { search: externalSearch }
              : autoFilter && showGlobalFilter
                ? {
                    search: {
                      value: effectiveGlobalFilter,
                      onChange: setEffectiveGlobalFilter,
                      placeholder: globalFilterPlaceholder,
                    },
                  }
                : {})}
            {...(externalTimeRange
              ? { timeRange: externalTimeRange }
              : autoTimeRange
                ? { timeRange: autoTimeRange }
                : {})}
            trailing={filterBarTrailing}
            filters={
              externalFilters && externalFilters.length > 0
                ? [...externalFilters, ...nativeFilters]
                : nativeFilters
            }
          />
        )}

        <div
          className="min-h-0 flex-1 overflow-auto rounded-md border border-border"
          aria-busy={loading || undefined}
        >
          <table className="w-max table-auto text-left text-sm">
            <colgroup>
              {visibleColumns.map((column) => (
                <col
                  key={column.key}
                  style={columnStyle(column, columnWidths)}
                  className={column.shrink && !column.grow ? "w-px" : undefined}
                />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-muted shadow-[0_1px_0_0_var(--tw-shadow-color)] shadow-border">
              <tr className="border-b border-border text-xs text-muted-foreground">
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "group/header relative whitespace-nowrap font-medium",
                      DATA_TABLE_HEADER_DENSITY_CLASS,
                      alignmentClass(column.align),
                      resizableColumns &&
                        column.resizable !== false &&
                        "select-none",
                      column.headerClassName,
                    )}
                    onContextMenu={(event) =>
                      openHeaderColumnMenu(event, column)
                    }
                  >
                    <div
                      className={cn(
                        "flex min-w-0 items-center gap-1",
                        headerAlignmentClass(column.align),
                        resizableColumns &&
                          column.resizable !== false &&
                          "pr-2",
                      )}
                    >
                      <span className="min-w-0">
                        {column.sortable === false ? (
                          <span>{column.label}</span>
                        ) : (
                          <SortableHeader
                            active={sort?.key === column.key}
                            {...(sort?.key === column.key
                              ? { dir: sort.dir }
                              : {})}
                            {...(column.align ? { align: column.align } : {})}
                            onClick={() => toggle(column.key)}
                          >
                            {column.label}
                          </SortableHeader>
                        )}
                      </span>
                      {showHeaderFilterControls &&
                        (nativeFilterByColumn.has(column.key) ||
                          (autoTimeRange &&
                            timeRangeColumn?.key === column.key)) && (
                          <HeaderFilterButton
                            column={column}
                            active={
                              nativeFilterByColumn.has(column.key)
                                ? isFilterBarFilterActive(
                                    nativeFilterByColumn.get(column.key)!,
                                  )
                                : Boolean(
                                    timeRangeFilter.from || timeRangeFilter.to,
                                  )
                            }
                            onOpen={(event) =>
                              openHeaderFilterMenu(event, column.key)
                            }
                          />
                        )}
                    </div>
                    {resizableColumns && column.resizable !== false && (
                      <span
                        role="separator"
                        aria-label={`Resize ${labelText(column)} column`}
                        aria-orientation="vertical"
                        className="absolute right-0 top-0 flex h-full w-3 cursor-col-resize touch-none items-center justify-center border-r border-border/70 bg-gradient-to-l from-border/30 to-transparent transition-colors hover:border-primary hover:from-primary/20"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onDoubleClick={(event) => autoFitColumn(event, column)}
                        onMouseDown={(event) =>
                          startColumnResize(event, column)
                        }
                      >
                        <span
                          aria-hidden
                          className="h-4 w-0.5 rounded-full bg-border transition-colors group-hover/header:bg-primary/70"
                        />
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <DataTableLoadingRows
                  columns={visibleColumns}
                  rowCount={loadingRowCount}
                  message={loadingMessage}
                />
              ) : (
                sorted.map((record) => {
                  const href = getRowHref?.(record.row);
                  const expanded = expandedRows[record.id] ?? false;
                  const expandedContent =
                    renderExpandedRow?.(record.row, {
                      columns: effectiveColumns,
                      visibleColumns,
                      tagActionsByColumn,
                    }) ?? null;
                  const expandable = expandedContent !== null;
                  const expandsInline = expandable && detailStyle === "row";
                  const opensDialog = expandable && detailStyle === "dialog";
                  const rowClickEnabled =
                    isRowClickable?.(record.row) ?? !!onRowClick;
                  const clickable = !!href || rowClickEnabled || expandable;

                  return (
                    <Fragment key={record.id}>
                      <tr
                        className={cn(
                          "border-b border-border/60 align-top",
                          clickable && "cursor-pointer hover:bg-accent/40",
                        )}
                        onClick={() => {
                          if (expandsInline) {
                            setExpandedRows((current) => ({
                              ...current,
                              [record.id]: !current[record.id],
                            }));
                          }
                          if (opensDialog) {
                            setDetailRow(record);
                          }
                          if (rowClickEnabled) {
                            onRowClick?.(record.row);
                          }
                        }}
                      >
                        {visibleColumns.map((column, index) => {
                          const rawValue = resolvePath(record.row, column.key);
                          let content: ReactNode = column.render
                            ? column.render(rawValue, record.row)
                            : formatCell(rawValue);

                          // Tag cells get the + / − filter affordance via
                          // context; copy-to-clipboard works without it too.
                          if (
                            column.kind === "tags" &&
                            tagActionsByColumn[column.key]
                          ) {
                            content = (
                              <TagActionsProvider
                                value={tagActionsByColumn[column.key]!}
                              >
                                {content}
                              </TagActionsProvider>
                            );
                          }

                          return (
                            <td
                              key={column.key}
                              className={cn(
                                DATA_TABLE_CELL_DENSITY_CLASS,
                                alignmentClass(column.align),
                                column.cellClassName,
                              )}
                            >
                              <CellContent
                                column={column}
                                {...(columnWidths[column.key] !== undefined
                                  ? { width: columnWidths[column.key] }
                                  : {})}
                              >
                                {href && index === 0 ? (
                                  <a href={href} className="hover:underline">
                                    {content}
                                  </a>
                                ) : (
                                  content
                                )}
                              </CellContent>
                            </td>
                          );
                        })}
                      </tr>
                      {expandsInline && expanded && expandedContent && (
                        <tr>
                          <td
                            colSpan={visibleColumns.length}
                            className="bg-muted/40 p-density-3"
                          >
                            <div className="rounded-md border border-border bg-background p-density-3">
                              {expandedContent}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-1 text-xs text-muted-foreground">
          {loading
            ? loadingMessage
            : `${sorted.length} of ${data.length} row${data.length === 1 ? "" : "s"}`}
        </div>
        {pagination && <DataTablePaginationFooter pagination={pagination} />}
        {detailStyle === "dialog" && renderExpandedRow && (
          <Modal
            open={detailRow !== null}
            onClose={() => setDetailRow(null)}
            size={detailDialogSize}
            {...(detailRow
              ? {
                  title:
                    typeof detailDialogTitle === "function"
                      ? detailDialogTitle(detailRow.row)
                      : detailDialogTitle,
                }
              : {})}
          >
            {detailRow
              ? renderExpandedRow(detailRow.row, {
                  columns: effectiveColumns,
                  visibleColumns,
                  tagActionsByColumn,
                })
              : null}
          </Modal>
        )}
        {columnMenu && showTablePreferencesControl && (
          <ColumnVisibilityMenu
            columns={effectiveColumns}
            hiddenColumns={hiddenColumns}
            anchor={columnMenu}
            showColumnVisibilityControl={showColumnVisibilityControl}
            showDensityControl={resolvedShowDensityControl}
            showThemeControl={showThemeControl}
            themeMenuValue={themeMenuValue}
            densityOverride={densityOverride}
            visibleHideableColumnCount={visibleHideableColumnCount}
            onToggle={toggleColumnVisibility}
            onShowAll={showAllColumns}
            onDensityChange={setDensityOverride}
            {...(onThemeChange ? { onThemeChange } : {})}
            onClose={() => setColumnMenu(null)}
          />
        )}
        {headerFilterMenu && (
          <HeaderFilterMenu
            filter={nativeFilterByColumn.get(headerFilterMenu.columnKey ?? "")}
            {...(autoTimeRange &&
            timeRangeColumn?.key === headerFilterMenu.columnKey
              ? { timeRange: autoTimeRange }
              : {})}
            anchor={headerFilterMenu}
            onClose={() => setHeaderFilterMenu(null)}
          />
        )}
      </div>
    </DensityValueProvider>
  );
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

// DataTablePaginationFooter renders a small page-size selector and prev/next
// controls below the table. Pure presentation: every interaction routes
// straight to the caller-supplied callbacks so the data layer (which lives in
// CommandOutput / OperationCommandPage) stays the source of truth for which
// rows are visible.
function DataTablePaginationFooter({
  pagination,
}: {
  pagination: DataTablePagination;
}) {
  const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination;
  const options = pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const safePage = Math.max(0, page);
  const totalPages =
    total != null && pageSize > 0
      ? Math.max(1, Math.ceil(total / pageSize))
      : undefined;
  const atFirst = safePage === 0;
  const atLast = totalPages != null ? safePage >= totalPages - 1 : false;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
      <label className="flex items-center gap-1">
        <span>Rows per page</span>
        <select
          className="rounded border border-border bg-background px-1 py-0.5 text-foreground"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-border px-2 py-0.5 disabled:opacity-50"
          disabled={atFirst}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
        >
          Prev
        </button>
        <span>
          Page {safePage + 1}
          {totalPages != null ? ` of ${totalPages}` : ""}
        </span>
        <button
          type="button"
          className="rounded border border-border px-2 py-0.5 disabled:opacity-50"
          disabled={atLast}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function DataTableLoadingRows<T extends Record<string, unknown>>({
  columns,
  rowCount,
  message,
}: {
  columns: DataTableColumn<T>[];
  rowCount: number;
  message: ReactNode;
}) {
  const safeRowCount = Math.max(1, rowCount);
  const safeColumnCount = Math.max(1, columns.length);

  return (
    <>
      <tr className="border-b border-border/60 bg-muted/20">
        <td
          colSpan={safeColumnCount}
          className={cn(DATA_TABLE_CELL_DENSITY_CLASS, "p-0")}
        >
          <div className="h-0.5 w-full overflow-hidden bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/70" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <span
              aria-hidden
              className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
            />
            <span>{message}</span>
          </div>
        </td>
      </tr>
      {Array.from({ length: safeRowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border/60">
          {columns.map((column, columnIndex) => (
            <td
              key={column.key}
              className={cn(
                DATA_TABLE_CELL_DENSITY_CLASS,
                alignmentClass(column.align),
                column.cellClassName,
              )}
            >
              <CellContent column={column}>
                <span
                  aria-hidden
                  className={cn(
                    "block h-3 animate-pulse rounded-full bg-muted",
                    loadingSkeletonWidth(columnIndex),
                  )}
                />
              </CellContent>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function HeaderFilterButton<T extends Record<string, unknown>>({
  column,
  active,
  onOpen,
}: {
  column: DataTableColumn<T>;
  active: boolean;
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Open ${labelText(column)} column filter`}
      aria-haspopup="dialog"
      aria-pressed={active}
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-accent text-foreground",
      )}
      onClick={onOpen}
    >
      <span
        data-filter-icon-state={active ? "filled" : "outline"}
        className="inline-flex"
      >
        <Icon icon={active ? UiFilterFilled : UiFilter} className="text-xs" />
      </span>
    </button>
  );
}

function HeaderFilterMenu({
  filter,
  timeRange,
  anchor,
  onClose,
}: {
  filter: FilterBarFilter | undefined;
  timeRange?: FilterBarRangeProps;
  anchor: ColumnMenuState;
  onClose: () => void;
}) {
  if (!filter && !timeRange) return null;

  const label = filter?.label ?? "Time range";
  const timeRangeActive = Boolean(timeRange?.from || timeRange?.to);

  return (
    <div
      role="dialog"
      aria-label={`${label} column filter`}
      className="fixed z-50 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-lg shadow-black/5"
      style={{ left: anchor.x, top: anchor.y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="flex items-center gap-1">
          {filter && (
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-xs text-primary transition-colors hover:bg-accent focus:bg-accent focus:outline-none disabled:text-muted-foreground"
              onClick={() => clearFilterBarFilter(filter)}
              disabled={!isFilterBarFilterActive(filter)}
            >
              Clear all
            </button>
          )}
          {timeRange && (
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-xs text-primary transition-colors hover:bg-accent focus:bg-accent focus:outline-none disabled:text-muted-foreground"
              onClick={() => timeRange.onApply("", "")}
              disabled={!timeRangeActive}
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            aria-label="Close column filter"
            title="Close"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none"
            onClick={onClose}
          >
            <Icon icon={UiClose} className="text-sm" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {filter && <FilterBarFilterPanel filter={filter} chrome="embedded" />}
        {timeRange && (
          <FilterBarRangePanel kind="time" label="Time range" {...timeRange} />
        )}
      </div>
    </div>
  );
}

function ColumnVisibilityTrigger({
  onOpen,
}: {
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label="Open column menu"
      aria-haspopup="menu"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(event);
      }}
    >
      <Icon icon={UiEllipsis} className="text-sm" />
    </button>
  );
}

function ColumnVisibilityMenu<T extends Record<string, unknown>>({
  columns,
  hiddenColumns,
  anchor,
  showColumnVisibilityControl,
  showDensityControl,
  showThemeControl,
  themeMenuValue,
  densityOverride,
  visibleHideableColumnCount,
  onToggle,
  onShowAll,
  onDensityChange,
  onThemeChange,
  onClose,
}: {
  columns: DataTableColumn<T>[];
  hiddenColumns: Record<string, boolean>;
  anchor: ColumnMenuState;
  showColumnVisibilityControl: boolean;
  showDensityControl: boolean;
  showThemeControl: boolean;
  themeMenuValue: Theme | undefined;
  densityOverride: Density | undefined;
  visibleHideableColumnCount: number;
  onToggle: (column: DataTableColumn<T>) => void;
  onShowAll: () => void;
  onDensityChange: (density: Density | undefined) => void;
  onThemeChange?: (theme: Theme) => void;
  onClose: () => void;
}) {
  const activeColumn = anchor.columnKey
    ? columns.find((column) => column.key === anchor.columnKey)
    : undefined;
  const canHideActiveColumn =
    activeColumn &&
    isColumnHideable(activeColumn) &&
    visibleHideableColumnCount > 1;

  return (
    <div
      role="menu"
      aria-label="Column menu"
      className="fixed z-50 min-w-[16rem] rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/5"
      style={{ left: anchor.x, top: anchor.y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {showColumnVisibilityControl && (
        <>
          <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <span>Columns</span>
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none"
              onClick={onShowAll}
            >
              Show all
            </button>
          </div>

          {activeColumn && (
            <>
              <button
                type="button"
                role="menuitem"
                disabled={!canHideActiveColumn}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
                  !canHideActiveColumn && "cursor-not-allowed opacity-50",
                )}
                onClick={() => {
                  if (!canHideActiveColumn) return;
                  onToggle(activeColumn);
                  onClose();
                }}
              >
                <Icon
                  icon={UiEyeClosed}
                  className="text-sm text-muted-foreground"
                />
                <span>Hide {labelText(activeColumn)}</span>
              </button>
              <div className="my-1 h-px bg-border" />
            </>
          )}

          <div className="max-h-72 overflow-auto">
            {columns.map((column) => {
              const hideable = isColumnHideable(column);
              const visible = hiddenColumns[column.key] !== true;
              const disabled =
                !hideable || (visible && visibleHideableColumnCount <= 1);
              return (
                <label
                  key={column.key}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={visible}
                    disabled={disabled}
                    onChange={() => onToggle(column)}
                  />
                  <span className="truncate">{labelText(column)}</span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {showDensityControl && (
        <DensityMenuSection
          densityOverride={densityOverride}
          separated={showColumnVisibilityControl}
          onDensityChange={onDensityChange}
        />
      )}

      {showThemeControl && onThemeChange && (
        <ThemeMenuSection
          value={themeMenuValue ?? "system"}
          separated={showColumnVisibilityControl || showDensityControl}
          onChange={onThemeChange}
        />
      )}
    </div>
  );
}

function DensityMenuSection({
  densityOverride,
  separated,
  onDensityChange,
}: {
  densityOverride: Density | undefined;
  separated: boolean;
  onDensityChange: (density: Density | undefined) => void;
}) {
  const current = densityOverride ?? "inherit";

  return (
    <div className={cn(separated && "mt-1 border-t border-border pt-1")}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Density
      </div>
      <button
        type="button"
        role="menuitemradio"
        aria-checked={current === "inherit"}
        className={densityMenuItemClassName(current === "inherit")}
        onClick={() => onDensityChange(undefined)}
      >
        <Icon
          icon={UiResizeVertical}
          className="text-sm text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate">Use page density</span>
        {current === "inherit" ? (
          <Icon icon={UiCheck} className="text-sm text-foreground" />
        ) : (
          <span className="inline-block h-4 w-4" aria-hidden />
        )}
      </button>
      {DENSITY_OPTIONS.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={densityMenuItemClassName(active)}
            onClick={() => onDensityChange(option.value)}
          >
            <Icon
              icon={option.icon}
              className="text-sm text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {active ? (
              <Icon icon={UiCheck} className="text-sm text-foreground" />
            ) : (
              <span className="inline-block h-4 w-4" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}

function densityMenuItemClassName(active: boolean) {
  return cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
    active && "text-foreground",
  );
}

const THEME_MENU_OPTIONS: Array<{
  value: Theme;
  icon: StaticIconComponent;
  label: string;
}> = [
  { value: "system", icon: UiDesktop, label: "Use system theme" },
  { value: "light", icon: UiSun, label: "Light" },
  { value: "dark", icon: UiMoon, label: "Dark" },
];

function ThemeMenuSection({
  value,
  separated,
  onChange,
}: {
  value: Theme;
  separated: boolean;
  onChange: (theme: Theme) => void;
}) {
  return (
    <div className={cn(separated && "mt-1 border-t border-border pt-1")}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Theme
      </div>
      {THEME_MENU_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={densityMenuItemClassName(active)}
            onClick={() => onChange(option.value)}
          >
            <Icon
              icon={option.icon}
              className="text-sm text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {active ? (
              <Icon icon={UiCheck} className="text-sm text-foreground" />
            ) : (
              <span className="inline-block h-4 w-4" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CellContent<T extends Record<string, unknown>>({
  column,
  width,
  children,
}: {
  column: DataTableColumn<T>;
  width?: number;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        cellContentClassName(column, width),
        alignmentClass(column.align),
      )}
      style={cellContentStyle(width)}
    >
      {children}
    </div>
  );
}

function getSortValue<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  const rawValue = resolvePath(row, column.key);
  return column.sortValue ? column.sortValue(rawValue, row) : rawValue;
}

function getFilterCandidate<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  const rawValue = resolvePath(row, column.key);
  return column.filterValue ? column.filterValue(rawValue, row) : rawValue;
}

function getFilterTokens<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  return normalizeTokens(getFilterCandidate(row, column));
}

function getFilterNumbers<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  return normalizeNumbers(getFilterCandidate(row, column));
}

function normalizeTokens(value: FilterValue | unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeTokens(item)).filter(Boolean);
  }

  if (value == null) return [];
  if (typeof value === "object") return [JSON.stringify(value)];

  const token = String(value).trim();
  return token ? [token] : [];
}

function normalizeNumbers(value: FilterValue | unknown): number[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeNumbers(item));
  }

  const parsed = parseNumberInput(value);
  return parsed == null ? [] : [parsed];
}

function updateFilterValue(
  state: Record<string, string>,
  key: string,
  nextValue: string,
) {
  const next = { ...state };

  if (nextValue.trim()) {
    next[key] = nextValue;
  } else {
    delete next[key];
  }

  return next;
}

function updateFilterRecord(
  state: Record<string, Record<string, FilterBarMultiFilterMode>>,
  key: string,
  nextValue: Record<string, FilterBarMultiFilterMode>,
) {
  const next = { ...state };

  if (Object.keys(nextValue).length > 0) {
    next[key] = nextValue;
  } else {
    delete next[key];
  }

  return next;
}

function updateNumberFilterValue(
  state: Record<string, FilterBarNumberValue>,
  key: string,
  nextValue: FilterBarNumberValue,
) {
  const next = { ...state };
  const hasMin = String(nextValue.min ?? "").trim() !== "";
  const hasMax = String(nextValue.max ?? "").trim() !== "";

  if (hasMin || hasMax) {
    next[key] = nextValue;
  } else {
    delete next[key];
  }

  return next;
}

function pruneTextFilterState(
  state: Record<string, string>,
  filters: GeneratedFilter<any>[],
) {
  return pruneFilterState(
    state,
    filters,
    "text",
    (value) => !String(value ?? "").trim(),
  );
}

function pruneMultiFilterState(
  state: Record<string, Record<string, FilterBarMultiFilterMode>>,
  filters: GeneratedFilter<any>[],
) {
  // multi and nested-multi share the same state slot; allow either kind to
  // keep the entry alive.
  const allowed = new Set(
    filters
      .filter(
        (filter) => filter.kind === "multi" || filter.kind === "nested-multi",
      )
      .map((filter) => filter.column.key),
  );
  return Object.fromEntries(
    Object.entries(state).filter(
      ([key, value]) => allowed.has(key) && Object.keys(value).length > 0,
    ),
  );
}

function pruneNumberFilterState(
  state: Record<string, FilterBarNumberValue>,
  filters: GeneratedFilter<any>[],
) {
  return pruneFilterState(
    state,
    filters,
    "number",
    (value) =>
      !String(value.min ?? "").trim() && !String(value.max ?? "").trim(),
  );
}

function pruneFilterState<T>(
  state: Record<string, T>,
  filters: GeneratedFilter<any>[],
  kind: GeneratedFilter<any>["kind"],
  isEmpty: (value: T) => boolean,
) {
  const allowed = new Set(
    filters
      .filter((filter) => filter.kind === kind)
      .map((filter) => filter.column.key),
  );
  return Object.fromEntries(
    Object.entries(state).filter(
      ([key, value]) => allowed.has(key) && !isEmpty(value),
    ),
  ) as Record<string, T>;
}

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function formatCell(value: unknown): ReactNode {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Groups flat key=value tokens by key for the nested-multi tag filter.
// Tokens without a separator land in a synthetic "" group rendered as
// "Other" by the filter UI.
function groupTagOptions(
  options: MultiSelectOption[],
  separator: string,
): Array<{ groupKey: string; label?: string; options: MultiSelectOption[] }> {
  const byKey = new Map<string, MultiSelectOption[]>();
  for (const option of options) {
    const { key } = splitTagToken(option.value, separator);
    const list = byKey.get(key) ?? [];
    list.push(option);
    byKey.set(key, list);
  }
  return Array.from(byKey.entries())
    .sort(([a], [b]) => {
      // Bare-tag bucket sinks to the bottom; otherwise alphabetical.
      if (a === "" && b !== "") return 1;
      if (b === "" && a !== "") return -1;
      return a.localeCompare(b);
    })
    .map(([groupKey, groupOptions]) => ({
      groupKey,
      label: groupKey === "" ? "Other" : groupKey,
      options: groupOptions,
    }));
}

function applyKindDefaults<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
  timestampFormat: TimestampFormat | undefined,
): DataTableColumn<T> {
  if (!column.kind) return column;

  if (column.kind === "timestamp") {
    const format = timestampFormat ?? "iso";
    return {
      ...column,
      render:
        column.render ??
        ((value) => (
          <Timestamp
            value={value}
            format={format}
            showTitleOnHover={column.timestamp?.alwaysShowFullOnHover !== false}
          />
        )),
      sortValue:
        column.sortValue ??
        ((value) => parseTimestamp(value)?.getTime() ?? null),
      filterValue:
        column.filterValue ??
        ((value) => {
          const parsed = parseTimestamp(value);
          return parsed ? parsed.toISOString() : "";
        }),
    };
  }

  if (column.kind === "tags") {
    const opts = column.tags;
    const separator = opts?.separator ?? "=";
    return {
      ...column,
      render:
        column.render ??
        ((value) => (
          <TagList
            tags={normalizeTags(value as TagsValue, separator)}
            maxVisible={opts?.maxVisible ?? 3}
          />
        )),
      filterValue:
        column.filterValue ??
        ((value) => tagFilterTokens(value as TagsValue, separator)),
      sortValue:
        column.sortValue ??
        ((value) => tagFilterTokens(value as TagsValue, separator).length),
    };
  }

  if (column.kind === "status") {
    const opts = column.status;
    const map = opts?.map ?? ((raw) => normalizeStatus(raw));
    return {
      ...column,
      render:
        column.render ??
        ((value, row) => {
          const status = map(value, row);
          if (!status) return <span className="text-muted-foreground">—</span>;
          const label = opts?.showLabel
            ? typeof value === "string"
              ? value
              : status
            : undefined;
          const title =
            opts?.title?.(value, row) ??
            (typeof value === "string" ? value : undefined);
          return (
            <StatusDot
              status={status}
              {...(label ? { label } : {})}
              {...(title ? { title } : {})}
            />
          );
        }),
      filterValue:
        column.filterValue ??
        ((value, row) => {
          const status = map(value, row);
          return status ?? "";
        }),
      sortValue: column.sortValue ?? ((value, row) => map(value, row) ?? ""),
    };
  }

  return column;
}

function prettifyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase())
    .trim();
}

function labelText<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
) {
  if (typeof column.label === "string") return column.label;
  return prettifyKey(column.key.split(".").at(-1) ?? column.key);
}

function isColumnHideable<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
) {
  return column.hideable !== false;
}

function menuStateFromPointer(
  event: ReactMouseEvent<HTMLElement>,
  columnKey?: string,
): ColumnMenuState {
  const padding = 8;
  const width = 256;
  const height = 320;
  const viewportWidth =
    typeof window === "undefined" ? event.clientX + width : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? event.clientY + height : window.innerHeight;

  const position = {
    x: Math.max(
      padding,
      Math.min(event.clientX, viewportWidth - width - padding),
    ),
    y: Math.max(
      padding,
      Math.min(event.clientY, viewportHeight - height - padding),
    ),
  };
  return columnKey ? { ...position, columnKey } : position;
}

function menuStateFromTrigger(
  event: ReactMouseEvent<HTMLElement>,
  columnKey?: string,
): ColumnMenuState {
  const rect = event.currentTarget.getBoundingClientRect();
  const padding = 8;
  const width = 256;
  const height = 320;
  const viewportWidth =
    typeof window === "undefined" ? rect.right + width : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? rect.bottom + height : window.innerHeight;

  const position = {
    x: Math.max(
      padding,
      Math.min(rect.right - width, viewportWidth - width - padding),
    ),
    y: Math.max(
      padding,
      Math.min(rect.bottom + 6, viewportHeight - height - padding),
    ),
  };
  return columnKey ? { ...position, columnKey } : position;
}

function columnStyle<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
  widths: Record<string, number>,
): CSSProperties | undefined {
  const width = widths[column.key];
  return width ? { width: `${width}px` } : undefined;
}

function measureColumnContentWidth<T extends Record<string, unknown>>(
  table: HTMLTableElement,
  columnIndex: number,
  column: DataTableColumn<T>,
) {
  const cells = Array.from(table.querySelectorAll("th, td")).filter(
    (cell): cell is HTMLTableCellElement =>
      cell instanceof HTMLTableCellElement &&
      cell.cellIndex === columnIndex &&
      cell.colSpan === 1,
  );

  const measured = cells.reduce((current, cell) => {
    const horizontalPadding = getHorizontalPadding(cell);
    const contentWidths = Array.from(cell.children).map((child) =>
      child instanceof HTMLElement ? child.scrollWidth + horizontalPadding : 0,
    );
    return Math.max(current, cell.scrollWidth, ...contentWidths);
  }, 0);

  return clampColumnWidth(column, measured || defaultColumnWidth(column));
}

function getHorizontalPadding(element: HTMLElement) {
  if (typeof window === "undefined") return 0;
  const styles = window.getComputedStyle(element);
  return (
    parseCssPixelValue(styles.paddingLeft) +
    parseCssPixelValue(styles.paddingRight)
  );
}

function parseCssPixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readStoredColumnWidths<T extends Record<string, unknown>>(
  storageKey: string,
  columns: DataTableColumn<T>[],
): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};

    return pruneColumnWidths(parsed as Record<string, unknown>, columns);
  } catch {
    return {};
  }
}

function writeStoredColumnWidths(
  storageKey: string,
  widths: Record<string, number>,
) {
  if (typeof window === "undefined") return;

  try {
    if (Object.keys(widths).length === 0) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(widths));
    }
  } catch {}
}

function readStoredHiddenColumns<T extends Record<string, unknown>>(
  storageKey: string,
  columns: DataTableColumn<T>[],
): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};

    return pruneHiddenColumns(parsed as Record<string, unknown>, columns);
  } catch {
    return {};
  }
}

function writeStoredHiddenColumns(
  storageKey: string,
  hiddenColumns: Record<string, boolean>,
) {
  if (typeof window === "undefined") return;

  try {
    if (Object.keys(hiddenColumns).length === 0) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
    }
  } catch {}
}

function readStoredDensityOverride(storageKey: string): Density | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(storageKey);
    return isDensity(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredDensityOverride(
  storageKey: string,
  density: Density | undefined,
) {
  if (typeof window === "undefined") return;

  try {
    if (density) {
      window.localStorage.setItem(storageKey, density);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {}
}

function isDensity(value: unknown): value is Density {
  return value === "compact" || value === "comfortable" || value === "spacious";
}

function pruneColumnWidths<T extends Record<string, unknown>>(
  widths: Record<string, unknown>,
  columns: DataTableColumn<T>[],
): Record<string, number> {
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const next: Record<string, number> = {};

  for (const [key, width] of Object.entries(widths)) {
    const column = byKey.get(key);
    if (!column || typeof width !== "number" || !Number.isFinite(width))
      continue;

    next[key] = clampColumnWidth(column, width);
  }

  return next;
}

function pruneHiddenColumns<T extends Record<string, unknown>>(
  hiddenColumns: Record<string, unknown>,
  columns: DataTableColumn<T>[],
): Record<string, boolean> {
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const next: Record<string, boolean> = {};

  for (const [key, hidden] of Object.entries(hiddenColumns)) {
    const column = byKey.get(key);
    if (!column || hidden !== true || !isColumnHideable(column)) continue;

    next[key] = true;
  }

  const hideable = columns.filter(isColumnHideable);
  const visibleHideableCount = hideable.filter(
    (column) => next[column.key] !== true,
  ).length;
  if (hideable.length > 0 && visibleHideableCount === 0) {
    delete next[hideable[0]!.key];
  }

  return next;
}

function sameColumnWidths(
  left: Record<string, number>,
  right: Record<string, number>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        left[key] === right[key],
    )
  );
}

function sameHiddenColumns(
  left: Record<string, boolean>,
  right: Record<string, boolean>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        left[key] === right[key],
    )
  );
}

function defaultColumnWidth<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
) {
  if (column.grow) return DEFAULT_GROW_COLUMN_WIDTH;
  if (column.shrink) return DEFAULT_SHRINK_COLUMN_WIDTH;
  return DEFAULT_COLUMN_WIDTH;
}

function clampColumnWidth<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
  width: number,
) {
  const minWidth = column.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
  const maxWidth = column.maxWidth;
  const minimum = Number.isFinite(minWidth)
    ? Math.max(1, minWidth)
    : DEFAULT_COLUMN_MIN_WIDTH;
  const maximum =
    maxWidth != null && Number.isFinite(maxWidth)
      ? Math.max(minimum, maxWidth)
      : Infinity;

  return Math.round(Math.max(minimum, Math.min(maximum, width)));
}

function getNumericFilterBounds<T extends Record<string, unknown>>(
  rows: InternalRow<T>[],
  column: DataTableColumn<T>,
) {
  const values = rows.flatMap((record) =>
    collectFilterValues(getFilterCandidate(record.row, column)),
  );
  const populated = values.filter(hasFilterValue);
  const numericValues = populated
    .map((value) => parseNumberInput(value))
    .filter((value) => value != null);

  if (populated.length === 0 || numericValues.length !== populated.length) {
    return null;
  }

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    step: inferNumericStep(numericValues),
  };
}

function collectFilterValues(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectFilterValues(item));
  }

  return [value];
}

function hasFilterValue(value: unknown) {
  return value != null && !(typeof value === "string" && value.trim() === "");
}

function parseNumberInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferNumericStep(values: number[]) {
  if (values.every(Number.isInteger)) {
    return 1;
  }

  const maxFractionDigits = values.reduce((current, value) => {
    const [, fraction = ""] = String(value).split(".");
    return Math.max(current, fraction.length);
  }, 0);

  return 10 ** -Math.min(maxFractionDigits || 2, 6);
}

function alignmentClass(align?: DataTableColumn["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function headerAlignmentClass(align?: DataTableColumn["align"]) {
  if (align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

function loadingSkeletonWidth(index: number) {
  return ["w-24", "w-40", "w-28", "w-56", "w-32", "w-48"][index % 6];
}

function cellContentStyle(
  width: number | undefined,
): CSSProperties | undefined {
  return width ? { maxWidth: `${width}px` } : undefined;
}

function cellContentClassName<T extends Record<string, unknown>>(
  column: DataTableColumn<T>,
  width?: number,
): TdHTMLAttributes<HTMLTableCellElement>["className"] {
  const resized = width !== undefined;
  const base = "w-full truncate";
  if (column.grow)
    return cn(base, resized ? "min-w-0" : "min-w-56 max-w-[36rem]");
  if (column.shrink)
    return cn(base, "min-w-0 whitespace-nowrap", !resized && "max-w-[16rem]");
  return cn(base, "min-w-0", !resized && "max-w-[18rem]");
}

export function inferColumns<T extends Record<string, unknown>>(
  data: T[],
): DataTableColumn<T>[] {
  if (data.length === 0) return [];

  const keys = new Set<string>();
  for (const row of data.slice(0, 20)) {
    Object.keys(row)
      .filter((key) => !key.startsWith("_"))
      .forEach((key) => keys.add(key));
  }

  return Array.from(keys).map((key) => ({
    key,
    label: prettifyKey(key),
    sortable: true,
    filterable: true,
  }));
}

export function DataTable<T extends Record<string, unknown>>({
  theme: themeProp = "system",
  onThemeChange,
  showThemeControl = false,
  showFullscreenControl = false,
  fullscreenTitle = "Table",
  fullscreenButtonLabel = "Open table full screen",
  className,
  filterBarProps,
  ...inner
}: DataTableProps<T>) {
  const themeControlled = onThemeChange !== undefined;
  const [internalTheme, setInternalTheme] = useState<Theme>(themeProp);
  const themeValue = themeControlled ? themeProp : internalTheme;
  const resolvedTheme = useResolvedTheme(themeValue);
  const handleThemeChange = (next: Theme) => {
    if (!themeControlled) setInternalTheme(next);
    onThemeChange?.(next);
  };
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const renderTable = ({ inFullscreen }: { inFullscreen: boolean }) => {
    const showFullscreenButton = showFullscreenControl && !inFullscreen;
    const callerTrailing = filterBarProps?.trailing;
    const mergedFilterBarProps = showFullscreenButton
      ? {
          ...filterBarProps,
          trailing: (
            <>
              {callerTrailing}
              <FullscreenButton
                label={fullscreenButtonLabel}
                onClick={() => setFullscreenOpen(true)}
              />
            </>
          ),
        }
      : filterBarProps;
    return (
      <DataTableInner
        {...(inner as DataTableInnerProps<T>)}
        {...(mergedFilterBarProps
          ? { filterBarProps: mergedFilterBarProps }
          : {})}
        themeMenuValue={themeValue}
        showThemeControl={showThemeControl}
        onThemeChange={handleThemeChange}
      />
    );
  };

  return (
    <div
      data-theme={resolvedTheme}
      className={cn("flex min-h-0 flex-col text-foreground", className)}
    >
      {renderTable({ inFullscreen: false })}
      {showFullscreenControl && (
        <Modal
          open={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
          title={fullscreenTitle}
          size="full"
          className="h-[95vh]"
        >
          <div
            data-theme={resolvedTheme}
            className="flex h-full min-h-0 flex-col bg-background text-foreground"
          >
            {renderTable({ inFullscreen: true })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function FullscreenButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={onClick}
    >
      <Icon icon={UiFullscreen} className="text-sm" />
    </button>
  );
}
