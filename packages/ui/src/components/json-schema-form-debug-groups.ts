import type { JsonSchemaProperty } from "./json-schema-form-types";

// Which part of the form a schema keyword drives, for the debug card. Every x-*
// keyword the form (or an opt-in clicky extension) reads is catalogued here; an
// x-* key the catalog does not know is the consumer's own.
export type KeywordGroup = "behaviour" | "presentation" | "opt-in" | "consumer" | "schema";

// FORM_KEYWORD_GROUPS names every x-* keyword documented by the meta-schema,
// schemas/json-schema-form.schema.json (kept in step by its test).
export const FORM_KEYWORD_GROUPS: Record<string, Exclude<KeywordGroup, "consumer" | "schema">> = {
  "x-hidden": "behaviour",
  "x-hidden-by": "behaviour",
  "x-disabled": "behaviour",
  "x-on-change": "behaviour",
  "x-on-load": "behaviour",
  "x-clicky-lookup": "behaviour",
  "x-discriminator": "behaviour",
  "x-order": "presentation",
  "x-clicky-order": "presentation",
  "x-enum-labels": "presentation",
  "x-enum-icons": "presentation",
  "x-enum-descriptions": "presentation",
  "x-enum-tones": "presentation",
  "x-enum-display": "presentation",
  "x-array-display": "presentation",
  "x-help-display": "presentation",
  "x-help": "presentation",
  "x-item": "presentation",
  "x-number-display": "presentation",
  "x-md-editor": "presentation",
  "x-label-classes": "presentation",
  "x-input-classes": "presentation",
  "x-input-prefix": "presentation",
  "x-input-suffix": "presentation",
  "x-input-prefix-icon": "presentation",
  "x-input-suffix-icon": "presentation",
  "x-label-position": "presentation",
  "x-layout": "presentation",
  "x-col-span": "presentation",
  "x-columns": "presentation",
  "x-column-min-width": "presentation",
  "x-columns-max-width": "presentation",
  "x-classes": "presentation",
  "x-icon": "presentation",
  "x-table-max-columns": "presentation",
  "x-clicky-component": "opt-in",
  "x-clicky-default-source": "opt-in",
  "x-clicky-unit": "opt-in",
};

const GROUP_ORDER: KeywordGroup[] = ["behaviour", "presentation", "opt-in", "consumer", "schema"];

// Keywords already shown as the card's heading.
const HEADING = new Set(["title", "description"]);

export function groupKeywords(prop: JsonSchemaProperty): { group: KeywordGroup; entries: [string, unknown][] }[] {
  const grouped = new Map<KeywordGroup, [string, unknown][]>();
  for (const [keyword, raw] of Object.entries(prop)) {
    if (HEADING.has(keyword)) continue;
    const group = FORM_KEYWORD_GROUPS[keyword] ?? (keyword.startsWith("x-") ? "consumer" : "schema");
    grouped.set(group, [...(grouped.get(group) ?? []), [keyword, raw]]);
  }
  return GROUP_ORDER.filter((group) => grouped.has(group)).map((group) => ({ group, entries: grouped.get(group)! }));
}
