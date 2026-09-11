// A prefixed key namespaces one query param under a host-chosen segment, e.g.
// "tr.limit" for prefix "tr" and param "limit". This is how OperationCatalog's
// urlState={{prefix}} avoids colliding with a host route's own query params
// (a drawer's `?step=&tab=`, say) while still round-tripping through the URL.
function prefixedKey(prefix: string, name: string): string {
  return `${prefix}.${name}`;
}

export function readOperationFiltersFromUrl(
  prefix?: string
): Record<string, string> {
  if (typeof window === "undefined") return {};
  const search = new URLSearchParams(window.location.search);
  const values: Record<string, string> = {};

  if (prefix) {
    const withSeparator = `${prefix}.`;
    for (const [key, value] of search.entries()) {
      if (!key.startsWith(withSeparator)) continue;
      if (value === "") continue;
      values[key.slice(withSeparator.length)] = value;
    }
    return values;
  }

  for (const [key, value] of search.entries()) {
    if (key.startsWith("__")) continue;
    if (value !== "") values[key] = value;
  }
  return values;
}

export function writeOperationFiltersToUrl(
  filters: Record<string, string>,
  parameterNames: string[],
  prefix?: string
) {
  if (typeof window === "undefined") return;
  const search = new URLSearchParams(window.location.search);
  for (const name of parameterNames) {
    search.delete(prefix ? prefixedKey(prefix, name) : name);
  }
  for (const [key, value] of Object.entries(filters)) {
    if (!parameterNames.includes(key) || value === "") continue;
    search.set(prefix ? prefixedKey(prefix, key) : key, value);
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
