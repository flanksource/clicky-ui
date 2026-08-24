import type { ReactNode } from "react";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import type { ErrorDiagnostics } from "../diagnostics/error-diagnostics";
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
    /** The statement the provider issued, with every runtime filter folded in. */
    query?: string;
    /** The same query before the provider composed the run onto it. */
    rendered?: string;
    connection?: string;
    arguments?: unknown[];
    options?: Record<string, unknown>;
    details?: Record<string, unknown>;
    /** The HTTP exchange the request rode on, for a provider that speaks HTTP. */
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  };
  response?: {
    durationMs?: number;
    returnedRows?: number;
    pages?: number;
    details?: Record<string, unknown>;
    preview?: string;
    contentType?: string;
    truncated?: boolean;
    status?: number;
    headers?: Record<string, string>;
  };
  error?: string;
};

export class QueryBrowserExecutionError extends Error {
  constructor(
    message: string,
    readonly diagnostics?: QueryBrowserDiagnostics,
    readonly errorDetails?: ErrorDiagnostics,
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

// The optional props admit an explicit `undefined` — the same convention the
// rest of the package follows (see data/CodeBlock.tsx). Passing a
// possibly-absent value straight through, `className={maybe}`, is ordinary
// React, and under exactOptionalPropertyTypes a bare `?:` rejects it.
export type QueryBrowserProps = {
  id: string;
  title?: string | undefined;
  language?: QueryBrowserLanguage | undefined;
  initialQuery?: string | undefined;
  queryLabel?: string | undefined;
  allowEmptyQuery?: boolean | undefined;
  optionsSchema?: JsonSchemaObject | undefined;
  initialOptions?: Record<string, unknown> | undefined;
  completion?: QueryBrowserCompletion | undefined;
  onQueryChange?: ((query: string) => void) | undefined;
  onOptionsChange?: ((options: Record<string, unknown>) => void) | undefined;
  navigator?: ReactNode | undefined;
  execute: (request: QueryBrowserRequest) => Promise<QueryBrowserResult>;
  lookupFilterValues?: QueryBrowserFilterLookup | undefined;
  renderResults?: ((context: QueryBrowserResultContext) => ReactNode) | undefined;
  className?: string | undefined;
};
