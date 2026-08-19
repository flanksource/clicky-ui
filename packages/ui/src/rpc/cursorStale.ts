import { useEffect } from "react";

import { OperationsApiClientError } from "./apiClient";
import type { ParameterValues, ParameterValuesSetter } from "./formMetadata";
import type { OpenAPIParameter } from "./types";

/** The server's code for a cursor that no longer names a position in this query. */
const CURSOR_STALE_CODE = "cursor_stale";

// isCursorStale reads the structured code rather than matching the message,
// which is prose the server is free to reword.
export function isCursorStale(error: unknown): boolean {
  if (!(error instanceof OperationsApiClientError)) return false;
  const data = error.responseData;
  if (typeof data !== "object" || data === null) return false;
  return (data as { code?: unknown }).code === CURSOR_STALE_CODE;
}

export function cursorParameterName(
  parameters: readonly OpenAPIParameter[],
): string | undefined {
  return parameters.find((parameter) => parameter["x-clicky"]?.role === "cursor")?.name;
}

/**
 * useCursorStaleRecovery restarts a walk whose position the server has refused.
 *
 * A stale cursor is always recoverable — the query is fine, only the position is
 * gone — so surfacing it as an error panel strands the user on a page they
 * cannot leave: the cursor lives in the URL as well as in the form, so a reload
 * replays the same rejected request. Clearing it through `setValues` is what
 * rewrites both, and the query re-runs from the first page on its own.
 *
 * Guarded on a cursor actually being set, so a server that answered
 * `cursor_stale` to a request carrying none cannot spin.
 */
export function useCursorStaleRecovery({
  error,
  parameters,
  values,
  setValues,
}: {
  error: unknown;
  parameters: readonly OpenAPIParameter[];
  values: ParameterValues;
  setValues: ParameterValuesSetter;
}) {
  useEffect(() => {
    if (!isCursorStale(error)) return;
    const name = cursorParameterName(parameters);
    if (!name || !values[name]) return;
    setValues((current) => (current[name] ? { ...current, [name]: "" } : current));
  }, [error, parameters, values, setValues]);
}
