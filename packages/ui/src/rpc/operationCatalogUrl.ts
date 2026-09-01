export function readOperationFiltersFromUrl(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const search = new URLSearchParams(window.location.search);
  const values: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    if (key.startsWith("__")) continue;
    if (value !== "") values[key] = value;
  }
  return values;
}

export function writeOperationFiltersToUrl(
  filters: Record<string, string>,
  parameterNames: string[]
) {
  if (typeof window === "undefined") return;
  const search = new URLSearchParams(window.location.search);
  for (const name of parameterNames) search.delete(name);
  for (const [key, value] of Object.entries(filters)) {
    if (parameterNames.includes(key) && value !== "") search.set(key, value);
  }
  const query = search.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${
    window.location.hash
  }`;
  if (
    next !==
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  ) {
    window.history.replaceState(window.history.state, "", next);
  }
}
