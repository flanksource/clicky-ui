/**
 * Task metadata is whatever JSON the producer chose to attach to a snapshot, so
 * rendering it starts with reading its shape rather than assuming one. The split
 * these helpers make is between values that read as a label — a state, a model,
 * a session id — and values that do not, because only the first kind can go in a
 * row of chips without turning into `[object Object]`.
 */

/** A metadata value that renders as one short piece of text. */
export type MetadataScalar = string | number | boolean;

export interface MetadataEntry {
  key: string;
  value: MetadataScalar;
  /** The text to render, and to test for a link. */
  text: string;
}

function isScalar(value: unknown): value is MetadataScalar {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/** True for a JSON object — not an array, and not null, both of which `typeof` calls "object". */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The scalar entries of a metadata object, in the producer's own key order.
 * Empty strings are dropped: a producer that reports a field it has no value for
 * yet is saying nothing, and a blank chip reads as a rendering fault.
 */
export function metadataEntries(value: unknown): MetadataEntry[] {
  if (!isPlainObject(value)) return [];
  const entries: MetadataEntry[] = [];
  for (const [key, item] of Object.entries(value)) {
    if (!isScalar(item) || item === "") continue;
    entries.push({ key, value: item, text: String(item) });
  }
  return entries;
}

/**
 * True when every value in the object is a scalar — the case a chip row or a
 * definition list can render completely, with nothing left over to fall back to
 * a JSON view for.
 */
export function isFlatMetadata(value: unknown): boolean {
  return isPlainObject(value) && Object.values(value).every(isScalar);
}

/** Keys whose value is a destination rather than a label. */
const LINK_KEYS = new Set(["href", "url", "link"]);

export function isMetadataLink(key: string, text: string): boolean {
  return LINK_KEYS.has(key) || text.startsWith("/") || text.startsWith("https://");
}
