import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  FilterBarFilter,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import type {
  WorkloadKind,
  WorkloadResource,
} from "../components/workload-picker-utils";
import type { DataTablePagination } from "../data/DataTable";
import type { SortState } from "../hooks/use-sort";
import {
  parseBoundsValue,
  parseMultiFilterValue,
  serializeBoundsValue,
  serializeMultiFilterValue,
  splitCommaValues,
} from "../data/data-table-filter-values";
import { filterShapesByName } from "./filterShapes";
import type {
  ClickyFilterShape,
  ExecutionResponse,
  OpenAPIParameter,
  OperationLookupFilter,
  OperationLookupResponse,
} from "./types";
import { isPositionalParam, parameterPlaceholder } from "./types";

export type ParameterValues = Record<string, string>;
export type ParameterValuesSetter = Dispatch<SetStateAction<ParameterValues>>;

// ParameterPagination plumbs limit/offset query parameters into the
// DataTable's pagination footer. The UI exposes both as the
// {pageSize, pageIndex} tuple but here we keep raw string limit/offset
// values so the executor sees exactly what the operation declared.
export type ParameterPagination = {
  limitParam: string; // parameter name on the operation, e.g. "limit"
  limitValue: string;
  setLimit: (next: string) => void;

  // Offset paging, when the operation declares an offset parameter. Absent for
  // a surface that cannot name a position past its first page — a profile with
  // no total order, say. Such a surface still sizes its page and still reports
  // how many rows it is showing of how many; it just cannot step.
  offsetParam?: string;
  offsetValue?: string;
  setOffset?: (next: string) => void;

  // Cursor paging, when the operation declares a cursor parameter. Present
  // alongside limit/offset rather than instead of them: an operation can serve
  // both, and which one a page uses is decided per request.
  cursorParam?: string;
  cursorValue?: string;
  setCursor?: (next: string) => void;
};

export type ParameterFormConfig = {
  filters: FilterBarFilter[];
  search?: FilterBarSearchProps;
  timeRange?: FilterBarRangeProps;
  pagination?: ParameterPagination;
  sort?: ParameterSort;
};

export type ParameterSort = {
  value: SortState | null;
  onChange: (sort: SortState | null) => void;
};
// LookupSearch fetches the options of one filter matching `query`, server-side.
// It is what a truncated option set is reachable through: the head the lookup
// returned is only the first page of a larger distinct set, and everything past
// it is found by typing rather than by scrolling.
export type LookupSearch = (
  filterKey: string,
  query: string,
) => Promise<{ value: string; label: string; title?: string }[]>;

export type ParameterFormOptions = {
  includeLocations?: OpenAPIParameter["in"][];
  lookup?: OperationLookupResponse | undefined;
  lockedValues?: ParameterValues | undefined;
  hideLocked?: boolean;
  // Wired only into filters the server marked truncated: one that fully
  // enumerated needs no round trip to search what is already in the browser.
  lookupSearch?: LookupSearch | undefined;
  // The spec's `components["x-clicky-filters"]` map, which every filter
  // parameter names via its `$ref`. It is what a control's identity is read
  // from, so that identity survives a filter change: `lookup` carries the same
  // answer but is refetched per selection, and reading shape from it is what
  // used to collapse every chip into a text box for the length of that fetch.
  components?: Record<string, ClickyFilterShape> | undefined;
};

// A truncated set has to say so even where nothing can search it: the footer
// telling the user 350 values are missing is what stops a partial list reading
// as the whole answer.
function truncationProps(filter: OperationLookupFilter) {
  if (!filter.truncated) return {};
  return {
    truncated: true,
    ...(filter.total !== undefined ? { total: filter.total } : {}),
  };
}

// Server-side search applies only when the server said it withheld options. A
// filter whose set arrived whole is searched in the browser, which is both
// faster and exactly as complete.
function searchProps(
  filter: OperationLookupFilter,
  key: string,
  search: LookupSearch | undefined,
) {
  if (!filter.truncated) return {};
  return {
    ...truncationProps(filter),
    ...(search ? { onSearch: (query: string) => search(key, query) } : {}),
  };
}

export function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultValueForParameter(
  param: OpenAPIParameter,
  method: string,
): string {
  if (
    method.toUpperCase() === "GET" &&
    param.in === "query" &&
    !param.required
  ) {
    return "";
  }
  const fallback = param.in === "path" ? "" : undefined;
  const value = param.schema?.default ?? fallback;
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value) || (value != null && typeof value === "object")) {
    return "";
  }
  if (value == null) {
    return "";
  }
  return String(value);
}

export function buildInitialParameterValues(
  parameters: OpenAPIParameter[],
  method: string,
  lockedValues: ParameterValues = {},
  initialValues: ParameterValues = {},
): ParameterValues {
  const values = Object.fromEntries(
    parameters.map((param) => [
      param.name,
      defaultValueForParameter(param, method),
    ]),
  );
  return { ...values, ...initialValues, ...lockedValues };
}

// OFFSET_DEPTH_LIMIT is where offset paging stops being available and a cursor
// takes over. It exists because backends refuse a deep offset outright —
// OpenSearch's default result window is 10,000 — so this is the one place that
// decides the changeover rather than each surface discovering the refusal for
// itself. Below it, page-number jumps stay available; past it there is nothing
// to jump with, because a cursor names a position rather than a page.
export const OFFSET_DEPTH_LIMIT = 10_000;

export function dataTablePaginationFromForm(
  pagination: ParameterPagination | undefined,
  response: Pick<ExecutionResponse, "pagination"> | null | undefined,
): DataTablePagination | undefined {
  if (!pagination) return undefined;

  // The footer describes the rows currently rendered, not the request that is
  // replacing them. During keepPreviousData refetches the form already holds
  // the next offset while the response still holds the retained page.
  const pageSize =
    response?.pagination?.limit ?? positiveInt(pagination.limitValue) ?? 25;
  const offset =
    response?.pagination?.offset ?? nonNegativeInt(pagination.offsetValue) ?? 0;
  const page = Math.floor(offset / pageSize);
  const served = response?.pagination;
  const setCursor = pagination.setCursor;
  const setOffset = pagination.setOffset;

  return {
    page,
    pageSize,
    ...(served?.total !== undefined ? { total: served.total } : {}),
    ...(served?.totalRelation !== undefined
      ? { totalRelation: served.totalRelation }
      : {}),
    ...(served?.hasMore !== undefined ? { hasMore: served.hasMore } : {}),
    // Cursor mode needs both halves: a parameter to send the cursor on, and a
    // cursor to send. An operation that declares one without the server minting
    // the other pages by offset, which is correct and merely slower.
    //
    // Which mode applies is depth, not preference: a walk already under way
    // continues, and a shallow page keeps its jump controls until the next one
    // would cross OFFSET_DEPTH_LIMIT — the point past which the offset would be
    // refused anyway.
    ...(setCursor &&
    (pagination.cursorValue ||
      (served?.nextCursor &&
        (!setOffset || offset + pageSize >= OFFSET_DEPTH_LIMIT)))
      ? {
          cursor: {
            ...(pagination.cursorValue
              ? { current: pagination.cursorValue }
              : {}),
            ...(served?.nextCursor ? { next: served.nextCursor } : {}),
            onCursorChange: (next: string | undefined) => {
              // Offset and cursor are two disagreeing positions in one request,
              // so taking the cursor means dropping the offset.
              setOffset?.("0");
              setCursor(next ?? "");
            },
          },
        }
      : {}),
    // Offered only when there is somewhere to step to. A surface with no offset
    // parameter still counts and still resizes, but naming page two would be
    // naming a page the server will refuse.
    ...(setOffset
      ? {
          onPageChange: (next: number) => {
            if (positiveInt(pagination.limitValue) == null) {
              pagination.setLimit(String(pageSize));
            }
            setCursor?.("");
            setOffset(String(Math.max(next, 0) * pageSize));
          },
        }
      : {}),
    onPageSizeChange: (next: number) => {
      pagination.setLimit(String(next));
      // A cursor names a position in a page of the old size, so resizing the
      // page invalidates it and the walk restarts.
      setCursor?.("");
      setOffset?.("0");
    },
  };
}

export function pruneParameterValues(values: ParameterValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== ""),
  );
}

/**
 * Packs form/filter state into the request the operation actually describes.
 *
 * Values a parameter list does not name are dropped rather than forwarded.
 * Filter state outlives a single surface — the explorer seeds it from the URL
 * and carries it across routes — and a server asked for a filter it does not
 * have rejects the whole request rather than the one value, so a leftover
 * `filter.*` from another profile turns a working table into an error.
 */
export function packParameterValues(
  values: ParameterValues,
  parameters: OpenAPIParameter[],
): ParameterValues {
  const positionalNames = new Set(
    parameters
      .filter((param) => param.in !== "path" && isPositionalParam(param))
      .map((p) => p.name),
  );
  const declaredNames = new Set(parameters.map((param) => param.name));
  const params: ParameterValues = {};
  const args: string[] = [];

  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    if (!declaredNames.has(key)) continue;
    if (positionalNames.has(key)) {
      args.push(value);
    } else {
      params[key] = value;
    }
  }

  if (args.length > 0) {
    params.args = args.join(",");
  }

  return params;
}

export function packLookupParameterValues(
  values: ParameterValues,
  parameters: OpenAPIParameter[],
): ParameterValues {
  return packParameterValues(
    values,
    parameters.filter(
      (parameter) =>
        parameter["x-clicky"]?.role !== "limit" &&
        parameter["x-clicky"]?.role !== "offset" &&
        parameter["x-clicky"]?.role !== "cursor" &&
        parameter["x-clicky"]?.role !== "sort" &&
        parameter["x-clicky"]?.role !== "order",
    ),
  );
}

export function parametersToFormConfig(
  parameters: OpenAPIParameter[],
  values: ParameterValues,
  setValues: ParameterValuesSetter,
  options: ParameterFormOptions = {},
): ParameterFormConfig {
  const emitFilters: FilterBarFilter[] = [];
  const lookupFilters = options.lookup?.filters ?? {};
  // Shape comes from the spec, values from the lookup. The lookup answers both
  // questions, but only the values half of its answer can change, so a control
  // that reads its identity from the spec keeps that identity while the values
  // half is being refetched.
  const shapes = filterShapesByName(parameters, options.components);
  const includeLocations = new Set(
    options.includeLocations ?? ["path", "query", "header"],
  );
  const lockedValues = options.lockedValues ?? {};
  const hideLocked = options.hideLocked ?? false;

  // Pull limit/offset out of the filter loop entirely — they drive pagination,
  // not filter pills. Roles come from server-side `paramRole` (see
  // clicky/rpc/openapi.go); the older "named limit on a GET" heuristic is
  // intentionally not duplicated here so the server stays the single source
  // of truth for parameter classification.
  const limitParam = parameters.find((p) => p["x-clicky"]?.role === "limit");
  const offsetParam = parameters.find((p) => p["x-clicky"]?.role === "offset");
  // A cursor is an opaque server-minted token, so it is never a filter chip a
  // user could type into — it is only ever echoed back from a previous page.
  const cursorParam = parameters.find((p) => p["x-clicky"]?.role === "cursor");
  const sortParam = parameters.find((p) => p["x-clicky"]?.role === "sort");
  const orderParam = parameters.find((p) => p["x-clicky"]?.role === "order");
  if ((sortParam == null) !== (orderParam == null)) {
    throw new Error("Server sorting requires both sort and order parameters");
  }
  const paginationOmitNames = new Set<string>();
  if (limitParam) paginationOmitNames.add(limitParam.name);
  if (offsetParam) paginationOmitNames.add(offsetParam.name);
  if (cursorParam) paginationOmitNames.add(cursorParam.name);
  if (sortParam) paginationOmitNames.add(sortParam.name);
  if (orderParam) paginationOmitNames.add(orderParam.name);

  // The search-role param drives the FilterBar's dedicated search input rather
  // than a filter chip; pull it out of the chip loop the same way pagination is.
  const searchParam = parameters.find(
    (p) => p["x-clicky"]?.role === "search" && includeLocations.has(p.in),
  );
  const omitNames = new Set(paginationOmitNames);
  if (searchParam) omitNames.add(searchParam.name);

  // rewind returns the caller to the first page whenever the result set itself
  // changes. Both positions have to go: an offset into the old rows names
  // different rows in the new ones, and a cursor minted under the old filters
  // is rejected by the server outright rather than silently reinterpreted.
  const rewind = (next: ParameterValues): ParameterValues => ({
    ...next,
    ...(offsetParam ? { [offsetParam.name]: "0" } : {}),
    ...(cursorParam ? { [cursorParam.name]: "" } : {}),
  });

  // Time-range first looks for server-stamped roles, then falls back to the
  // existing lookup-driven "from"/"to" detection so older specs keep working.
  const roleRangeStart = parameters.find(
    (p) => p["x-clicky"]?.role === "time-from",
  );
  const roleRangeEnd = parameters.find(
    (p) => p["x-clicky"]?.role === "time-to",
  );
  const edgeType = (param: OpenAPIParameter) =>
    shapes.get(param.name)?.type ?? lookupFilters[param.name]?.type;
  const rangeStart =
    roleRangeStart ??
    parameters.find(
      (param) =>
        includeLocations.has(param.in) &&
        param.in === "query" &&
        edgeType(param) === "from",
    );
  const rangeEnd =
    roleRangeEnd ??
    parameters.find(
      (param) =>
        includeLocations.has(param.in) &&
        param.in === "query" &&
        edgeType(param) === "to",
    );
  const hasTimeRange = rangeStart != null && rangeEnd != null;

  for (const param of parameters) {
    if (!includeLocations.has(param.in)) continue;
    if (omitNames.has(param.name)) continue;
    if (
      hasTimeRange &&
      (param.name === rangeStart?.name || param.name === rangeEnd?.name)
    ) {
      continue;
    }

    const disabled = Object.prototype.hasOwnProperty.call(
      lockedValues,
      param.name,
    );
    if (disabled && hideLocked) continue;
    const value = disabled
      ? (lockedValues[param.name] ?? "")
      : (values[param.name] ?? "");
    const shape = shapes.get(param.name);
    const label =
      shape?.label ?? lookupFilters[param.name]?.label ?? titleCase(param.name);
    // Only an explicit placeholder is rendered — never synthesize one. The
    // field already carries `label`, so a fallback placeholder is redundant
    // and generic defaults (e.g. "value-1, value-2") read as fake data.
    const placeholder = parameterPlaceholder(param);
    const placeholderProp = placeholder !== undefined ? { placeholder } : {};
    const onChange = (next: string | boolean) => {
      if (disabled) return;
      const stringValue =
        typeof next === "boolean" ? (next ? "true" : "false") : next;
      setValues((current) => rewind({ ...current, [param.name]: stringValue }));
    };

    const schema = param.schema;
    const lookupFilter = lookupFilters[param.name];
    // The spec's answer wins: it is the one that is still there mid-refetch.
    const filterType = shape?.type ?? lookupFilter?.type;

    if (filterType === "workload" && param.in === "query") {
      emitFilters.push({
        key: param.name,
        kind: "workload",
        label,
        value,
        disabled,
        kinds: ["pod", "deployment", "statefulset", "daemonset"],
        loadWorkloads: async (kinds) =>
          lookupFilter ? workloadsFromLookup(lookupFilter, kinds) : {},
        // A server-generated workload filter is scoped by the operation itself,
        // so a lookup returning one workload means the scope already picked it.
        collapseSingleOption: true,
        onChange: (next) => onChange(next),
      });
      continue;
    }

    if (filterType === "labels" && param.in === "query") {
      const fieldOptions = lookupFilter
        ? lookupOptionsToFieldOptions(lookupFilter)
        : [];
      const selection = parseMultiFilterValue(value);
      const grouped =
        fieldOptions.some((option) => option.value.includes("=")) ||
        Object.keys(selection).some((selected) => selected.includes("="));
      if (grouped) {
        emitFilters.push({
          key: param.name,
          kind: "nested-multi",
          label,
          value: selection,
          disabled,
          groups: labelOptionGroups(fieldOptions),
          onChange: (next) =>
            setValues((current) =>
              rewind({
                ...current,
                [param.name]: serializeMultiFilterValue(next),
              }),
            ),
        });
      } else {
        emitFilters.push({
          key: param.name,
          kind: "multi",
          label,
          value: selection,
          disabled,
          options: fieldOptions,
          ...(lookupFilter
            ? searchProps(lookupFilter, param.name, options.lookupSearch)
            : {}),
          onChange: (next) =>
            setValues((current) =>
              rewind({
                ...current,
                [param.name]: serializeMultiFilterValue(next),
              }),
            ),
        });
      }
      continue;
    }

    // Both edges of a range travel under one parameter, so the control is built
    // from that parameter alone rather than from the from/to pair below.
    // A "day-range" is the same control with the clock taken off it, so it
    // shares this branch and differs only in timeEnabled.
    if (
      (filterType === "date-range" || filterType === "day-range") &&
      param.in === "query"
    ) {
      // A server that declares a default applies it to a request that names no
      // bound, so the control shows that default rather than "any time" — an
      // empty range control over a bounded query states the wrong query. Only
      // the display falls back; the value is still whatever was selected, so
      // nothing is written to the URL on the strength of a default.
      const bounds = parseBoundsValue(
        value || String(param.schema?.default ?? ""),
      );
      emitFilters.push({
        key: param.name,
        kind: "date-range",
        label,
        disabled,
        ...(bounds.min !== undefined ? { from: bounds.min } : {}),
        ...(bounds.max !== undefined ? { to: bounds.max } : {}),
        ...(lookupFilter?.presets ? { presets: lookupFilter.presets } : {}),
        timeEnabled:
          filterType === "day-range" ? false : (lookupFilter?.timeEnabled ?? true),
        ...(lookupFilter?.timeZone ? { timeZone: lookupFilter.timeZone } : {}),
        ...(lookupFilter?.timeZones
          ? { timeZones: lookupFilter.timeZones }
          : {}),
        onApply: (from: string, to: string) => {
          if (disabled) return;
          setValues((current) =>
            rewind({
              ...current,
              [param.name]: serializeBoundsValue({ min: from, max: to }),
            }),
          );
        },
      });
      continue;
    }

    // An exact-value selection with nothing to enumerate. It shares the
    // multi-filter grammar, so the raw string is written through unchanged:
    // "a,b" is two values and "!a" excludes one, exactly as picking them would.
    if (filterType === "value" && param.in === "query") {
      emitFilters.push({
        key: param.name,
        kind: "text",
        label,
        value,
        disabled,
        ...placeholderProp,
        onChange: (next) => onChange(next),
      });
      continue;
    }

    if (filterType === "multi-filter" && param.in === "query") {
      emitFilters.push({
        key: param.name,
        kind: "multi",
        label,
        value: parseMultiFilterValue(value),
        disabled,
        options: lookupFilter ? lookupOptionsToFieldOptions(lookupFilter) : [],
        ...(lookupFilter
          ? searchProps(lookupFilter, param.name, options.lookupSearch)
          : {}),
        onChange: (next) =>
          setValues((current) =>
            rewind({
              ...current,
              [param.name]: serializeMultiFilterValue(next),
            }),
          ),
      });
      continue;
    }

    if (schema?.enum) {
      emitFilters.push({
        key: param.name,
        kind: "enum",
        label,
        value,
        disabled,
        options: schema.enum.map((item) => ({
          value: String(item),
          label: String(item),
        })),
        onChange: (next) => onChange(next),
      });
      continue;
    }

    if (filterType === "bool" || schema?.type === "boolean") {
      emitFilters.push({
        key: param.name,
        kind: "boolean",
        label,
        value: value === "true",
        disabled,
        onChange: (next) => onChange(next),
      });
      continue;
    }

    if ((shape != null || lookupFilter != null) && param.in === "query") {
      if (shape?.multi ?? lookupFilter?.multi) {
        emitFilters.push({
          key: param.name,
          kind: "lookup-multi",
          label,
          value: splitCommaValues(value),
          disabled,
          options: lookupFilter ? lookupOptionsToFieldOptions(lookupFilter) : [],
          // Reported, not searched: this control's onSearch hands the query back
          // to the consumer to refetch and re-feed `options`, which is a
          // different contract from the one searchProps satisfies.
          ...(lookupFilter ? truncationProps(lookupFilter) : {}),
          ...placeholderProp,
          onChange: (next) =>
            setValues((current) =>
              rewind({ ...current, [param.name]: next.join(",") }),
            ),
        });
        continue;
      }

      emitFilters.push({
        key: param.name,
        kind: "lookup",
        label,
        value,
        disabled,
        options: lookupFilter ? lookupOptionsToFieldOptions(lookupFilter) : [],
        ...placeholderProp,
        inputType:
          filterType === "number"
            ? "number"
            : filterType === "date"
              ? "date"
              : "text",
        onChange: (next) => onChange(next),
      });
      continue;
    }

    emitFilters.push({
      key: param.name,
      kind: "text",
      label,
      value,
      disabled,
      ...placeholderProp,
      onChange: (next) => onChange(next),
    });
  }

  const config: ParameterFormConfig = { filters: emitFilters };
  if (sortParam && orderParam) {
    const key = values[sortParam.name] ?? "";
    const direction = values[orderParam.name] || "asc";
    if (direction !== "asc" && direction !== "desc") {
      throw new Error(`Unsupported server sort direction ${direction}`);
    }
    config.sort = {
      value: key ? { key, dir: direction } : null,
      onChange: (next) =>
        setValues((current) => {
          const updated = { ...current };
          if (next) {
            updated[sortParam.name] = next.key;
            updated[orderParam.name] = next.dir;
          } else {
            delete updated[sortParam.name];
            delete updated[orderParam.name];
          }
          return rewind(updated);
        }),
    };
  }
  if (searchParam) {
    const searchDisabled = Object.prototype.hasOwnProperty.call(
      lockedValues,
      searchParam.name,
    );
    const searchValue = searchDisabled
      ? (lockedValues[searchParam.name] ?? "")
      : (values[searchParam.name] ?? "");
    const searchPlaceholder = parameterPlaceholder(searchParam);
    config.search = {
      value: searchValue,
      onChange: (next) => {
        if (searchDisabled) return;
        setValues((current) =>
          rewind({ ...current, [searchParam.name]: next }),
        );
      },
      ...(searchPlaceholder ? { placeholder: searchPlaceholder } : {}),
      ariaLabel:
        lookupFilters[searchParam.name]?.label ?? titleCase(searchParam.name),
    };
  }
  // Gated on the limit alone. An operation that caps its rows can report how
  // many of how many it is showing and can resize the cap, both of which are
  // independent of being able to step to a second page — and gating the whole
  // footer on the offset is what made a surface without one report "100 of 100"
  // while the server was answering with a total of 12,558.
  if (limitParam) {
    config.pagination = {
      limitParam: limitParam.name,
      limitValue: values[limitParam.name] ?? "",
      setLimit: (next) =>
        setValues((current) => ({ ...current, [limitParam.name]: next })),
      ...(offsetParam
        ? {
            offsetParam: offsetParam.name,
            offsetValue: values[offsetParam.name] ?? "",
            setOffset: (next: string) =>
              setValues((current) => ({
                ...current,
                [offsetParam.name]: next,
              })),
          }
        : {}),
      ...(cursorParam
        ? {
            cursorParam: cursorParam.name,
            cursorValue: values[cursorParam.name] ?? "",
            setCursor: (next: string) =>
              setValues((current) => ({
                ...current,
                [cursorParam.name]: next,
              })),
          }
        : {}),
    };
  }
  if (hasTimeRange && rangeStart != null && rangeEnd != null) {
    const rangeStartMeta = lookupFilters[rangeStart.name];
    const rangeEndMeta = lookupFilters[rangeEnd.name];
    const rangeMeta = rangeStartMeta ?? rangeEndMeta;
    const explicitTimeEnabled =
      rangeStartMeta?.timeEnabled ?? rangeEndMeta?.timeEnabled;
    config.timeRange = {
      from: values[rangeStart.name] ?? "",
      to: values[rangeEnd.name] ?? "",
      onApply: (from, to) =>
        setValues((current) =>
          rewind({ ...current, [rangeStart.name]: from, [rangeEnd.name]: to }),
        ),
      ...(rangeMeta?.presets ? { presets: rangeMeta.presets } : {}),
      timeEnabled:
        explicitTimeEnabled ??
        (rangeStart.schema?.format === "date-time" ||
          rangeEnd.schema?.format === "date-time"),
      ...(rangeMeta?.timeZone ? { timeZone: rangeMeta.timeZone } : {}),
      ...(rangeMeta?.timeZones ? { timeZones: rangeMeta.timeZones } : {}),
      ...(rangeStart.description
        ? { fromPlaceholder: rangeStart.description }
        : {}),
      ...(rangeEnd.description ? { toPlaceholder: rangeEnd.description } : {}),
    };
  }

  return config;
}

export function useDebouncedRecord<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debounced;
}

function positiveInt(value: string | undefined): number | undefined {
  const parsed = parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function nonNegativeInt(value: string | undefined): number | undefined {
  const parsed = parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function lookupOptionsToFieldOptions(filter: OperationLookupFilter) {
  const merged = new Map<string, { label?: string; title?: string }>();

  for (const [value, node] of Object.entries(filter.options ?? {})) {
    merged.set(value, {
      label: clickyNodeToPlainText(node) || value,
      title: clickyNodeToPlainText(node) || value,
    });
  }

  for (const [value, node] of Object.entries(filter.selected ?? {})) {
    if (!merged.has(value)) {
      merged.set(value, {
        label: clickyNodeToPlainText(node) || value,
        title: clickyNodeToPlainText(node) || value,
      });
    }
  }

  return Array.from(merged.entries()).map(([value, meta]) => ({
    value,
    label: meta.label ?? value,
    title: meta.title ?? value,
  }));
}

function workloadsFromLookup(
  filter: OperationLookupFilter,
  kinds: WorkloadKind[],
): Partial<Record<WorkloadKind, WorkloadResource[]>> {
  const requested = new Set(kinds);
  const result: Partial<Record<WorkloadKind, WorkloadResource[]>> = {};
  for (const kind of kinds) result[kind] = [];
  for (const option of lookupOptionsToFieldOptions(filter)) {
    const parts = option.value.split("/");
    const name = parts.at(-1);
    const providerKind = parts.at(-2)?.toLowerCase() as
      | WorkloadKind
      | undefined;
    const namespace =
      parts.length > 2 ? parts.slice(0, -2).join("/") : undefined;
    if (!name || !providerKind || !requested.has(providerKind)) continue;
    result[providerKind]?.push({ name, ...(namespace ? { namespace } : {}) });
  }
  return result;
}

function labelOptionGroups(
  options: ReturnType<typeof lookupOptionsToFieldOptions>,
) {
  const grouped = new Map<string, typeof options>();
  for (const option of options) {
    const separator = option.value.indexOf("=");
    if (separator <= 0) continue;
    const key = option.value.slice(0, separator);
    const value = option.value.slice(separator + 1);
    const values = grouped.get(key) ?? [];
    values.push({ ...option, label: value || option.label });
    grouped.set(key, values);
  }
  return Array.from(grouped, ([groupKey, groupOptions]) => ({
    groupKey,
    label: groupKey,
    options: groupOptions,
  }));
}

type PlainTextClickyNode = {
  plain?: string;
  text?: string;
  children?: PlainTextClickyNode[];
  tooltip?: { plain?: string; text?: string };
};

function clickyNodeToPlainText(
  node: PlainTextClickyNode | null | undefined,
): string {
  if (node == null) return "";
  if (node.plain) return node.plain;
  if (node.text) return node.text;
  return (node.children ?? [])
    .map((child) => clickyNodeToPlainText(child))
    .join("");
}
