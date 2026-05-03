import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  FilterBarFilter,
  FilterBarMultiFilterMode,
  FilterBarRangeProps,
} from "../components/FilterBar";
import type { OpenAPIParameter, OperationLookupFilter, OperationLookupResponse } from "./types";
import { isPositionalParam } from "./types";

export type ParameterValues = Record<string, string>;
export type ParameterValuesSetter = Dispatch<SetStateAction<ParameterValues>>;
export type ParameterFormConfig = {
  filters: FilterBarFilter[];
  timeRange?: FilterBarRangeProps;
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
  const rangeStart = parameters.find(
    (param) =>
      includeLocations.has(param.in) &&
      param.in === "query" &&
      lookupFilters[param.name]?.type === "from",
  );
  const rangeEnd = parameters.find(
    (param) =>
      includeLocations.has(param.in) &&
      param.in === "query" &&
      lookupFilters[param.name]?.type === "to",
  );
  const hasTimeRange = rangeStart != null && rangeEnd != null;

  for (const param of parameters) {
    if (!includeLocations.has(param.in)) continue;
    if (hasTimeRange && (param.name === rangeStart?.name || param.name === rangeEnd?.name)) {
      continue;
    }

    const disabled = Object.prototype.hasOwnProperty.call(lockedValues, param.name);
    if (disabled && hideLocked) continue;
    const value = disabled ? (lockedValues[param.name] ?? "") : (values[param.name] ?? "");
    const label = lookupFilters[param.name]?.label ?? titleCase(param.name);
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
          placeholder: param.description ?? "value-1, value-2",
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
        placeholder: param.description ?? label,
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
      placeholder: param.description ?? label,
      onChange: (next) => onChange(next),
    });
  }

  const config: ParameterFormConfig = { filters: emitFilters };
  if (hasTimeRange && rangeStart != null && rangeEnd != null) {
    config.timeRange = {
      from: values[rangeStart.name] ?? "",
      to: values[rangeEnd.name] ?? "",
      onApply: (from, to) =>
        setValues((current) => ({
          ...current,
          [rangeStart.name]: from,
          [rangeEnd.name]: to,
        })),
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

function lookupOptionsToFieldOptions(filter: OperationLookupFilter) {
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
