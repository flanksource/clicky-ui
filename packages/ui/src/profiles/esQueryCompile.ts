/**
 * The DSL a specification compiles to. The server compiles it — the same code
 * path a query runs through — so the preview is the query, not a re-derivation
 * of it that could drift.
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchJSON } from "./connectionBrowserModel";
import type { EsSearch } from "./esQueryBuilderModel";

export type EsCompileResult = { query: string; size: number; from: number };

export type EsCompilation = {
  query: string;
  size?: number | undefined;
  from?: number | undefined;
  /** The compiler's own message for a specification it rejected. */
  error?: string | undefined;
  loading: boolean;
};

/**
 * EsCompileInput is the specification together with the parameter values it
 * compiles against: the server binds a {param:…} operand from them and
 * interpolates a {{.params.…}} one, so both need real values to preview.
 */
export type EsCompileInput = {
  search: EsSearch;
  params?: Record<string, unknown>;
  roles?: Record<string, string>;
};

export type EsCompileRequest = EsCompileInput & {
  baseUrl: string;
  enabled?: boolean;
  debounceMs?: number;
};

/** compileRequestBody is what POST /compile takes, with the empty parts left off. */
export function compileRequestBody(input: EsCompileInput): string {
  const { search, params, roles } = input;
  return JSON.stringify({
    search,
    ...(params && Object.keys(params).length ? { params } : {}),
    ...(roles && Object.keys(roles).length ? { roles } : {}),
  });
}

export function errorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  return error instanceof Error ? error.message : String(error);
}

/**
 * useCompiledSearch compiles the specification as it is edited. The body is
 * debounced rather than the request, so an edit that lands back on a body
 * already compiled costs nothing.
 */
export function useCompiledSearch(input: EsCompileRequest): EsCompilation {
  const { baseUrl, enabled = true, debounceMs = 250 } = input;
  const body = compileRequestBody(input);
  const [settled, setSettled] = useState(body);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(body), debounceMs);
    return () => clearTimeout(timer);
  }, [body, debounceMs]);

  const compiled = useQuery({
    queryKey: ["es-compile", baseUrl, settled],
    queryFn: () =>
      fetchJSON<EsCompileResult>(`${baseUrl}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: settled,
      }),
    enabled: enabled && baseUrl !== "",
    retry: 0,
  });

  return {
    query: compiled.data?.query ?? "",
    ...(compiled.data ? { size: compiled.data.size, from: compiled.data.from } : {}),
    ...(compiled.error ? { error: errorMessage(compiled.error) } : {}),
    loading: compiled.isFetching,
  };
}
