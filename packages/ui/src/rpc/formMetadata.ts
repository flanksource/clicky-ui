import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  FilterBarFilter,
  FilterBarMultiFilterMode,
  FilterBarRangeProps,
  FilterBarSearchProps,
} from "../components/FilterBar";
import type { DataTablePagination } from "../data/DataTable";
import type {
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
  offsetParam: string;
  limitValue: string;
  offsetValue: string;
  setLimit: (next: string) => void;
  setOffset: (next: string) => void;
};

export type ParameterFormConfig = {
  filters: FilterBarFilter[];
  search?: FilterBarSearchProps;
  timeRange?: FilterBarRangeProps;
  pagination?: ParameterPagination;
};
export type ParameterFormOptions = {
  includeLocations?: OpenAPIParameter["in"][];
  lookup?: OperationLookupResponse | undefined;
  lockedValues?: ParameterValues | undefined;
  hideLocked?: boolean;
};

export function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultValueForParameter(param: OpenAPIParameter, method: string): string {
  if (method.toUpperCase() === "GET" && param.in === "query" && !param.required) {
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
    parameters.map((param) => [param.name, defaultValueForParameter(param, method)]),
  );
  return { ...values, ...initialValues, ...lockedValues };
}

export function dataTablePaginationFromForm(
  pagination: ParameterPagination | undefined,
  response: Pick<ExecutionResponse, "pagination"> | null | undefined,
): DataTablePagination | undefined {
  if (!pagination) return undefined;

  const pageSize = positiveInt(pagination.limitValue) ?? response?.pagination?.limit ?? 25;
  const offset = nonNegativeInt(pagination.offsetValue) ?? response?.pagination?.offset ?? 0;
  const page = Math.floor(offset / pageSize);

  return {
    page,
    pageSize,
    ...(response?.pagination?.total !== undefined ? { total: response.pagination.total } : {}),
    onPageChange: (next: number) => {
      if (positiveInt(pagination.limitValue) == null) {
        pagination.setLimit(String(pageSize));
      }
      pagination.setOffset(String(Math.max(next, 0) * pageSize));
    },
    onPageSizeChange: (next: number) => {
      pagination.setLimit(String(next));
      pagination.setOffset("0");
    },
  };
}

export function pruneParameterValues(values: ParameterValues) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

export function packParameterValues(
  values: ParameterValues,
  parameters: OpenAPIParameter[],
): ParameterValues {
  const positionalNames = new Set(
    parameters
      .filter((param) => param.in !== "path" && isPositionalParam(param))
      .map((p) => p.name),
  );
  const params: ParameterValues = {};
  const args: string[] = [];

  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
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

export function parametersToFormConfig(
  parameters: OpenAPIParameter[],
  values: ParameterValues,
  setValues: ParameterValuesSetter,
  options: ParameterFormOptions = {},
): ParameterFormConfig {
  const emitFilters: FilterBarFilter[] = [];
  const lookupFilters = options.lookup?.filters ?? {};
  const includeLocations = new Set(options.includeLocations ?? ["path", "query", "header"]);
  const lockedValues = options.lockedValues ?? {};
  const hideLocked = options.hideLocked ?? false;

  // Pull limit/offset out of the filter loop entirely — they drive pagination,
  // not filter pills. Roles come from server-side `paramRole` (see
  // clicky/rpc/openapi.go); the older "named limit on a GET" heuristic is
  // intentionally not duplicated here so the server stays the single source
  // of truth for parameter classification.
  const limitParam = parameters.find((p) => p["x-clicky"]?.role === "limit");
  const offsetParam = parameters.find((p) => p["x-clicky"]?.role === "offset");
  const paginationOmitNames = new Set<string>();
  if (limitParam) paginationOmitNames.add(limitParam.name);
  if (offsetParam) paginationOmitNames.add(offsetParam.name);

  // The search-role param drives the FilterBar's dedicated search input rather
  // than a filter chip; pull it out of the chip loop the same way pagination is.
  const searchParam = parameters.find(
    (p) => p["x-clicky"]?.role === "search" && includeLocations.has(p.in),
  );
  const omitNames = new Set(paginationOmitNames);
  if (searchParam) omitNames.add(searchParam.name);

  // Time-range first looks for server-stamped roles, then falls back to the
  // existing lookup-driven "from"/"to" detection so older specs keep working.
  const roleRangeStart = parameters.find((p) => p["x-clicky"]?.role === "time-from");
  const roleRangeEnd = parameters.find((p) => p["x-clicky"]?.role === "time-to");
  const rangeStart =
    roleRangeStart ??
    parameters.find(
      (param) =>
        includeLocations.has(param.in) &&
        param.in === "query" &&
        lookupFilters[param.name]?.type === "from",
    );
  const rangeEnd =
    roleRangeEnd ??
    parameters.find(
      (param) =>
        includeLocations.has(param.in) &&
        param.in === "query" &&
        lookupFilters[param.name]?.type === "to",
    );
  const hasTimeRange = rangeStart != null && rangeEnd != null;

  for (const param of parameters) {
    if (!includeLocations.has(param.in)) continue;
    if (omitNames.has(param.name)) continue;
    if (hasTimeRange && (param.name === rangeStart?.name || param.name === rangeEnd?.name)) {
      continue;
    }

    const disabled = Object.prototype.hasOwnProperty.call(lockedValues, param.name);
    if (disabled && hideLocked) continue;
    const value = disabled ? (lockedValues[param.name] ?? "") : (values[param.name] ?? "");
    const label = lookupFilters[param.name]?.label ?? titleCase(param.name);
    // Only an explicit placeholder is rendered — never synthesize one. The
    // field already carries `label`, so a fallback placeholder is redundant
    // and generic defaults (e.g. "value-1, value-2") read as fake data.
    const placeholder = parameterPlaceholder(param);
    const placeholderProp = placeholder !== undefined ? { placeholder } : {};
    const onChange = (next: string | boolean) => {
      if (disabled) return;
      const stringValue = typeof next === "boolean" ? (next ? "true" : "false") : next;
      setValues((current) => ({ ...current, [param.name]: stringValue }));
    };

    const schema = param.schema;
    const lookupFilter = lookupFilters[param.name];

    if (lookupFilter?.type === "multi-filter" && param.in === "query") {
      emitFilters.push({
        key: param.name,
        kind: "multi",
        label,
        value: parseMultiFilterValue(value),
        disabled,
        options: lookupOptionsToFieldOptions(lookupFilter),
        onChange: (next) =>
          setValues((current) => ({
            ...current,
            [param.name]: serializeMultiFilterValue(next),
          })),
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

    if (lookupFilter?.type === "bool" || schema?.type === "boolean") {
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

    if (lookupFilter != null && param.in === "query") {
      if (lookupFilter.multi) {
        emitFilters.push({
          key: param.name,
          kind: "lookup-multi",
          label,
          value: splitCommaValues(value),
          disabled,
          options: lookupOptionsToFieldOptions(lookupFilter),
          ...placeholderProp,
          onChange: (next) =>
            setValues((current) => ({ ...current, [param.name]: next.join(",") })),
        });
        continue;
      }

      emitFilters.push({
        key: param.name,
        kind: "lookup",
        label,
        value,
        disabled,
        options: lookupOptionsToFieldOptions(lookupFilter),
        ...placeholderProp,
        inputType:
          lookupFilter.type === "number"
            ? "number"
            : lookupFilter.type === "date"
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
  if (searchParam) {
    const searchDisabled = Object.prototype.hasOwnProperty.call(lockedValues, searchParam.name);
    const searchValue = searchDisabled
      ? (lockedValues[searchParam.name] ?? "")
      : (values[searchParam.name] ?? "");
    const searchPlaceholder = parameterPlaceholder(searchParam);
    config.search = {
      value: searchValue,
      onChange: (next) => {
        if (searchDisabled) return;
        setValues((current) => ({ ...current, [searchParam.name]: next }));
      },
      ...(searchPlaceholder ? { placeholder: searchPlaceholder } : {}),
      ariaLabel: lookupFilters[searchParam.name]?.label ?? titleCase(searchParam.name),
    };
  }
  if (limitParam && offsetParam) {
    config.pagination = {
      limitParam: limitParam.name,
      offsetParam: offsetParam.name,
      limitValue: values[limitParam.name] ?? "",
      offsetValue: values[offsetParam.name] ?? "",
      setLimit: (next) => setValues((current) => ({ ...current, [limitParam.name]: next })),
      setOffset: (next) => setValues((current) => ({ ...current, [offsetParam.name]: next })),
    };
  }
  if (hasTimeRange && rangeStart != null && rangeEnd != null) {
    const rangeStartMeta = lookupFilters[rangeStart.name];
    const rangeEndMeta = lookupFilters[rangeEnd.name];
    const rangeMeta = rangeStartMeta ?? rangeEndMeta;
    config.timeRange = {
      from: values[rangeStart.name] ?? "",
      to: values[rangeEnd.name] ?? "",
      onApply: (from, to) =>
        setValues((current) => ({
          ...current,
          [rangeStart.name]: from,
          [rangeEnd.name]: to,
        })),
      ...(rangeMeta?.presets ? { presets: rangeMeta.presets } : {}),
      timeEnabled: rangeMeta?.timeEnabled ?? false,
      ...(rangeMeta?.timeZone ? { timeZone: rangeMeta.timeZone } : {}),
      ...(rangeMeta?.timeZones ? { timeZones: rangeMeta.timeZones } : {}),
      ...(rangeStart.description ? { fromPlaceholder: rangeStart.description } : {}),
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

export function parseMultiFilterValue(value: string): Record<string, FilterBarMultiFilterMode> {
  const parsed: Record<string, FilterBarMultiFilterMode> = {};
  for (const item of splitCommaValues(value)) {
    if (item.startsWith("!") && item.length > 1) {
      parsed[item.slice(1)] = "exclude";
    } else {
      parsed[item] = "include";
    }
  }
  return parsed;
}

export function serializeMultiFilterValue(value: Record<string, FilterBarMultiFilterMode>): string {
  return Object.entries(value)
    .flatMap(([key, mode]) => {
      if (mode === "include") return [key];
      if (mode === "exclude") return [`!${key}`];
      return [];
    })
    .join(",");
}

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

type PlainTextClickyNode = {
  plain?: string;
  text?: string;
  children?: PlainTextClickyNode[];
  tooltip?: { plain?: string; text?: string };
};

function clickyNodeToPlainText(node: PlainTextClickyNode | null | undefined): string {
  if (node == null) return "";
  if (node.plain) return node.plain;
  if (node.text) return node.text;
  return (node.children ?? []).map((child) => clickyNodeToPlainText(child)).join("");
}
