import type { QueryBrowserDiagnostics } from "../query-browser/QueryBrowser.types";

/** Media type a result URL answers with when asked what it runs. */
export const QUERY_INFO_CONTENT_TYPE = "application/info+json";

/**
 * What a result URL says about itself: the query its backend was actually sent,
 * the arguments bound into it, how long it took and what came back.
 *
 * A table shows rows, never the query behind them — the server renders that from
 * parameters and filters which only exist at execution time. This is the answer
 * to "what did this actually run", and it is the same answer whether the run
 * succeeded or failed.
 */
export type QueryExecutionInfo = {
  profile?: string;
  provider?: string;
  connection?: string;
  url?: string;
  params?: Record<string, unknown>;
  mode?: string;
  rows?: number;
  durationMs?: number;
  headers?: Record<string, string>;
  diagnostics?: QueryBrowserDiagnostics;
  /** Set when the execution failed; its diagnostics still describe the query. */
  error?: string;
};

/** Loads the info for one surface — a URL to ask, or a console's own re-run. */
export type QueryInfoLoader = () => Promise<QueryExecutionInfo>;

/**
 * buildQueryInfoUrl marks a result URL as a question about itself rather than a
 * request for its rows. The marker rides in the query string so the URL stays
 * one a browser can follow, and every parameter the table sent — filters, paging,
 * the lot — is carried along unchanged: an info request for a different page
 * would describe a different query.
 */
export function buildQueryInfoUrl(url: string): string {
  if (/[?&]__info=/.test(url)) return url;
  const hashAt = url.indexOf("#");
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  return `${base}${base.includes("?") ? "&" : "?"}__info=true${hash}`;
}

/**
 * fetchQueryInfo asks a result URL what it runs.
 *
 * A failed execution is not a failed request: the server answers it with the
 * same document plus the error, because a query that broke is the one most worth
 * reading. Only a response that carries no document at all throws.
 */
export async function fetchQueryInfo(url: string): Promise<QueryExecutionInfo> {
  const response = await fetch(buildQueryInfoUrl(url), {
    headers: { Accept: QUERY_INFO_CONTENT_TYPE },
  });
  const body = await response.text();
  const parsed = parseInfoBody(body);
  if (response.ok) {
    if (!parsed) throw new Error(`${url} did not answer with query details`);
    return parsed;
  }
  if (!parsed) {
    throw new Error(`${url} answered ${response.status} ${response.statusText}`);
  }
  return parsed;
}

type ExecutionErrorBody = {
  code?: string;
  message?: string;
  error?: string;
  diagnostics?: QueryBrowserDiagnostics;
};

function parseInfoBody(body: string): QueryExecutionInfo | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const info = value as QueryExecutionInfo & ExecutionErrorBody;
  const error = info.error ?? info.message;
  if (!error) return info;
  return { ...info, error };
}
