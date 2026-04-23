import type { ClickyNode } from "../data/Clicky";

export interface ExecutionRequest {
  args?: string[];
  flags?: Record<string, string>;
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

export interface OpenAPIParameter {
  name: string;
  in: "query" | "path" | "header";
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
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
}

export interface ClickyOperationMeta {
  surface: string;
  verb: "list" | "get" | "create" | "update" | "delete" | "action";
  scope: "collection" | "entity";
  actionName?: string;
  idParam?: string;
  supportsLookup?: boolean;
  supportsFilterMode?: boolean;
}

export type OperationLookupFilterType = "bool" | "number" | "date" | "from" | "to";

export interface OperationLookupFilter {
  label?: string;
  options?: Record<string, ClickyNode>;
  selected?: Record<string, ClickyNode>;
  multi?: boolean;
  type?: OperationLookupFilterType;
}

export interface OperationLookupResponse {
  filters: Record<string, OperationLookupFilter>;
}

export function isPositionalParam(p: OpenAPIParameter): boolean {
  return (
    p.name === "args" ||
    p.description?.toLowerCase().includes("positional argument") === true
  );
}
