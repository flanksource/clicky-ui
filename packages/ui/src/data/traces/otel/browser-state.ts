import { MODE_FILTERS, readSearchValues, searchParams, type Modes, type SearchValues } from "./api";

// The pure side of OtelTraceBrowser: which query-string keys it owns, how pinned
// values merge into and out of the search values, and how the location is built.

/** The query keys of the search form (SearchValues); every other key belongs to the host. */
const SEARCH_KEYS = [
  "source", "run", "index", "format", "services", "operations", "statuses", "attributes", "minSpans", "traceId",
  "lookback", "from", "until", "minDuration", "maxDuration", "limit", "offset",
] as const;
const SEARCH_KEY_SET: ReadonlySet<string> = new Set(SEARCH_KEYS);
const TRACE_KEY = "trace";
const SPAN_KEY = "span";
const OWNED_KEYS: ReadonlySet<string> = new Set([...SEARCH_KEYS, TRACE_KEY, SPAN_KEY]);

const isModeFilter = (key: string): boolean => (MODE_FILTERS as readonly string[]).includes(key);

export interface BrowserLocation {
  values: SearchValues;
  trace?: string;
  span?: string;
}

/** The search values, open trace and selected span of a query string, ignoring the host's own keys. */
export function readBrowserLocation(search: string): BrowserLocation {
  const params = new URLSearchParams(search);
  const owned = new URLSearchParams();
  const cleared: SearchValues = {};
  for (const [key, value] of params) {
    if (!SEARCH_KEY_SET.has(key)) continue;
    if (value === "" && !isModeFilter(key)) {
      cleared[key] = undefined;
      owned.delete(key);
    } else {
      owned.append(key, value);
    }
  }
  const trace = params.get(TRACE_KEY);
  const span = params.get(SPAN_KEY);
  return { values: { ...cleared, ...readSearchValues(owned) }, ...(trace ? { trace } : {}), ...(span ? { span } : {}) };
}

/** The values with the pinned ones added: a pinned mode filter entry wins over the user's, a pinned scalar replaces theirs. */
export function mergePinned(values: SearchValues, pinned: SearchValues): SearchValues {
  const merged: SearchValues = { ...values };
  for (const [key, pin] of Object.entries(pinned)) {
    if (pin === undefined) continue;
    merged[key] = isModeFilter(key) ? { ...(values[key] as Modes | undefined), ...(pin as Modes) } : pin;
  }
  return merged;
}

/** The values without the pinned entries, which the page already supplies and the URL should not repeat. */
export function withoutPinned(values: SearchValues, pinned: SearchValues): SearchValues {
  const rest: SearchValues = { ...values };
  for (const [key, pin] of Object.entries(pinned)) {
    if (pin === undefined) continue;
    if (!isModeFilter(key)) {
      if (rest[key] === pin) delete rest[key];
      continue;
    }
    const left = Object.fromEntries(Object.entries((rest[key] ?? {}) as Modes).filter(([entry]) => !Object.hasOwn(pin as Modes, entry)));
    if (Object.keys(left).length > 0) rest[key] = left;
    else delete rest[key];
  }
  return rest;
}

/** The path with the current query's host keys kept and the otel keys (search values, trace, span) replaced. */
export function browserHref({ pathname, search, values, pinned, defaults = {}, trace, span }: {
  pathname: string; search: string; values: SearchValues; pinned: SearchValues; defaults?: SearchValues; trace?: string | undefined; span?: string | undefined;
}): string {
  const query = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) if (!OWNED_KEYS.has(key)) query.append(key, value);
  for (const [key, value] of searchParams(withoutPinned(values, pinned))) query.set(key, value);
  // Cleared defaults must survive navigation without becoming API parameters.
  const defaultParams = searchParams(withoutPinned(mergePinned(defaults, pinned), pinned));
  for (const key of SEARCH_KEYS) {
    if (defaultParams.has(key) && !query.has(key)) query.set(key, isModeFilter(key) ? "{}" : "");
  }
  if (trace) query.set(TRACE_KEY, trace);
  if (trace && span) query.set(SPAN_KEY, span);
  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}
