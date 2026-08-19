import type { ClickyFilterShape, OpenAPIParameter } from "./types";

/**
 * Resolves a parameter's filter control shape from the spec's shared component
 * map, following the `$ref` the server stamped on it.
 *
 * A control's shape belongs to the spec, not to a lookup response: the spec is
 * fetched once and never varies with the values currently selected, so a filter
 * bar built from it renders the right control on first paint and holds it while
 * fresh options are in flight. A parameter that names no shape — a plain string
 * param — resolves to undefined and is rendered as the text input it is.
 *
 * A ref that does not resolve is treated the same as an absent one rather than
 * throwing: the spec is remote input, and one stale pointer should cost that
 * single control its chrome, not the whole bar.
 */
export function resolveFilterShape(
  param: OpenAPIParameter,
  components: Record<string, ClickyFilterShape> | undefined,
): ClickyFilterShape | undefined {
  const ref = param["x-clicky-lookup"]?.$ref;
  if (!ref || !components) return undefined;
  const name = ref.split("/").pop();
  return name ? components[name] : undefined;
}

/**
 * Indexes every parameter's shape by name, so a caller that consults shapes
 * repeatedly resolves each ref once.
 */
export function filterShapesByName(
  parameters: OpenAPIParameter[],
  components: Record<string, ClickyFilterShape> | undefined,
): Map<string, ClickyFilterShape | undefined> {
  return new Map(
    parameters.map((param) => [param.name, resolveFilterShape(param, components)]),
  );
}
