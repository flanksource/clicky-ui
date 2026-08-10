import type { ReactNode } from "react";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import type { DataTableFilterSelection } from "../data-table-filter-values";
import type {
  DataTableFilterLookupRequest,
  DataTableFilterLookupResult,
  DataTableServerColumn,
} from "../data-table-server-filters";
import type { QueryBrowserCompletion } from "./QueryBrowser.completion";
import type { QueryBrowserLanguage } from "./QueryBrowser.editor";

export type QueryBrowserPagination = {
  mode: "offset" | "cursor";
  limit: number;
  offset?: number;
  cursor?: string;
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
  totalRelation: "eq" | "gte" | "unknown";
  consistency: "live" | "snapshot";
};

export type QueryBrowserDiagnostics = {
  provider: string;
  request: {
    query?: string;
    arguments?: unknown[];
    options?: Record<string, unknown>;
    details?: Record<string, unknown>;
  };
  response?: {
    durationMs?: number;
    returnedRows?: number;
    details?: Record<string, unknown>;
    preview?: string;
    contentType?: string;
    truncated?: boolean;
  };
  error?: string;
};

export class QueryBrowserExecutionError extends Error {
  constructor(
    message: string,
    readonly diagnostics?: QueryBrowserDiagnostics,
  ) {
    super(message);
    this.name = "QueryBrowserExecutionError";
  }
}

export type QueryBrowserResult = {
  rows?: Record<string, unknown>[];
  columns?: DataTableServerColumn[];
  affectedRows?: number;
  durationMs?: number;
  message?: string;
  truncated?: boolean;
  limit?: number;
  metadata?: Record<string, unknown>;
  pagination?: QueryBrowserPagination;
  diagnostics?: QueryBrowserDiagnostics;
};

export type QueryBrowserRequest = {
  query: string;
  options: Record<string, unknown>;
  filters?: DataTableFilterSelection;
  columns?: DataTableServerColumn[];
  pagination?: { limit: number; offset?: number; cursor?: string };
  debug?: boolean;
};

export type QueryBrowserFilterLookupRequest = DataTableFilterLookupRequest & {
  query: string;
  options: Record<string, unknown>;
  filters: DataTableFilterSelection;
  columns?: DataTableServerColumn[];
};

export type QueryBrowserFilterLookup = (
  request: QueryBrowserFilterLookupRequest,
) => Promise<DataTableFilterLookupResult>;

export type QueryBrowserResultContext = {
  result: QueryBrowserResult;
  defaultView: ReactNode;
};

export type QueryBrowserProps = {
  id: string;
  title?: string;
  language?: QueryBrowserLanguage;
  initialQuery?: string;
  queryLabel?: string;
  optionsSchema?: JsonSchemaObject;
  initialOptions?: Record<string, unknown>;
  completion?: QueryBrowserCompletion;
  onQueryChange?: (query: string) => void;
  onOptionsChange?: (options: Record<string, unknown>) => void;
  navigator?: ReactNode;
  execute: (request: QueryBrowserRequest) => Promise<QueryBrowserResult>;
  lookupFilterValues?: QueryBrowserFilterLookup;
  renderResults?: (context: QueryBrowserResultContext) => ReactNode;
  className?: string;
};
