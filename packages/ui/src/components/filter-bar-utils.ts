import type { FilterBarFilter } from "./FilterBar";

// FilterExtension decorates a resolved filter before it renders — the FilterBar
// analogue of JsonSchemaForm's PreExtension. Consumers compose these in array
// order (each sees the prior's output) to stamp domain-specific touches such as
// an entity `icon` keyed on the filter's name, keeping FilterBar domain-agnostic.
export type FilterExtension = (filter: FilterBarFilter) => FilterBarFilter;

// applyFilterExtensions runs a filter through the composed extension stack.
export function applyFilterExtensions(
  filter: FilterBarFilter,
  extensions: FilterExtension[] | undefined,
): FilterBarFilter {
  if (!extensions || extensions.length === 0) return filter;
  return extensions.reduce((current, ext) => ext(current), filter);
}

export function clearFilterBarFilter(filter: FilterBarFilter) {
  if (filter.kind === "text" || filter.kind === "lookup" || filter.kind === "enum") {
    filter.onChange("");
    return;
  }

  if (filter.kind === "lookup-multi" || filter.kind === "select-multi") {
    filter.onChange([]);
    return;
  }

  if (filter.kind === "number") {
    filter.onChange({});
    return;
  }

  if (filter.kind === "boolean") {
    filter.onChange(false);
    return;
  }

  filter.onChange({});
}

export function isFilterBarFilterActive(filter: FilterBarFilter) {
  if (filter.kind === "text" || filter.kind === "lookup" || filter.kind === "enum") {
    return String(filter.value ?? "").trim() !== "";
  }
  if (filter.kind === "lookup-multi" || filter.kind === "select-multi") {
    return filter.value.length > 0;
  }
  if (filter.kind === "number") {
    return (
      String(filter.value.min ?? "").trim() !== "" || String(filter.value.max ?? "").trim() !== ""
    );
  }
  if (filter.kind === "boolean") return filter.value;
  return Object.keys(filter.value).length > 0;
}
