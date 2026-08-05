import { useMemo } from "react";
import { resolveLookupScope } from "../components/form-lookup-context";
import type { LookupFetcher } from "../components/json-schema-form-types";
import { lookupOptionsToFieldOptions } from "./formMetadata";
import type { OperationsApiClient } from "./useOperations";

/**
 * Resolves a form's `x-clicky-lookup` fields against the live API: fetches the
 * referenced entity's lookup options (server-side search) and scopes them by a
 * sibling field.
 *
 * `JsonSchemaForm` always installs a lookup provider, with `undefined` when it
 * is given no fetcher — so an outer provider is shadowed rather than inherited.
 * Every form that renders lookup fields therefore has to pass one of its own,
 * which is why this is a shared hook rather than one form's private helper.
 *
 * Returns undefined when the client exposes no lookup endpoint; the field then
 * degrades to a free-text combobox.
 */
export function useOperationLookupFetcher(
  client: OperationsApiClient,
): LookupFetcher | undefined {
  return useMemo(() => {
    const lookup = client.lookupFilterOptions;
    if (!lookup) return undefined;
    return async ({ descriptor, query, rootValue }) => {
      const extra = resolveLookupScope(descriptor, rootValue);
      const filter = await lookup.call(
        client,
        descriptor.url,
        "GET",
        descriptor.filter,
        query,
        extra,
      );
      return lookupOptionsToFieldOptions(filter).map((option) => ({
        value: option.value,
        label: option.label,
      }));
    };
  }, [client]);
}
