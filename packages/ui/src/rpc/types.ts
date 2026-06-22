import type { ClickyNode } from "../data/Clicky";
import type { TimeRangePresetGroup } from "../components/TimeRange";

export interface ExecutionRequest {
  args?: string[];
  flags?: Record<string, string>;
}

export interface ExecutionPagination {
  total?: number;
  limit?: number;
  offset?: number;
}

export interface ExecutionResponse {
  success: boolean;
  message?: string;
  output?: string;
  stdout?: string;
  stderr?: string;
  exit_code: number;
  error?: string;
  cli?: string;
  input?: ExecutionRequest;
  contentType?: string;
  requestUrl?: string;
  responseHeaders?: Record<string, string>;
  pagination?: ExecutionPagination;
  blob?: Blob;
  parsed?: unknown;
}

export interface OpenAPISchema {
  type?: string;
  format?: string;
  default?: unknown;
  enum?: unknown[];
  description?: string;
  properties?: Record<string, OpenAPISchema>;
}

// ClickyParameterRole tells the UI which widget owns a parameter:
//   "search"    — render as the FilterBar's dedicated search input
//   "filter"    — render as a FilterBar chip on the DataTable
//   "limit"     — feed into DataTable pagination's pageSize
//   "offset"    — feed into DataTable pagination's page (or skip)
//   "time-from" — left edge of a time-range picker
//   "time-to"   — right edge of a time-range picker
// Set server-side by clicky's converter (see paramRole in clicky/rpc/openapi.go).
export type ClickyParameterRole =
  | "search"
  | "filter"
  | "limit"
  | "offset"
  | "time-from"
  | "time-to";

export interface ClickyParameterMeta {
  role?: ClickyParameterRole;
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "path" | "header";
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
  /** Hint text shown inside the empty input. Distinct from `description`,
   *  which is help text and must NOT be used as a placeholder. */
  placeholder?: string;
  "x-clicky"?: ClickyParameterMeta;
  /** Vendor-extension placeholder, set server-side by clicky's converter.
   *  Takes precedence over `placeholder` when both are present. */
  "x-clicky-placeholder"?: string;
}

/** Resolves the input placeholder for a parameter, drawing ONLY from explicit
 *  placeholder fields — never from `description` (help text). Returns undefined
 *  when no placeholder is declared so callers can apply their own fallback. */
export function parameterPlaceholder(param: OpenAPIParameter): string | undefined {
  return param["x-clicky-placeholder"] ?? param.placeholder;
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: Record<string, { schema?: OpenAPISchema }>;
  };
  responses: Record<string, unknown>;
  "x-clicky"?: ClickyOperationMeta;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; description?: string; version: string };
  paths: Record<string, Record<string, OpenAPIOperation>>;
  tags?: Array<{ name: string; description?: string }>;
  "x-clicky"?: ClickySpecMeta;
}

export interface ResolvedOperation {
  path: string;
  method: string;
  operation: OpenAPIOperation;
}

export interface DomainDefinition {
  key: string;
  title: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export interface ClickySpecMeta {
  surfaces?: ClickySurface[];
}

export interface ClickySurface {
  key: string;
  entity: string;
  title: string;
  parent?: string;
  admin?: boolean;
  description?: string;
  /** Opaque icon name emitted by the backend (x-clicky-icon), resolved to a glyph in the UI. */
  icon?: string;
}

export interface ClickyOperationMeta {
  command?: string;
  surface?: string;
  verb: "list" | "get" | "create" | "update" | "delete" | "action";
  scope: "collection" | "entity";
  actionName?: string;
  idParam?: string;
  supportsLookup?: boolean;
  supportsFilterMode?: boolean;
}

export type OperationLookupFilterType = "bool" | "number" | "date" | "from" | "to" | "multi-filter";

export interface OperationLookupFilter {
  label?: string;
  options?: Record<string, ClickyNode>;
  selected?: Record<string, ClickyNode>;
  multi?: boolean;
  type?: OperationLookupFilterType;
  /** True when `options` is only the head of a larger set (server-side capped). */
  truncated?: boolean;
  /** True distinct count behind a truncated option set; drives "… and N more". */
  total?: number;
  presets?: Array<{ label: string; from: string; to: string } | TimeRangePresetGroup>;
  timeEnabled?: boolean;
  timeZone?: string;
  timeZones?: string[];
}

export interface OperationLookupResponse {
  filters: Record<string, OperationLookupFilter>;
}

export function isPositionalParam(p: OpenAPIParameter): boolean {
  return p.name === "args" || p.description?.toLowerCase().includes("positional argument") === true;
}
