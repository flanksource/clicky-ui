import { useMemo } from "react";
import {
  lookupOptionsToFieldOptions,
  packParameterValues,
  type LookupSearch,
  type ParameterValues,
} from "./formMetadata";
import type { OpenAPIParameter } from "./types";
import type { OperationsApiClient } from "./useOperations";

/**
 * Resolves a filter bar's server-side option search against the live API.
 *
 * A lookup response carries only the head of a large distinct set, flagged
 * `truncated`. This is how everything past that head is reached: the filter
 * control calls back (debounced) as the user types, and the matching options are
 * fetched with `__lookup_filter` + `__lookup_q`.
 *
 * The current filter values travel with the request, so a search stays scoped to
 * the siblings already selected — the same cascading the head request gets.
 *
 * Returns undefined when the client exposes no per-filter lookup, which leaves
 * the control filtering its head set in the browser.
 */
export function useOperationFilterSearch(
  client: OperationsApiClient,
  endpoint: { path: string; method: string } | undefined,
  values: ParameterValues,
  parameters: OpenAPIParameter[],
): LookupSearch | undefined {
  const lookup = client.lookupFilterOptions;
  return useMemo(() => {
    if (!lookup || !endpoint) return undefined;
    return async (filterKey: string, query: string) => {
      const filter = await lookup.call(
        client,
        endpoint.path,
        endpoint.method,
        filterKey,
        query,
        packParameterValues(values, parameters),
      );
      return lookupOptionsToFieldOptions(filter);
    };
  }, [client, lookup, endpoint?.path, endpoint?.method, values, parameters]);
}
