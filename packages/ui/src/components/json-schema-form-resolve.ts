import { createElement, type ReactNode } from "react";
import type {
  ArrayDisplay,
  EnumDisplay,
  FieldControl,
  FieldOption,
  HelpDisplay,
  JsonSchemaObject,
  JsonSchemaProperty,
  LookupDescriptor,
  ScalarItemType,
} from "./json-schema-form-types";
import { isPlainObject } from "../lib/collections";
import { LabelIcon } from "../data/Icon";
import { resolveItemSpec } from "./json-schema-form-item-summary";
import { isFieldTone } from "./json-schema-form-tone";

// isOpenStringMap reports whether a property is an object whose entries are
// described by a sub-schema in `additionalProperties` (a typed key/value map) or
// by `patternProperties` (a per-key-pattern value map). Either makes it an
// editable key/value control rather than a fixed-property sub-form.
export function isOpenStringMap(prop: JsonSchemaProperty): boolean {
  if (!schemaRendersAsObject(prop)) return false;
  if (
    typeof prop.additionalProperties === "object" &&
    prop.additionalProperties !== null
  ) {
    return true;
  }
  return (
    !!prop.patternProperties && Object.keys(prop.patternProperties).length > 0
  );
}

// patternSchemasOf compiles a schema's `patternProperties` into the ordered
// {pattern, schema} list the string-map control matches keys against.
function patternSchemasOf(
  prop: JsonSchemaProperty,
): { pattern: string; schema: JsonSchemaProperty }[] | undefined {
  const pp = prop.patternProperties;
  if (!pp || Object.keys(pp).length === 0) return undefined;
  return Object.entries(pp).map(([pattern, schema]) => ({ pattern, schema }));
}

function schemaHasType(prop: JsonSchemaProperty, type: string): boolean {
  if (Array.isArray(prop.type)) return prop.type.includes(type as never);
  return prop.type === type;
}

// schemaRendersAsObject accepts schemas that omit `type` but use object-only
// keywords, including composed schemas whose local refs were rehydrated into
// unconditional allOf members. An explicit incompatible type always wins.
export function schemaRendersAsObject(prop: JsonSchemaProperty): boolean {
  if (schemaHasType(prop, "object")) return true;
  if (prop.type !== undefined) return false;
  if (
    prop.properties !== undefined ||
    prop.required !== undefined ||
    prop.additionalProperties !== undefined ||
    prop.patternProperties !== undefined ||
    prop.propertyNames !== undefined ||
    prop.unevaluatedProperties !== undefined
  ) {
    return true;
  }
  return (
    prop.allOf?.some(
      (clause) =>
        clause.if === undefined &&
        clause.then === undefined &&
        schemaRendersAsObject(clause as JsonSchemaProperty),
    ) ?? false
  );
}

function enumOptions(prop: JsonSchemaProperty): FieldOption[] {
  const labels = prop["x-enum-labels"];
  const icons = prop["x-enum-icons"];
  const descriptions = prop["x-enum-descriptions"];
  const tones = prop["x-enum-tones"];
  return (prop.enum ?? []).map((v) => {
    const value = String(v);
    const desc = labels?.[value];
    const icon = icons?.[value];
    const description = descriptions?.[value];
    const tone = tones?.[value];
    return {
      value,
      label:
        typeof desc === "string" && desc && desc !== value
          ? `${desc} (${value})`
          : value,
      ...(typeof icon === "string" && icon ? { icon } : {}),
      ...(typeof description === "string" && description
        ? { description }
        : {}),
      ...(isFieldTone(tone) ? { tone } : {}),
    };
  });
}

// enumDisplay resolves how an enum should render: an explicit `x-enum-display`
// wins; otherwise an enum carrying `x-enum-icons` defaults to the icon grid.
// Returns undefined to keep the combobox default.
function enumDisplay(prop: JsonSchemaProperty): EnumDisplay | undefined {
  const d = prop["x-enum-display"];
  if (d === "combobox" || d === "radio" || d === "grid" || d === "segmented")
    return d;
  const icons = prop["x-enum-icons"];
  if (icons && Object.keys(icons).length > 0) return "grid";
  return undefined;
}

function arrayDisplay(prop: JsonSchemaProperty): ArrayDisplay | undefined {
  const d = prop["x-array-display"];
  return d === "filter-pills" ||
    d === "accordion" ||
    d === "cards" ||
    d === "stacked" ||
    d === "list"
    ? d
    : undefined;
}

// helpDisplay reads the per-field `x-help-display` override. Returns undefined
// to defer to the form-level FormLayout.help.
function helpDisplay(prop: JsonSchemaProperty): HelpDisplay | undefined {
  const d = prop["x-help-display"];
  return d === "inline" || d === "hover" ? d : undefined;
}

export function schemaHelper(prop: JsonSchemaProperty): string | undefined {
  const description =
    typeof prop.description === "string" ? prop.description.trim() : "";
  const help = prop["x-help"];
  const helpBody =
    isPlainObject(help) && typeof help.body === "string"
      ? help.body.trim()
      : "";

  if (description && helpBody && helpBody !== description) {
    return `${description} ${helpBody}`;
  }
  return description || helpBody || undefined;
}

// adornmentNode builds a prefix/suffix node from the x-input-*[-icon] extensions:
// a runtime icon name wins, else static text. Returns undefined when neither set.
function adornmentNode(iconName: unknown, text: unknown): ReactNode {
  if (typeof iconName === "string" && iconName) {
    // Match the library's InputField field-icon convention (16px, muted/70) so a
    // schema-driven field lines up with a hand-built one.
    return createElement(LabelIcon, {
      icon: iconName,
      className: "size-4 text-muted-foreground/70",
    });
  }
  if (typeof text === "string" && text) {
    return createElement(
      "span",
      { className: "text-sm text-muted-foreground" },
      text,
    );
  }
  return undefined;
}

// enumBranch returns the first anyOf/oneOf member carrying a non-empty `enum`,
// for a union of "an enum value OR a free-form string" (e.g. a value-or-token
// field). It lets such a union render as a dropdown. Returns undefined when no
// branch enumerates values.
export function enumBranch(
  prop: JsonSchemaProperty,
): JsonSchemaProperty | undefined {
  for (const branch of [...(prop.anyOf ?? []), ...(prop.oneOf ?? [])]) {
    if (Array.isArray(branch.enum) && branch.enum.length > 0) return branch;
  }
  return undefined;
}

// lookupDescriptor reads the `x-clicky-lookup` extension into a LookupDescriptor,
// returning undefined when the keyword is absent or lacks its required url/filter.
function lookupDescriptor(
  prop: JsonSchemaProperty,
): LookupDescriptor | undefined {
  const raw = prop["x-clicky-lookup"];
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Record<string, unknown>;
  if (typeof d.url !== "string" || typeof d.filter !== "string")
    return undefined;
  return raw as LookupDescriptor;
}

export interface ResolveControlArgs {
  key: string;
  prop: JsonSchemaProperty;
  required: boolean;
  value: unknown;
  onChange: (next: unknown) => void;
}

// resolveControl infers a base, render-ready FieldControl from a property
// schema. It keys off schema keywords only — never the field name: ascode/token
// heuristics are layered on by consumer pre-extensions. The one exception is the
// standard `format: date`/`date-time` keyword, which is a schema-declared signal
// (not a name guess) and so drives a date control directly. First match wins.
export function resolveControl(args: ResolveControlArgs): FieldControl {
  const { key, prop, required, value, onChange } = args;
  const labelIcon = prop["x-icon"];
  const xLayout = prop["x-layout"];
  const explicitLayout =
    xLayout === "inline" || xLayout === "stack" || xLayout === "table"
      ? xLayout
      : undefined;
  // `x-label-position` is a friendlier alias over the same per-field layout knob:
  // "top" stacks the label above the value; "left" forces inline. `x-layout` wins.
  const labelPosition = prop["x-label-position"];
  const layout =
    explicitLayout ??
    (labelPosition === "top"
      ? "stack"
      : labelPosition === "left"
        ? "inline"
        : undefined);
  const prefix = adornmentNode(
    prop["x-input-prefix-icon"],
    prop["x-input-prefix"],
  );
  const suffix = adornmentNode(
    prop["x-input-suffix-icon"],
    prop["x-input-suffix"],
  );
  const labelClassName =
    typeof prop["x-label-classes"] === "string"
      ? prop["x-label-classes"]
      : undefined;
  const inputClassName =
    typeof prop["x-input-classes"] === "string"
      ? prop["x-input-classes"]
      : undefined;
  const colSpan =
    prop["x-col-span"] === "full"
      ? ("full" as const)
      : typeof prop["x-col-span"] === "number" &&
          Number.isFinite(prop["x-col-span"])
        ? prop["x-col-span"]
        : undefined;
  const keyOptions = keyOptionsFor(prop);
  const helper = schemaHelper(prop);
  const helpMode = helpDisplay(prop);
  const base: FieldControl = {
    key,
    kind: "string",
    label: typeof prop.title === "string" && prop.title ? prop.title : key,
    required,
    schema: prop,
    value,
    onChange,
    ...(prop.readOnly === true ? { readOnly: true } : {}),
    ...(typeof prop.description === "string"
      ? { description: prop.description }
      : {}),
    ...(helper ? { helper } : {}),
    ...(helpMode ? { helpDisplay: helpMode } : {}),
    ...(labelIcon != null && labelIcon !== ""
      ? { labelIcon: labelIcon as FieldControl["labelIcon"] }
      : {}),
    ...(layout ? { layout } : {}),
    ...(prefix ? { prefix } : {}),
    ...(suffix ? { suffix } : {}),
    ...(labelClassName ? { labelClassName } : {}),
    ...(inputClassName ? { inputClassName } : {}),
    ...(colSpan != null ? { colSpan } : {}),
  };

  // An `x-clicky-lookup` field is an async entity-reference picker: options load
  // lazily from another entity's list endpoint. Single-select also allows
  // free-form entry so a typed value outside the option set still commits.
  const lookup = lookupDescriptor(prop);
  if (lookup) {
    return {
      ...base,
      kind: "lookup",
      lookup,
      options: [],
      allowCustomValue: lookup.multi !== true,
    };
  }
  if (Array.isArray(prop.enum) && prop.enum.length > 0) {
    const display = enumDisplay(prop);
    return {
      ...base,
      kind: "enum",
      options: enumOptions(prop),
      ...(display ? { display } : {}),
    };
  }
  // A value-or-template union: the enum lives in an anyOf/oneOf branch alongside
  // free-form branches. Render it as a dropdown using that branch's enum; the
  // free-form branches are honoured via a consumer's allowCustomValue pre-ext.
  const branch = enumBranch(prop);
  if (branch) {
    return { ...base, kind: "enum", options: enumOptions(branch) };
  }
  // A schema-declared date/date-time string renders as a date control.
  if (prop.format === "date" || prop.format === "date-time") {
    return { ...base, kind: "date", dateFormat: prop.format };
  }
  // A long-form string declares `format: textarea` to render a multi-line box.
  if (prop.format === "textarea" && schemaHasType(prop, "string")) {
    return { ...base, kind: "textarea" };
  }
  // A markdown string declares `format: md` to render the MDXEditor-backed
  // editor. Plugin toggles live under `x-md-editor` so schema authors can keep
  // the format signal standard-sized and the editor behavior explicit.
  if (prop.format === "md" && schemaHasType(prop, "string")) {
    const markdownOptions = prop["x-md-editor"];
    return {
      ...base,
      kind: "markdown",
      ...(isPlainObject(markdownOptions) ? { markdownOptions } : {}),
    };
  }
  if (schemaHasType(prop, "boolean")) {
    return { ...base, kind: "boolean" };
  }
  if (schemaHasType(prop, "integer") || schemaHasType(prop, "number")) {
    return {
      ...base,
      kind: "number",
      coerceNumber: true,
      // A percent number carries a static "%" unit shown inside the input.
      ...(prop.format === "percent" ? { unit: "%" } : {}),
      ...(typeof prop.minimum === "number" ? { minimum: prop.minimum } : {}),
    };
  }
  if (schemaHasType(prop, "array")) {
    const display = arrayDisplay(prop);
    const itemSchema = prop.items;
    return {
      ...base,
      kind: "array",
      ...(itemSchema ? { itemSchema } : {}),
      ...(display ? { arrayDisplay: display } : {}),
      ...(display === "accordion" ? { itemSpec: resolveItemSpec(prop, itemSchema) } : {}),
      // An accordion reuses the array's description as the zero-item copy in its
      // add row, so a paragraph of the same sentence directly above would be a
      // literal duplicate. The schema can still say otherwise.
      ...(display === "accordion" && !helpMode ? { helpDisplay: "hover" as const } : {}),
      // An enum item schema makes the whole array a list of choices, whichever
      // display renders it (tags by default, filter pills on request), so the
      // options — labels, icons, tones and all — always resolve.
      ...(itemSchema && Array.isArray(itemSchema.enum)
        ? { options: enumOptions(itemSchema) }
        : {}),
      ...(layout ? { layout } : {}),
    };
  }
  // An open map: object whose entries are described by an additionalProperties
  // sub-schema and/or per-key patternProperties. Renders as editable key/value
  // rows (+ any known properties), with the value form resolved per key.
  if (isOpenStringMap(prop)) {
    const addl =
      typeof prop.additionalProperties === "object" &&
      prop.additionalProperties !== null
        ? (prop.additionalProperties as JsonSchemaProperty)
        : undefined;
    const patterns = patternSchemasOf(prop);
    // A constrained picker (propertyNames enum) or patternProperties still lets
    // the author ADD keys — the additions are limited to the allowed set, not
    // free-form — so `additionalProperties: false` doesn't disable "Add field"
    // in that case. It only closes a plain open map with no key constraints.
    const allowExtraKeys =
      keyOptions || patterns ? true : prop.additionalProperties !== false;
    return {
      ...base,
      kind: "string-map",
      ...(addl ? { valueSchema: addl } : {}),
      ...(patterns ? { valuePatternSchemas: patterns } : {}),
      ...(prop.properties ? { knownProperties: prop.properties } : {}),
      allowExtraKeys,
      ...(keyOptions ? { keyOptions } : {}),
      ...(layout ? { layout } : {}),
    };
  }
  // A structured object: fixed `properties`, not an open map. Renders as a
  // nested sub-form (labels, required, if/then) — recursed into by the renderer.
  if (schemaRendersAsObject(prop)) {
    const valueObject = isPlainObject(value) ? value : {};
    const objectFields = effectiveProperties(
      prop as JsonSchemaObject,
      valueObject,
    );
    if (Object.keys(objectFields.properties).length > 0 || prop.properties) {
      return {
        ...base,
        kind: "object",
        objectProperties: objectFields.properties,
        ...(objectFields.required.length > 0
          ? { objectRequired: objectFields.required }
          : {}),
        ...(layout ? { layout } : {}),
      };
    }
  }
  // A bare object with neither properties nor an additionalProperties schema:
  // treat as an open string map unless explicitly closed.
  if (schemaRendersAsObject(prop)) {
    return {
      ...base,
      kind: "string-map",
      allowExtraKeys: prop.additionalProperties !== false,
      ...(keyOptions ? { keyOptions } : {}),
      ...(layout ? { layout } : {}),
    };
  }
  return base;
}

// keyOptionsFor resolves the strict map-key picker options from a map schema's
// `propertyNames.enum` (e.g. an AsCode-constrained key set). Returns undefined
// when the keys are unconstrained, so the key stays free-text.
function keyOptionsFor(prop: JsonSchemaProperty): FieldOption[] | undefined {
  const pn = prop.propertyNames as JsonSchemaProperty | undefined;
  if (!pn || !Array.isArray(pn.enum) || pn.enum.length === 0) return undefined;
  return enumOptions(pn);
}

// scalarItemsType returns the scalar type an array's items hold — the case the
// array renders as ONE tag list rather than a control per item — or undefined
// when the items need a real per-item control. Anything carrying an
// enum/const/properties/items/additionalProperties/allOf has a richer shape (an
// enum array is a list of choices, and takes the option-backed branch instead).
export function scalarItemsType(
  items: JsonSchemaProperty | undefined,
): ScalarItemType | undefined {
  if (!items) return "string"; // untyped items default to string tags
  if (
    items.enum !== undefined ||
    items.const !== undefined ||
    items.properties !== undefined ||
    items.items !== undefined ||
    items.additionalProperties !== undefined ||
    items.allOf !== undefined
  ) {
    return undefined;
  }
  if (items.type === undefined || schemaHasType(items, "string")) return "string";
  if (schemaHasType(items, "integer")) return "integer";
  if (schemaHasType(items, "number")) return "number";
  return undefined;
}

// matchesIf reports whether the `if` sub-schema holds for the current value:
// every `if.required` key is present AND every `if.properties[k].const` equals
// value[k].
export function matchesIf(
  ifSchema: JsonSchemaProperty | undefined,
  value: Record<string, unknown>,
): boolean {
  if (!ifSchema) return false;
  for (const k of ifSchema.required ?? []) {
    if (!(k in value)) return false;
  }
  for (const [k, sub] of Object.entries(ifSchema.properties ?? {})) {
    if ("const" in sub && value[k] !== sub.const) return false;
  }
  return true;
}

export interface EffectiveProperties {
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

// applySchemaDefaults fills missing values from JSON Schema `default` keywords.
// It walks fixed object properties recursively and re-evaluates `if`/`then`
// branches after each pass, so a defaulted discriminator can activate defaults
// in its selected branch. Existing values, including null and empty strings, are
// never replaced. The original value is returned when no defaults apply.
export function applySchemaDefaults(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): Record<string, unknown> {
  return applyObjectDefaults(schema, value, new Set());
}

function applyObjectDefaults(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  ancestors: Set<JsonSchemaObject>,
): Record<string, unknown> {
  // Recursive schemas may point back to an ancestor after refs are hydrated.
  if (ancestors.has(schema)) return value;
  const nextAncestors = new Set(ancestors).add(schema);
  let next = value;

  // A default can select another conditional branch, so allow enough passes for
  // a chain of discriminator defaults while keeping malformed schemas bounded.
  const maxPasses = Math.min(
    100,
    Object.keys(schema.properties ?? {}).length +
      (schema.allOf?.length ?? 0) +
      2,
  );
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const { properties } = effectiveProperties(schema, next);
    let passChanged = false;
    let passValue = next;

    for (const [key, propertySchema] of Object.entries(properties)) {
      const existing = passValue[key];
      let fieldValue = existing;
      let fieldChanged = false;

      if (existing === undefined && propertySchema.default !== undefined) {
        fieldValue = cloneSchemaDefault(propertySchema.default);
        fieldChanged = true;
      }

      const structuredObject = schemaRendersAsObject(propertySchema);
      if (structuredObject && !isOpenStringMap(propertySchema)) {
        const objectValue = isPlainObject(fieldValue)
          ? (fieldValue as Record<string, unknown>)
          : {};
        const defaultedObject = applyObjectDefaults(
          propertySchema as JsonSchemaObject,
          objectValue,
          nextAncestors,
        );
        if (defaultedObject !== objectValue) {
          fieldValue = defaultedObject;
          fieldChanged = true;
        }
      }

      if (fieldChanged) {
        if (!passChanged) passValue = { ...next };
        passValue[key] = fieldValue;
        passChanged = true;
      }
    }

    if (!passChanged) break;
    next = passValue;
  }
  return next;
}

function cloneSchemaDefault(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneSchemaDefault);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        cloneSchemaDefault(entry),
      ]),
    );
  }
  return value;
}

// effectiveProperties merges the schema's base `properties` with each `allOf`
// member's contribution. An `if`/`then` member contributes `then.properties`
// only when its `if` matches the current value; an unconditional member (e.g.
// an inlined `$ref` composition, which carries its own `properties` and no
// `if`) always contributes. Later members win on key collision; required is the
// union. Pure and idempotent.
export function effectiveProperties(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): EffectiveProperties {
  const properties: Record<string, JsonSchemaProperty> = {
    ...schema.properties,
  };
  const required = new Set(schema.required ?? []);
  for (const clause of schema.allOf ?? []) {
    // Unconditional composition member: merge its own properties/required.
    if (clause.if === undefined && clause.then === undefined) {
      for (const [k, sub] of Object.entries(clause.properties ?? {})) {
        properties[k] = sub;
      }
      for (const k of clause.required ?? []) required.add(k);
      continue;
    }
    if (!matchesIf(clause.if, value)) continue;
    const then = clause.then ?? {};
    for (const [k, sub] of Object.entries(then.properties ?? {})) {
      properties[k] = sub;
    }
    for (const k of then.required ?? []) required.add(k);
  }
  return { properties, required: [...required] };
}
