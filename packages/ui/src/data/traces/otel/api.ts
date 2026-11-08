import type { JsonSchemaObject } from "../../../components";

export type Span = {
  traceId: string;
  spanId: string;
  parentId?: string;
  service: string;
  operation: string;
  kind?: string;
  startedAt: string;
  durationMs: number;
  status: string;
  attributes?: Record<string, unknown>;
  resource?: Record<string, unknown>;
  otlp?: Record<string, unknown>;
};
export type Summary = {
  traceId: string;
  service: string;
  operation: string;
  startedAt: string;
  durationMs: number;
  spanCount: number;
  errors: number;
  services: string[];
};
export interface Trace {
  summary: Summary;
  spans: Span[];
  missingParents: string[];
}
/** The traces of one root operation in the window (tracequery.OperationStats). */
export interface OperationStats {
  operation: string;
  count: number;
  singleSpan?: boolean;
  p50Ms: number;
  p95Ms: number;
}
export interface SearchResult {
  traces: Summary[];
  total: number;
  services: string[];
  /** Every filter but the operation and span-count ones applied, by root operation: the root-operation filter's options. */
  rootOperations: OperationStats[];
  /** key=value suggestions from those traces' root spans, most frequent first. */
  attributes: { value: string; count: number }[];
}
export interface Source {
  id: string;
  name: string;
  type: string;
}
/** A filter's values, each included or excluded (tracequery.Modes). */
export type Modes = Record<string, "include" | "exclude">;
export const MODE_FILTERS = ["services", "operations", "statuses", "attributes"] as const;
export type ModeFilter = (typeof MODE_FILTERS)[number];
export type SearchValues = Record<string, unknown> & {
  source?: string | undefined;
  run?: string | undefined;
  index?: string | undefined;
  format?: string | undefined;
  services?: Modes | undefined;
  /** Root operations. */
  operations?: Modes | undefined;
  statuses?: Modes | undefined;
  /** key, key=value or key=prefix* expressions. */
  attributes?: Modes | undefined;
  minSpans?: number | undefined;
  traceId?: string | undefined;
  lookback?: string | undefined;
  from?: string | undefined;
  until?: string | undefined;
  minDuration?: string | undefined;
  maxDuration?: string | undefined;
  limit?: number | undefined;
  /** Matching traces to skip, newest first: the page's start. */
  offset?: number | undefined;
};
export interface SearchForm {
  schema: JsonSchemaObject;
  defaults: SearchValues;
}
export function searchParams(value: SearchValues): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value))
    if (
      item !== undefined && item !== null && item !== "" &&
      !(typeof item === "object" && Object.keys(item).length === 0)
    )
      params.set(
        key,
        typeof item === "object" ? JSON.stringify(item) : String(item),
      );
  return params;
}

function parseModes(key: string, text: string): Modes {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.values(value).some(mode => mode !== "include" && mode !== "exclude"))
    throw new Error(`${key} must be a JSON object of values to include or exclude`);
  return value as Modes;
}

export function readSearchValues(params: URLSearchParams = new URLSearchParams(window.location.search)): SearchValues {
  const result: SearchValues = {};
  for (const [key, value] of params) {
    if (key === "span") continue;
    if ((MODE_FILTERS as readonly string[]).includes(key)) result[key] = parseModes(key, value);
    else if (key === "limit" || key === "offset" || key === "minSpans") {
      if (!/^\d+$/.test(value)) throw new Error(`${key} must be a whole number, not ${JSON.stringify(value)}`);
      result[key] = Number(value);
    } else result[key] = value;
  }
  return result;
}

export const duration = (ms: number) =>
  ms >= 1000
    ? `${(ms / 1000).toFixed(2)} s`
    : ms >= 10
      ? `${ms.toFixed(0)} ms`
      : ms >= 1
        ? `${ms.toFixed(1)} ms`
        : `${(ms * 1000).toFixed(0)} µs`;
