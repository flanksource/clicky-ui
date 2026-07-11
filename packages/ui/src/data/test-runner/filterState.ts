// Tri-state filter primitives — ported from the Gavel test runner. A key is
// either absent (neutral), 'include' (only matching values pass), or 'exclude'
// (matching values are removed). Ported verbatim so consumers rebase cleanly.

export type FilterMode = "include" | "exclude";
export type FilterState<T extends string = string> = Map<T, FilterMode>;

/** Status + framework tri-state filters driving the test tree. */
export type TestFilters = {
  status: FilterState<string>;
  framework: FilterState<string>;
};

export function emptyTestFilters(): TestFilters {
  return { status: new Map(), framework: new Map() };
}

export function decodeFilterState<T extends string = string>(tokens: string[]): FilterState<T> {
  const state = new Map<T, FilterMode>();
  for (const token of tokens) {
    const value = token.startsWith("!") ? token.slice(1) : token;
    if (!value) continue;
    state.set(value as T, token.startsWith("!") ? "exclude" : "include");
  }
  return state;
}

export function encodeFilterState<T extends string = string>(state: FilterState<T>): string[] {
  return Array.from(state.entries())
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([value, mode]) => (mode === "exclude" ? `!${value}` : String(value)));
}

/** Advance a key through neutral → include → exclude → neutral. */
export function cycleFilterState<T extends string = string>(
  state: FilterState<T>,
  key: T,
): FilterState<T> {
  const next = new Map(state);
  const current = next.get(key);
  if (current === "include") {
    next.set(key, "exclude");
  } else if (current === "exclude") {
    next.delete(key);
  } else {
    next.set(key, "include");
  }
  return next;
}

// filterStateToRecord / recordToFilterState bridge this package's Map-based
// FilterState to the Record<string, FilterBarMultiFilterMode> shape the
// components/filter-bar-multi TriStateMultiSelect expects. FilterMode and
// FilterBarMultiFilterMode are both independently-defined "include" | "exclude"
// unions — structurally identical today, but a future addition to either would
// silently type-check against the other since neither references the other.
export function filterStateToRecord<T extends string = string>(
  state: FilterState<T>,
): Record<string, FilterMode> {
  return Object.fromEntries(state);
}

export function recordToFilterState<T extends string = string>(
  record: Record<string, FilterMode>,
): FilterState<T> {
  return new Map(Object.entries(record)) as FilterState<T>;
}

export function matchesFilterState<T extends string = string>(
  value: T | null | undefined,
  state: FilterState<T>,
): boolean {
  if (state.size === 0) return true;

  const include = new Set<T>();
  const exclude = new Set<T>();
  for (const [key, mode] of state.entries()) {
    if (mode === "include") include.add(key);
    if (mode === "exclude") exclude.add(key);
  }

  if (value && exclude.has(value)) return false;
  if (include.size === 0) return true;
  return !!value && include.has(value);
}
