import type { FilterBarFilter } from "./FilterBar";

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
