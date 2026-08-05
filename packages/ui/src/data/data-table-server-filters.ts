import type { Dispatch, SetStateAction } from "react";
import type {
  FilterBarFilter,
  FilterBarNumberValue,
  FilterBarRangePreset,
  FilterBarRangeProps,
} from "../components/FilterBar";
import type { FilterExtension } from "../components/filter-bar-utils";
import { applyFilterExtensions } from "../components/filter-bar-utils";
import type { MultiSelectOption } from "../components/MultiSelect";
import type { TriState } from "../components/TriStateToggle";
import type { DataTableColumn, DataTableColumnKind } from "./DataTable";
import {
  parseMultiFilterValue,
  serializeMultiFilterValue,
  updateFilterSelection,
  type DataTableFilterSelection,
} from "./data-table-filter-values";
import { prettifyKey } from "./data-table-utils";

/**
 * Which control a filter renders as.
 *
 * Deliberately opaque: "terms" is not "a SQL IN() or an OpenSearch terms
 * query", it is "a set of discrete values the user includes or excludes". The
 * source compiles the selection; nothing about how it does so crosses into the
 * browser.
 */
export type DataTableFilterKind = "terms" | "range" | "time" | "boolean" | "text";

export type DataTableFilterOption = {
  /** Value written into the selection. */
  value: string;
  /** Display label. Falls back to `value`. */
  label?: string;
  /** How many rows carry this value, shown as a tooltip. */
  count?: number;
};

export type DataTableColumnFilter = {
  kind: DataTableFilterKind;
  /** Head of the option set for kind:"terms". Empty relies on `lookup`. */
  options?: DataTableFilterOption[];
  /** True when `options` is a capped head of a larger set. */
  truncated?: boolean;
  /** Distinct count behind a truncated head; drives the "… and N more" hint. */
  total?: number;
  /** The source can answer a type-ahead for this filter. */
  lookup?: boolean;
  /** Slider domain for kind:"range". */
  min?: number;
  max?: number;
  step?: number;
  /** Range presets for kind:"time". */
  presets?: FilterBarRangePreset[];
  /** Helper text shown in the filter popover. */
  description?: string;
  disabled?: boolean;
};

/**
 * A result column as the source describes it: how to render it, and — when the
 * source can narrow on it — which filter parameter it binds to and what control
 * that filter is.
 *
 * `filterKey` need not equal `name`: an analyzed text field filters through an
 * exact-value sibling, and a computed column filters by the alias it was given.
 */
export type DataTableServerColumn = {
  /** Field name as the source knows it; also the literal row key. */
  name: string;
  /** Header label. Defaults to a prettified `name`. */
  label?: string;
  /** Backend type string, verbatim (e.g. "TIMESTAMPTZ", "keyword"). Display only. */
  databaseType?: string;
  /** Cell rendering kind. */
  kind?: DataTableColumnKind;
  /** Filter parameter this column narrows on. Absent means not filterable. */
  filterKey?: string;
  /** The control the filter renders as. Absent means not filterable. */
  filter?: DataTableColumnFilter;
};

/** Head-set size for a filter value type-ahead. */
export const DATA_TABLE_FILTER_LOOKUP_LIMIT = 20;

export type DataTableFilterLookupRequest = {
  /** Which filter is being searched — the column's `filterKey`. */
  filterKey: string;
  /** What the user typed. Empty asks for the head of the set. */
  search: string;
  /** How many options to return. */
  limit: number;
};

export type DataTableFilterLookupResult = {
  options: DataTableFilterOption[];
};

/**
 * Answers a filter's value type-ahead. Sync or async — a static option source
 * returns an array, a server-backed one a promise.
 */
export type DataTableFilterLookup = (
  request: DataTableFilterLookupRequest,
) => Promise<DataTableFilterLookupResult> | DataTableFilterLookupResult;

export type ServerFilterBarOptions = {
  /** Answers a terms type-ahead for filters whose `lookup` is set. */
  lookupValues?: DataTableFilterLookup;
  /** Decorators applied to each built filter (icons, relabelling). */
  extensions?: FilterExtension[];
};

export type ServerFilterConfig = {
  filters: FilterBarFilter[];
  /** Present when exactly one column declared kind:"time". */
  timeRange?: FilterBarRangeProps;
};

/**
 * Turns the source's column description into DataTable columns.
 *
 * Every column gets a literal `accessor` — a raw result set has empty, dotted
 * and colliding names, none of which survive being read as a path — and
 * `filterable: false`, because a described result is filtered by the source and
 * never by cardinality guessed from one page.
 */
export function serverColumnsToDataTableColumns<T extends Record<string, unknown>>(
  columns: DataTableServerColumn[],
): DataTableColumn<T>[] {
  return columns.map((column, index) => ({
    key: column.name === "" ? `column-${index}` : column.name,
    label: column.label ?? prettifyKey(column.name),
    accessor: (row: T) => row[column.name],
    sortable: true,
    filterable: false,
    ...(column.kind !== undefined ? { kind: column.kind } : {}),
    ...(column.filterKey !== undefined ? { filterKey: column.filterKey } : {}),
  }));
}

/**
 * Builds the FilterBar controls for a described result, already wired to
 * `values`/`setValues`.
 *
 * Pure — it holds no state and fetches nothing; a `lookup` filter closes over
 * the caller's loader. Pass the result as DataTable's `externalFilters`
 * together with `manualFilter`, since the source has already applied it.
 *
 * Throws when a column declares a filter it cannot address: no `filterKey`, a
 * `filterKey` another column already claimed, or a second time range. Each
 * would bind a control to a filter that means something else.
 */
export function serverFiltersToFilterBar(
  columns: DataTableServerColumn[],
  values: DataTableFilterSelection,
  setValues: Dispatch<SetStateAction<DataTableFilterSelection>>,
  options: ServerFilterBarOptions = {},
): ServerFilterConfig {
  const config: ServerFilterConfig = { filters: [] };
  const claimed = new Map<string, string>();

  for (const column of columns) {
    const filter = column.filter;
    if (!filter) continue;
    const filterKey = column.filterKey;
    if (!filterKey) {
      throw new Error(`Column ${column.name} declares a filter but no filterKey to send it under`);
    }
    const owner = claimed.get(filterKey);
    if (owner !== undefined) {
      throw new Error(
        `Columns ${owner} and ${column.name} both filter through ${filterKey}; a filter key addresses one column`,
      );
    }
    claimed.set(filterKey, column.name);

    const label = column.label ?? prettifyKey(column.name);
    if (filter.kind === "time") {
      if (config.timeRange) {
        throw new Error(
          `Columns ${claimed.get(filterKey)} and ${column.name} both declare a time range; the filter bar has one`,
        );
      }
      config.timeRange = buildTimeRange(filterKey, filter, values, setValues);
      continue;
    }
    config.filters.push(
      applyFilterExtensions(
        buildFilter({ column, filterKey, label, filter, values, setValues, options }),
        options.extensions,
      ),
    );
  }
  return config;
}

type BuildArgs = {
  column: DataTableServerColumn;
  filterKey: string;
  label: string;
  filter: DataTableColumnFilter;
  values: DataTableFilterSelection;
  setValues: Dispatch<SetStateAction<DataTableFilterSelection>>;
  options: ServerFilterBarOptions;
};

function buildFilter(args: BuildArgs): FilterBarFilter {
  const { filterKey, label, filter, values, setValues } = args;
  const raw = values[filterKey] ?? "";
  const write = (serialized: string) =>
    setValues((current) => updateFilterSelection(current, filterKey, serialized));
  const shared = {
    key: filterKey,
    label,
    ...(filter.description !== undefined ? { description: filter.description } : {}),
    ...(filter.disabled !== undefined ? { disabled: filter.disabled } : {}),
  };

  switch (filter.kind) {
    case "range":
      return {
        ...shared,
        kind: "number",
        value: parseBoundsValue(raw),
        onChange: (next: FilterBarNumberValue) => write(serializeBoundsValue(next)),
        ...(filter.min !== undefined ? { domainMin: filter.min } : {}),
        ...(filter.max !== undefined ? { domainMax: filter.max } : {}),
        ...(filter.step !== undefined ? { step: filter.step } : {}),
      };
    case "boolean":
      return {
        ...shared,
        kind: "tristate",
        value: raw === "" ? undefined : raw === "true",
        onChange: (next: TriState) => write(next === undefined ? "" : String(next)),
      };
    case "text":
      return {
        ...shared,
        kind: "text",
        value: raw,
        onChange: (next: string) => write(next),
      };
    default:
      return buildTermsFilter(args, shared, raw, write);
  }
}

function buildTermsFilter(
  { filter, options }: BuildArgs,
  shared: { key: string; label: string; description?: string; disabled?: boolean },
  raw: string,
  write: (serialized: string) => void,
): FilterBarFilter {
  const lookupValues = options.lookupValues;
  return {
    ...shared,
    kind: "multi",
    value: parseMultiFilterValue(raw),
    onChange: (next) => write(serializeMultiFilterValue(next)),
    options: (filter.options ?? []).map(toMultiSelectOption),
    ...(filter.truncated !== undefined ? { truncated: filter.truncated } : {}),
    ...(filter.total !== undefined ? { total: filter.total } : {}),
    // The field owns the in-flight flag from the promise this returns, so no
    // `loading` is passed: a second source of truth for it could disagree.
    ...(lookupValues && filter.lookup
      ? {
          onSearch: async (search: string) => {
            const result = await lookupValues({
              filterKey: shared.key,
              search,
              limit: DATA_TABLE_FILTER_LOOKUP_LIMIT,
            });
            return result.options.map(toMultiSelectOption);
          },
        }
      : {}),
  };
}

function buildTimeRange(
  filterKey: string,
  filter: DataTableColumnFilter,
  values: DataTableFilterSelection,
  setValues: Dispatch<SetStateAction<DataTableFilterSelection>>,
): FilterBarRangeProps {
  const bounds = parseBoundsValue(values[filterKey] ?? "");
  return {
    ...(bounds.min !== undefined ? { from: bounds.min } : {}),
    ...(bounds.max !== undefined ? { to: bounds.max } : {}),
    onApply: (from, to) =>
      setValues((current) =>
        updateFilterSelection(current, filterKey, serializeBoundsValue({ min: from, max: to })),
      ),
    ...(filter.presets !== undefined ? { presets: filter.presets } : {}),
    timeEnabled: true,
  };
}

/**
 * Reads the bounded half of the selection grammar: comma-separated tokens, each
 * carrying its own comparison operator. The bar's controls are inclusive on
 * both edges, so that is what they write back — but a bound typed by hand or
 * arriving in a URL keeps whatever operator it came with.
 */
function parseBoundsValue(raw: string): FilterBarNumberValue {
  const bounds: FilterBarNumberValue = {};
  for (const token of raw.split(",")) {
    const trimmed = token.trim();
    if (trimmed.startsWith(">")) {
      bounds.min = trimmed.replace(/^>=?/, "");
    } else if (trimmed.startsWith("<")) {
      bounds.max = trimmed.replace(/^<=?/, "");
    }
  }
  return bounds;
}

function serializeBoundsValue(value: FilterBarNumberValue): string {
  const tokens: string[] = [];
  if (value.min) tokens.push(`>=${value.min}`);
  if (value.max) tokens.push(`<=${value.max}`);
  return tokens.join(",");
}

function toMultiSelectOption(option: DataTableFilterOption): MultiSelectOption {
  const label = option.label ?? option.value;
  return {
    value: option.value,
    label,
    ...(option.count !== undefined ? { title: `${label} · ${option.count.toLocaleString()}` } : {}),
  };
}

/**
 * Refuses a DataTable that would filter twice or offer a control wired to
 * nothing. Both are silent in a running table — rows narrow more than the user
 * asked, or a box swallows what they type — so they are refused at the seam.
 */
export function assertDataTableFilterProps(props: {
  autoFilter: boolean;
  manualFilter: boolean;
  showGlobalFilter: boolean;
  globalFilterControlled: boolean;
  hasExternalSearch: boolean;
}): void {
  if (props.autoFilter && props.manualFilter) {
    throw new Error(
      "DataTable: autoFilter generates filters that narrow rows locally, which manualFilter then suppresses — the controls would render and do nothing. Pass externalFilters instead.",
    );
  }
  if (
    props.manualFilter &&
    props.showGlobalFilter &&
    !props.globalFilterControlled &&
    !props.hasExternalSearch
  ) {
    throw new Error(
      "DataTable: manualFilter suppresses the built-in search's row narrowing, so showGlobalFilter needs globalFilter/onGlobalFilterChange or externalSearch to reach the source.",
    );
  }
}
