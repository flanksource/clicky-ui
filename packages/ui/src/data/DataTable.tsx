import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type TdHTMLAttributes,
} from "react";
import { useSort, type SortDir } from "../hooks/use-sort";
import { cn } from "../lib/utils";
import {
  FilterBar,
  type FilterBarFilter,
  type FilterBarMultiFilterMode,
  type FilterBarNumberValue,
  type FilterBarProps,
} from "../components/FilterBar";
import type { MultiSelectOption } from "../components/MultiSelect";
import { SortableHeader } from "./SortableHeader";

type FilterValue = string | number | boolean | null | undefined | Array<string | number | boolean>;

type InternalRow<T> = {
  id: string;
  row: T;
};

type GeneratedFilter<T extends Record<string, unknown>> = {
  column: DataTableColumn<T>;
  kind: "text" | "multi" | "number";
  options: MultiSelectOption[];
  numberBounds?: {
    min: number;
    max: number;
    step: number;
  };
};

export type DataTableColumn<T extends Record<string, unknown> = Record<string, unknown>> = {
  key: string;
  label: ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  grow?: boolean;
  shrink?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
  sortValue?: (value: unknown, row: T) => unknown;
  filterValue?: (value: unknown, row: T) => FilterValue;
  cellClassName?: string;
  headerClassName?: string;
};

export type DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> = {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  className?: string;
  autoFilter?: boolean;
  showGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  globalFilterPlaceholder?: string;
  defaultSort?: { key: string; dir?: SortDir };
  filterBarProps?: Omit<FilterBarProps, "search" | "filters">;
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  getRowHref?: (row: T) => string | undefined;
  renderExpandedRow?: (row: T) => ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  emptyMessage = "No data",
  className,
  autoFilter = false,
  showGlobalFilter = true,
  globalFilter,
  onGlobalFilterChange,
  globalFilterPlaceholder = "Search all columns…",
  defaultSort,
  filterBarProps,
  getRowId,
  onRowClick,
  getRowHref,
  renderExpandedRow,
}: DataTableProps<T>) {
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [multiFilters, setMultiFilters] = useState<
    Record<string, Record<string, FilterBarMultiFilterMode>>
  >({});
  const [numberFilters, setNumberFilters] = useState<Record<string, FilterBarNumberValue>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  const rows = useMemo<InternalRow<T>[]>(
    () =>
      data.map((row, index) => ({
        id: getRowId?.(row, index) ?? String(index),
        row,
      })),
    [data, getRowId],
  );

  const filterableColumns = useMemo(
    () => columns.filter((column) => column.filterable !== false),
    [columns],
  );

  const generatedFilters = useMemo<GeneratedFilter<T>[]>(() => {
    if (!autoFilter) return [];

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
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
        .map((value) => ({ value, label: value }));

      return {
        column,
        kind: options.length >= 2 && options.length <= 20 ? "multi" : "text",
        options,
      };
    });
  }, [autoFilter, filterableColumns, rows]);

  useEffect(() => {
    setTextFilters((current) => pruneTextFilterState(current, generatedFilters));
    setMultiFilters((current) => pruneMultiFilterState(current, generatedFilters));
    setNumberFilters((current) => pruneNumberFilterState(current, generatedFilters));
  }, [generatedFilters]);

  const globalFilterControlled = globalFilter !== undefined;
  const effectiveGlobalFilter = globalFilterControlled ? globalFilter : localGlobalFilter;
  const setEffectiveGlobalFilter = globalFilterControlled
    ? (onGlobalFilterChange ?? (() => {}))
    : setLocalGlobalFilter;
  const nativeFilters = useMemo<FilterBarFilter[]>(
    () =>
      generatedFilters.map((filter) =>
        filter.kind === "multi"
          ? {
              key: filter.column.key,
              kind: "multi",
              label: labelText(filter.column),
              value: multiFilters[filter.column.key] ?? {},
              onChange: (next: Record<string, FilterBarMultiFilterMode>) =>
                setMultiFilters((current) => updateFilterRecord(current, filter.column.key, next)),
              options: filter.options,
            }
          : filter.kind === "number"
            ? {
                key: filter.column.key,
                kind: "number",
                label: labelText(filter.column),
                value: numberFilters[filter.column.key] ?? {},
                domainMin: filter.numberBounds?.min,
                domainMax: filter.numberBounds?.max,
                step: filter.numberBounds?.step,
                onChange: (next: FilterBarNumberValue) =>
                  setNumberFilters((current) =>
                    updateNumberFilterValue(current, filter.column.key, next),
                  ),
              }
            : {
                key: filter.column.key,
                kind: "text",
                label: labelText(filter.column),
                value: textFilters[filter.column.key] ?? "",
                onChange: (next: string) =>
                  setTextFilters((current) => updateFilterValue(current, filter.column.key, next)),
              },
      ),
    [generatedFilters, multiFilters, numberFilters, textFilters],
  );
  const hasCustomFilterBarContent = Boolean(
    filterBarProps?.leading ||
    filterBarProps?.children ||
    filterBarProps?.trailing ||
    filterBarProps?.timeRange ||
    filterBarProps?.dateRange,
  );
  const showFilterBar =
    (autoFilter && (showGlobalFilter || nativeFilters.length > 0)) || hasCustomFilterBarContent;

  const filteredRows = useMemo(() => {
    const globalNeedle = effectiveGlobalFilter.trim().toLowerCase();

    return rows.filter(({ row }) => {
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
          const needle = (textFilters[filter.column.key] ?? "").trim().toLowerCase();
          if (needle && !tokens.some((token) => token.toLowerCase().includes(needle))) {
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
              (value) => (min == null || value >= min) && (max == null || value <= max),
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

          if (include.length > 0 && !tokens.some((token) => include.includes(token))) {
            return false;
          }

          if (exclude.length > 0 && tokens.some((token) => exclude.includes(token))) {
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
  ]);

  const sortResolvers = useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [
          column.key,
          (record: InternalRow<T>) => getSortValue(record.row, column),
        ]),
      ) as Record<string, (record: InternalRow<T>) => unknown>,
    [columns],
  );

  const { sorted, sort, toggle } = useSort(filteredRows, {
    defaultKey: defaultSort?.key,
    defaultDir: defaultSort?.dir ?? "asc",
    resolvers: sortResolvers,
  });

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showFilterBar && (
        <FilterBar
          {...filterBarProps}
          {...(showGlobalFilter
            ? {
                search: {
                  value: effectiveGlobalFilter,
                  onChange: setEffectiveGlobalFilter,
                  placeholder: globalFilterPlaceholder,
                },
              }
            : {})}
          filters={nativeFilters}
        />
      )}

      {sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="overflow-auto rounded-md border border-border">
            <table className="w-max table-auto text-left text-sm">
              <colgroup>
                {columns.map((column) => (
                  <col
                    key={column.key}
                    className={column.shrink && !column.grow ? "w-px" : undefined}
                  />
                ))}
              </colgroup>
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b border-border text-xs text-muted-foreground">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-3 py-2 font-medium",
                        alignmentClass(column.align),
                        column.headerClassName,
                      )}
                    >
                      {column.sortable === false ? (
                        <span>{column.label}</span>
                      ) : (
                        <SortableHeader
                          active={sort?.key === column.key}
                          dir={sort?.key === column.key ? sort.dir : undefined}
                          align={column.align}
                          onClick={() => toggle(column.key)}
                        >
                          {column.label}
                        </SortableHeader>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((record) => {
                  const href = getRowHref?.(record.row);
                  const expanded = expandedRows[record.id] ?? false;
                  const expandedContent = renderExpandedRow?.(record.row) ?? null;
                  const expandable = expandedContent !== null;
                  const clickable = !!href || !!onRowClick || expandable;

                  return (
                    <Fragment key={record.id}>
                      <tr
                        className={cn(
                          "border-b border-border/60 align-top",
                          clickable && "cursor-pointer hover:bg-accent/40",
                        )}
                        onClick={() => {
                          if (expandable) {
                            setExpandedRows((current) => ({
                              ...current,
                              [record.id]: !current[record.id],
                            }));
                          }
                          onRowClick?.(record.row);
                        }}
                      >
                        {columns.map((column, index) => {
                          const rawValue = resolvePath(record.row, column.key);
                          const content = column.render
                            ? column.render(rawValue, record.row)
                            : formatCell(rawValue);

                          return (
                            <td
                              key={column.key}
                              className={cn(
                                "px-3 py-2",
                                alignmentClass(column.align),
                                column.cellClassName,
                              )}
                            >
                              <CellContent column={column}>
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
                      {expanded && expandedContent && (
                        <tr>
                          <td colSpan={columns.length} className="bg-muted/40 p-density-3">
                            <div className="rounded-md border border-border bg-background p-density-3">
                              {expandedContent}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-1 text-xs text-muted-foreground">
            {sorted.length} of {data.length} row{data.length === 1 ? "" : "s"}
          </div>
        </>
      )}
    </div>
  );
}

function CellContent({ column, children }: { column: DataTableColumn; children: ReactNode }) {
  return (
    <div className={cn(cellContentClassName(column), alignmentClass(column.align))}>{children}</div>
  );
}

function getSortValue<T extends Record<string, unknown>>(row: T, column: DataTableColumn<T>) {
  const rawValue = resolvePath(row, column.key);
  return column.sortValue ? column.sortValue(rawValue, row) : rawValue;
}

function getFilterCandidate<T extends Record<string, unknown>>(row: T, column: DataTableColumn<T>) {
  const rawValue = resolvePath(row, column.key);
  return column.filterValue ? column.filterValue(rawValue, row) : rawValue;
}

function getFilterTokens<T extends Record<string, unknown>>(row: T, column: DataTableColumn<T>) {
  return normalizeTokens(getFilterCandidate(row, column));
}

function getFilterNumbers<T extends Record<string, unknown>>(row: T, column: DataTableColumn<T>) {
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

function updateFilterValue<T extends Record<string, string>>(
  state: T,
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

function updateFilterRecord<T extends Record<string, Record<string, FilterBarMultiFilterMode>>>(
  state: T,
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

function updateNumberFilterValue<T extends Record<string, FilterBarNumberValue>>(
  state: T,
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

function pruneTextFilterState(state: Record<string, string>, filters: GeneratedFilter<any>[]) {
  return pruneFilterState(state, filters, "text", (value) => !String(value ?? "").trim());
}

function pruneMultiFilterState(
  state: Record<string, Record<string, FilterBarMultiFilterMode>>,
  filters: GeneratedFilter<any>[],
) {
  return pruneFilterState(state, filters, "multi", (value) => Object.keys(value).length === 0);
}

function pruneNumberFilterState(
  state: Record<string, FilterBarNumberValue>,
  filters: GeneratedFilter<any>[],
) {
  return pruneFilterState(
    state,
    filters,
    "number",
    (value) => !String(value.min ?? "").trim() && !String(value.max ?? "").trim(),
  );
}

function pruneFilterState<T>(
  state: Record<string, T>,
  filters: GeneratedFilter<any>[],
  kind: GeneratedFilter<any>["kind"],
  isEmpty: (value: T) => boolean,
) {
  const allowed = new Set(
    filters.filter((filter) => filter.kind === kind).map((filter) => filter.column.key),
  );
  return Object.fromEntries(
    Object.entries(state).filter(([key, value]) => allowed.has(key) && !isEmpty(value)),
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

function prettifyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase())
    .trim();
}

function labelText(column: DataTableColumn) {
  if (typeof column.label === "string") return column.label;
  return prettifyKey(column.key.split(".").at(-1) ?? column.key);
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

function cellContentClassName(
  column: DataTableColumn,
): TdHTMLAttributes<HTMLTableCellElement>["className"] {
  if (column.grow) return "min-w-56 max-w-[36rem] truncate";
  if (column.shrink) return "max-w-[16rem] truncate whitespace-nowrap";
  return "max-w-[18rem] truncate";
}

export function inferColumns<T extends Record<string, unknown>>(data: T[]): DataTableColumn<T>[] {
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
