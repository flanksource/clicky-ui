// Path helpers for SchemaActionForm, kept out of the component module so the
// component file only exports components (react-refresh constraint).

// collectionPath strips a trailing /{id} segment so a resource's JSON Schema is
// fetched from its collection endpoint (the connection/profile schema is keyed
// there, not per id).
export function collectionPath(path: string): string {
  return path.replace(/\/\{[^{}]+\}$/, "");
}

// resolveActionPath fills {name} path parameters from the provided values,
// leaving unmatched placeholders intact.
export function resolveActionPath(path: string, values: Record<string, string>): string {
  return path.replace(/\{([^{}]+)\}/g, (_match, name: string) => {
    const v = values[name];
    return v != null && v !== "" ? encodeURIComponent(v) : `{${name}}`;
  });
}

// scalarValues lifts the top-level string/number entries of a form value, used
// only to resolve path parameters (e.g. an id carried in the body).
export function scalarValues(value: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, v] of Object.entries(value)) {
    if (typeof v === "string" || typeof v === "number") out[key] = String(v);
  }
  return out;
}
