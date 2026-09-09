/**
 * Task metadata is whatever JSON the producer chose to attach to a snapshot, so
 * rendering it starts with reading its shape rather than assuming one. The split
 * these helpers make is between values that read as a label — a state, a model,
 * a session id — and values that do not, because only the first kind can go in a
 * row of chips without turning into `[object Object]`.
 */

import { isPlainObject } from "../lib/collections";

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

/** Keys whose value is meant as a destination rather than a label. */
const LINK_KEYS = new Set(["href", "url", "link"]);

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** The schemes that only ever navigate. `javascript:` and `data:` run instead. */
const NAVIGABLE_URL = /^https?:\/\//i;

/** A leading `//` or `/\` is somewhere else entirely, wearing a path's clothes. */
const OFF_SITE_PATH = /^\/[/\\]/;

/** A browser ignores spaces and control characters when reading an href, so a scheme is read from the same stripped form it would see. */
function withoutBlanks(text: string): string {
  let stripped = "";
  for (const character of text) if (character > " ") stripped += character;
  return stripped;
}

/**
 * Whether a metadata value can be put in an `href`.
 *
 * The key says what the producer meant by a value; it does not say what the
 * value is. Metadata is whatever JSON reached this client over the task API or
 * the SSE stream, so a `url` of `javascript:…` is a script the page would run
 * on click rather than a place it would go. What may be linked is therefore
 * named rather than what may not: a relative reference, or an http(s) URL.
 * Anything else keeps rendering as the plain text it already was.
 */
export function isMetadataLink(key: string, text: string): boolean {
  if (!LINK_KEYS.has(key) && !text.startsWith("/") && !text.startsWith("https://")) return false;
  const destination = withoutBlanks(text);
  return HAS_SCHEME.test(destination) ? NAVIGABLE_URL.test(destination) : !OFF_SITE_PATH.test(destination);
}
