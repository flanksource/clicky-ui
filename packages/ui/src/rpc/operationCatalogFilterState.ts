import { useEffect, useMemo, useState } from "react";
import type { ParameterValues, ParameterValuesSetter } from "./formMetadata";
import {
  readOperationFiltersFromUrl,
  writeOperationFiltersToUrl,
} from "./operationCatalogUrl";
import type { OpenAPIParameter } from "./types";

export type OperationCatalogUrlState = false | { prefix: string };

export type OperationCatalogFilterState = {
  /** The FilterBar's own state — never includes a locked param. */
  filters: ParameterValues;
  setFilters: ParameterValuesSetter;
  /**
   * `filters` with `lockedValues` merged in. This is what every list request,
   * filter lookup and export/download URL is built from — locked values
   * always win, and a param a host has locked can never be overridden by
   * anything the FilterBar itself could produce.
   */
  effectiveFilters: ParameterValues;
};

/**
 * useOperationCatalogFilterState owns OperationCatalog's filter state and its
 * two host-controlled overlays:
 *
 * - `lockedValues` are merged into every effective request but are never
 *   read from, or written to, the URL — they are the host's, not the
 *   reader's, to carry across a reload or a shared link.
 * - `urlState` decides whether (and under what key) the remaining, editable
 *   filters round-trip through the URL at all: unset keeps today's
 *   unprefixed behaviour, `false` turns it off, and `{ prefix }` namespaces
 *   every key so a catalog embedded in a host route (its own `?step=&tab=`)
 *   never collides with it.
 */
export function useOperationCatalogFilterState({
  listParameters,
  lockedValues,
  urlState,
}: {
  listParameters: OpenAPIParameter[];
  lockedValues: ParameterValues;
  urlState: OperationCatalogUrlState | undefined;
}): OperationCatalogFilterState {
  // Read as primitives rather than the `urlState` object itself so an inline
  // object literal from the host does not retrigger the URL-write effect on
  // every render.
  const urlStateDisabled = urlState === false;
  const urlStatePrefix = urlState ? urlState.prefix : undefined;

  const [filters, setFilters] = useState<ParameterValues>(() =>
    urlStateDisabled ? {} : readOperationFiltersFromUrl(urlStatePrefix)
  );

  const effectiveFilters = useMemo(
    () => ({ ...filters, ...lockedValues }),
    [filters, lockedValues]
  );

  useEffect(() => {
    if (urlStateDisabled) return;
    writeOperationFiltersToUrl(
      filters,
      listParameters
        .map((parameter) => parameter.name)
        .filter(
          (name) => !Object.prototype.hasOwnProperty.call(lockedValues, name)
        ),
      urlStatePrefix
    );
  }, [filters, listParameters, lockedValues, urlStateDisabled, urlStatePrefix]);

  return { filters, setFilters, effectiveFilters };
}
