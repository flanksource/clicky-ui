import { normalizeTone } from "./json-schema-form-tone";
import { isPlainObject } from "./json-schema-form-utils";
import type {
  ArrayItemSpec,
  ArrayItemSummary,
  ArrayItemSummaryPart,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// Property names worth trying for a row title when the schema does not say.
// Ordered most-human-readable first.
const DEFAULT_TITLE_KEYS = ["title", "name", "label", "id", "key"];

const SUMMARY_SEPARATOR = "  ·  ";
const VALUE_SEPARATOR = ", ";

// resolveItemSpec reads the array's `x-item` and fills in every default, so the
// renderer never has to ask whether a key was supplied. With no `x-item` at all
// the result reproduces today's behaviour exactly: an `Item <n>` title and an
// "Add item" button.
export function resolveItemSpec(
  arraySchema: JsonSchemaProperty,
  itemSchema: JsonSchemaProperty | undefined,
): ArrayItemSpec {
  const raw = isPlainObject(arraySchema["x-item"])
    ? (arraySchema["x-item"] as ArrayItemSpec)
    : {};
  const title = stringArray(raw.title);
  const summary = summaryParts(raw.summary);
  const glyph = typeof raw.glyph === "string" ? raw.glyph : autoGlyphKey(itemSchema);
  return {
    title: title.length > 0 ? title : DEFAULT_TITLE_KEYS,
    ...(typeof raw.fallback === "string" && raw.fallback ? { fallback: raw.fallback } : {}),
    ...(summary.length > 0 ? { summary } : {}),
    ...(glyph ? { glyph } : {}),
    ...(typeof raw.badge === "string" && raw.badge ? { badge: raw.badge } : {}),
    ...(typeof raw.flag === "string" && raw.flag ? { flag: raw.flag } : {}),
    noun: firstNonEmpty([raw.noun, itemSchema?.title]) ?? "item",
    nounPlural: firstNonEmpty([raw.nounPlural, arraySchema.title]) ?? "items",
    ...(typeof raw.empty === "string" && raw.empty ? { empty: raw.empty } : {}),
  };
}

// autoGlyphKey picks the item property that can colour a row without being told:
// the first enum carrying per-value icons. Keeps a schema that already declares
// x-enum-icons from having to repeat itself in x-item.
function autoGlyphKey(itemSchema: JsonSchemaProperty | undefined): string | undefined {
  for (const [key, prop] of Object.entries(itemSchema?.properties ?? {})) {
    const icons = prop["x-enum-icons"];
    if (Array.isArray(prop.enum) && icons && Object.keys(icons).length > 0) return key;
  }
  return undefined;
}

// itemSummaryFor derives one collapsed row from the item's raw VALUE — never
// from its rendered fields. A consumer pre-extension may hide a property's
// control entirely (returning null) and still have it appear in the summary.
export function itemSummaryFor({
  item,
  index,
  spec,
  itemSchema,
}: {
  item: unknown;
  index: number;
  spec: ArrayItemSpec;
  itemSchema: JsonSchemaProperty | undefined;
}): ArrayItemSummary {
  const obj = isPlainObject(item) ? item : {};
  const props = itemSchema?.properties ?? {};

  const title =
    firstNonEmpty((spec.title ?? DEFAULT_TITLE_KEYS).map((key) => text(obj[key]))) ??
    spec.fallback ??
    `Item ${index + 1}`;

  const summary = (spec.summary ?? [])
    .map((part) => summaryPart(obj, part))
    .filter((s): s is string => !!s)
    .join(SUMMARY_SEPARATOR);

  const glyphValue = spec.glyph ? text(obj[spec.glyph]) : "";
  const glyphProp = spec.glyph ? props[spec.glyph] : undefined;
  const badgeValue = spec.badge ? text(obj[spec.badge]) : "";
  const badgeProp = spec.badge ? props[spec.badge] : undefined;
  const badgeIcon = badgeProp?.["x-enum-icons"]?.[badgeValue];

  return {
    title,
    ...(summary ? { summary } : {}),
    ...(spec.glyph
      ? {
          glyph: {
            ...(glyphProp?.["x-enum-icons"]?.[glyphValue]
              ? { icon: glyphProp["x-enum-icons"][glyphValue] }
              : {}),
            tone: normalizeTone(glyphProp?.["x-enum-tones"]?.[glyphValue]),
            ...(glyphValue ? { label: enumLabel(glyphProp, glyphValue) } : {}),
          },
        }
      : {}),
    ...(badgeValue
      ? {
          badge: {
            ...(badgeIcon ? { icon: badgeIcon } : {}),
            label: enumLabel(badgeProp, badgeValue),
          },
        }
      : {}),
    ...(spec.flag && obj[spec.flag] === true ? { flagged: true } : {}),
  };
}

// The add row's button text — "Add parameter" when the schema names its noun,
// and the historical "Add item" when it does not.
export function addItemLabel(spec: ArrayItemSpec): string {
  return `Add ${spec.noun ?? "item"}`;
}

export function itemCountLabel(spec: ArrayItemSpec, count: number): string {
  return count === 1
    ? `1 ${spec.noun ?? "item"}`
    : `${count} ${spec.nounPlural ?? "items"}`;
}

// The zero-item explanation. Falls back to the array's own description, so a
// schema that already documents the field gets the empty state for free.
export function emptyItemsCopy(
  spec: ArrayItemSpec,
  arraySchema: JsonSchemaProperty,
): string | undefined {
  if (spec.empty) return spec.empty;
  const description = typeof arraySchema.description === "string" ? arraySchema.description.trim() : "";
  return description || undefined;
}

export function noItemsLabel(spec: ArrayItemSpec): string {
  return `No ${spec.nounPlural ?? "items"} yet`;
}

// summaryPart renders one part, substituting the value into a single literal
// `{}` in the pattern. A pattern without `{}` renders as-is (it is a literal),
// and a missing value drops the part rather than leaving a dangling separator.
function summaryPart(
  obj: Record<string, unknown>,
  part: string | ArrayItemSummaryPart,
): string | undefined {
  const { property, pattern } = typeof part === "string" ? { property: part, pattern: undefined } : part;
  const value = text(obj[property]);
  if (!value) return undefined;
  return pattern ? pattern.replace("{}", value) : value;
}

// enumLabel prefers the human label the schema declares for a code, falling back
// to the code itself. Unlike the combobox option list this does NOT render
// "Label (code)" — a chip has room for one of the two, and the label is the one
// worth reading.
function enumLabel(prop: JsonSchemaProperty | undefined, value: string): string {
  const label = prop?.["x-enum-labels"]?.[value];
  return typeof label === "string" && label ? label : value;
}

// text flattens a value to its display string. Arrays join, so a list-valued
// property still reads as one line.
function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(VALUE_SEPARATOR);
  if (typeof value === "object") return "";
  return String(value).trim();
}

function stringArray(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && !!v);
}

function summaryParts(value: unknown): Array<string | ArrayItemSummaryPart> {
  if (!Array.isArray(value)) return [];
  return (value as unknown[]).flatMap((part): Array<string | ArrayItemSummaryPart> => {
    if (typeof part === "string" && part) return [part];
    if (isPlainObject(part) && typeof part.property === "string" && part.property) {
      return [
        {
          property: part.property,
          ...(typeof part.pattern === "string" && part.pattern ? { pattern: part.pattern } : {}),
        } satisfies ArrayItemSummaryPart,
      ];
    }
    return [];
  });
}

function firstNonEmpty(values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed) return trimmed;
  }
  return undefined;
}
