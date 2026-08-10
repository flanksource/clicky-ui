import type { FilterBarMultiFilterMode } from "../components/filter-bar-field-utils";

/**
 * A filter selection as one flat, URL-safe record: filter key → comma-joined
 * values, each optionally `!`-prefixed to exclude. It is the one encoding the
 * profile catalog (which syncs it to the URL) and the ad-hoc query browser both
 * speak, so a selection means the same thing wherever it is read.
 */
export type DataTableFilterSelection = Record<string, string>;

// The serialized multi-filter value is a wire contract, not internal state: it
// is packed into a query parameter and parsed server-side by clicky's
// `entity.MultiFilter` (collections.MatchItems semantics — `,` separates
// patterns, a leading `!` negates). That grammar has no escape sequence, so a
// value that itself starts with `!` or contains `,` cannot be expressed on the
// wire at all. Backslash escapes below therefore only ever apply to values the
// server could never represent, leaving every representable value byte
// identical, while making the local parse/serialize pair lossless so an
// *included* "!failed" is not read back as an *exclusion* of "failed" on the
// next render.
//
// WORKAROUND(no-server-escape-syntax): the escapes are understood by this
// module only; a backslash sent to the server is matched literally.
// Correct fix: teach entity.MultiFilter / collections.MatchItems an escape
// sequence, then drop this note.
// Ref: PR review, discussed with user 2026-08-05
//
// Grammar: `\\`, `\!`, `\,` and `\<whitespace>` decode to the bare character; a
// backslash before anything else is literal. Unescaped whitespace around an
// item is trimmed (hand-edited URLs), unescaped `,` separates items, and an
// unescaped leading `!` marks an exclusion. Empty keys are not representable
// and are dropped.
type MultiFilterChar = { char: string; escaped: boolean };

function isMultiFilterEscapable(char: string) {
  return char === "\\" || char === "!" || char === "," || /\s/.test(char);
}

function isUnescapedSpace(entry: MultiFilterChar) {
  return !entry.escaped && /\s/.test(entry.char);
}

function splitMultiFilterItems(value: string): MultiFilterChar[][] {
  const items: MultiFilterChar[][] = [[]];
  for (let index = 0; index < value.length; index++) {
    const char = value[index]!;
    const next = value[index + 1];
    if (char === "\\" && next !== undefined && isMultiFilterEscapable(next)) {
      items[items.length - 1]!.push({ char: next, escaped: true });
      index++;
    } else if (char === ",") {
      items.push([]);
    } else {
      items[items.length - 1]!.push({ char, escaped: false });
    }
  }
  return items.map((item) => {
    let start = 0;
    let end = item.length;
    while (start < end && isUnescapedSpace(item[start]!)) start++;
    while (end > start && isUnescapedSpace(item[end - 1]!)) end--;
    return item.slice(start, end);
  });
}

export function parseMultiFilterValue(value: string): Record<string, FilterBarMultiFilterMode> {
  const parsed: Record<string, FilterBarMultiFilterMode> = {};
  for (const item of splitMultiFilterItems(value)) {
    if (item.length === 0) continue;
    const excluded = item.length > 1 && item[0]!.char === "!" && !item[0]!.escaped;
    const key = (excluded ? item.slice(1) : item).map((entry) => entry.char).join("");
    if (key) parsed[key] = excluded ? "exclude" : "include";
  }
  return parsed;
}

function escapeMultiFilterKey(key: string): string {
  let escaped = "";
  for (let index = 0; index < key.length; index++) {
    const char = key[index]!;
    const isBoundary = index === 0 || index === key.length - 1;
    if (char === ",") {
      escaped += "\\,";
    } else if (char === "\\" && isMultiFilterEscapable(key[index + 1] ?? "")) {
      escaped += "\\\\";
    } else if (isBoundary && /\s/.test(char)) {
      escaped += `\\${char}`;
    } else {
      escaped += char;
    }
  }
  return escaped;
}

export function serializeMultiFilterValue(value: Record<string, FilterBarMultiFilterMode>): string {
  return Object.entries(value)
    .flatMap(([key, mode]) => {
      if (!key) return [];
      const escaped = escapeMultiFilterKey(key);
      if (mode === "include") return [key.startsWith("!") ? `\\${escaped}` : escaped];
      if (mode === "exclude") return [`!${escaped}`];
      return [];
    })
    .join(",");
}

export function splitCommaValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * A bounded selection: both edges under one key, each token carrying its own
 * comparison operator. It is the other half of the selection grammar, and the
 * one a range and a time bound share.
 */
export type FilterBoundsValue = {
  min?: string;
  max?: string;
};

/**
 * Reads a bounded selection. The bar's controls are inclusive on both edges, so
 * that is what they write back — but a bound typed by hand or arriving in a URL
 * keeps whatever operator it came with.
 */
export function parseBoundsValue(raw: string): FilterBoundsValue {
  const bounds: FilterBoundsValue = {};
  for (const token of raw.split(",")) {
    const trimmed = token.trim();
    if (trimmed.startsWith(">")) {
      bounds.min = trimmed.replace(/^>=?/, "");
    } else if (trimmed.startsWith("<")) {
      bounds.max = trimmed.replace(/^<=?/, "");
    }
  }
  return bounds;
}

export function serializeBoundsValue(value: FilterBoundsValue): string {
  const tokens: string[] = [];
  if (value.min) tokens.push(`>=${value.min}`);
  if (value.max) tokens.push(`<=${value.max}`);
  return tokens.join(",");
}

/**
 * Writes a serialized value into a selection, dropping the key when it is
 * empty. An absent key and a key holding "" would send different query strings
 * for the same "nothing selected", so only one of them is ever built.
 */
export function updateFilterSelection(
  selection: DataTableFilterSelection,
  key: string,
  serialized: string,
): DataTableFilterSelection {
  const next = { ...selection };
  if (serialized) {
    next[key] = serialized;
  } else {
    delete next[key];
  }
  return next;
}
