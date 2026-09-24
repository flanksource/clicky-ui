import { filterShapesByName } from "./filterShapes";
import { clickyNodeText } from "./rowNavigation";
import type {
  ClickyFilterShape,
  OpenAPIParameter,
  OperationLookupResponse,
} from "./types";

export type LockedScopeEntry = { key: string; label: string; value: string };

/**
 * lockedScopeEntries names each locked parameter for the picker's read-only
 * "Scoped to" line. The label is the host's (`lockedLabels`), else the filter
 * label the catalog itself would show (spec shape, then lookup), else the raw
 * key; the value is its lookup option label when the lookup has one (a GUID
 * reads as the product it names), else the raw value.
 *
 * A locked key the list operation does not declare is an error: the catalog
 * only sends declared parameters, so the list would silently ignore the scope
 * the reader is told it is in.
 */
export function lockedScopeEntries({
  lockedValues,
  lockedLabels,
  parameters,
  lookup,
  components,
}: {
  lockedValues: Record<string, string>;
  lockedLabels?: Record<string, string> | undefined;
  parameters: OpenAPIParameter[];
  lookup?: OperationLookupResponse | undefined;
  components?: Record<string, ClickyFilterShape> | undefined;
}): LockedScopeEntry[] {
  const shapes = filterShapesByName(parameters, components);
  return Object.entries(lockedValues).map(([key, value]) => {
    if (!shapes.has(key)) {
      throw new Error(
        `lockedValues.${key} is not a parameter of the list operation (declared: ${[...shapes.keys()].join(", ")})`,
      );
    }
    const filter = lookup?.filters[key];
    const option = filter?.options?.[value] ?? filter?.selected?.[value];
    return {
      key,
      label: lockedLabels?.[key] ?? shapes.get(key)?.label ?? filter?.label ?? key,
      value: (option && clickyNodeText(option)) || value,
    };
  });
}

/** Keeps the row of every picked id, from this page or one read earlier. */
export function reconcilePickedRows<Row>(
  previous: Record<string, Row>,
  ids: readonly string[],
  loaded: ReadonlyMap<string, Row>,
): Record<string, Row> {
  return Object.fromEntries(
    ids.flatMap((id) => {
      const row = loaded.get(id) ?? previous[id];
      return row ? [[id, row] as const] : [];
    }),
  );
}
