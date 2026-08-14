/**
 * What a matching document comes back as: where the hits start, which _source
 * fields travel, and whether the backend counts past its default. How many hits
 * come back is the query's Limit, edited next to the filters — one row cap, so
 * that it cannot disagree with itself across the form and the raw DSL.
 */


/**
 * pruneEmpty drops a sub-object that says nothing, so clearing the last field of
 * `source` removes `source` rather than storing `{}` the compiler must ignore.
 */
export function pruneEmpty<T extends object>(value: T): T | undefined {
  const said = Object.values(value).some((entry) =>
    Array.isArray(entry) ? entry.length > 0 : entry !== undefined && entry !== null,
  );
  return said ? value : undefined;
}

/** parseCount reads a non-negative integer, treating anything else as unset. */
export function parseCount(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}
