import {
  effectiveProperties,
  resolveControl,
  scalarItemsType,
} from "./json-schema-form-resolve";
import { isPlainObject } from "../lib/collections";
import { matchesFieldFilter } from "./json-schema-form-utils";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
  PreExtension,
} from "./json-schema-form-types";

export function appendInstancePath(
  base: string,
  token: string | number
): string {
  const escaped = String(token).replaceAll("~", "~0").replaceAll("/", "~1");
  return `${base}/${escaped}`;
}

// How many errors sit at or below a subtree. A collapsed container (an
// accordion row) renders none of the controls that would show them, so it
// reports the count on its own header instead.
export function errorCountUnderInstancePath(
  errors: JsonSchemaFormError[],
  instancePath: string
): number {
  return errors.filter(
    (error) =>
      error.instancePath === instancePath ||
      error.instancePath.startsWith(`${instancePath}/`)
  ).length;
}

export function errorsAtInstancePath(
  errors: JsonSchemaFormError[],
  instancePath: string
): JsonSchemaFormError[] {
  return errors.filter((error) => error.instancePath === instancePath);
}

export function unmatchedFormErrors({
  schema,
  value,
  errors,
  hiddenKeys,
  hideReadOnlyFields,
  fieldFilter,
  pre,
}: {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  errors: JsonSchemaFormError[];
  hiddenKeys?: string[];
  hideReadOnlyFields: boolean;
  fieldFilter?: string;
  pre: PreExtension[];
}): JsonSchemaFormError[] {
  const rendered = new Set<string>();
  collectObjectPaths(schema, value, "", rendered, {
    hiddenKeys: new Set(hiddenKeys ?? []),
    hideReadOnlyFields,
    pre,
    rootValue: value,
    root: true,
    ...(fieldFilter ? { fieldFilter } : {}),
  });
  return errors.filter((error) => !rendered.has(error.instancePath));
}

interface CollectOptions {
  hiddenKeys: Set<string>;
  hideReadOnlyFields: boolean;
  fieldFilter?: string;
  pre: PreExtension[];
  rootValue: Record<string, unknown>;
  root: boolean;
}

function collectObjectPaths(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  basePath: string,
  paths: Set<string>,
  options: CollectOptions
) {
  const { properties, required } = effectiveProperties(schema, value);
  const discriminator =
    options.root && typeof schema["x-discriminator"] === "string"
      ? schema["x-discriminator"]
      : undefined;
  const pickerPhase =
    discriminator != null &&
    (value[discriminator] == null || value[discriminator] === "");

  for (const [key, prop] of Object.entries(properties)) {
    if (options.root && options.hiddenKeys.has(key)) continue;
    if (
      options.root &&
      options.fieldFilter &&
      !matchesFieldFilter(key, prop, options.fieldFilter)
    ) {
      continue;
    }
    if (
      discriminator &&
      (pickerPhase ? key !== discriminator : key === discriminator)
    ) {
      continue;
    }

    const field = applyPreExtensions(
      resolveControl({
        key,
        prop,
        required: required.includes(key),
        value: value[key],
        onChange: () => {},
      }),
      prop,
      value[key],
      options.rootValue,
      options.pre
    );
    if (!field || (options.hideReadOnlyFields && field.readOnly)) continue;

    const path = appendInstancePath(basePath, key);
    paths.add(path);
    collectControlPaths(field, path, paths, { ...options, root: false });
  }
}

function applyPreExtensions(
  initial: FieldControl,
  prop: JsonSchemaProperty,
  value: unknown,
  rootValue: Record<string, unknown>,
  extensions: PreExtension[]
): FieldControl | null {
  let field: FieldControl | null = initial;
  for (const extension of extensions) {
    if (!field) return null;
    field = extension(field, {
      key: field.key,
      prop,
      value,
      rootValue,
    });
  }
  return field;
}

function collectControlPaths(
  field: FieldControl,
  instancePath: string,
  paths: Set<string>,
  options: CollectOptions
) {
  if (field.kind === "object") {
    collectObjectPaths(
      field.schema as JsonSchemaObject,
      isPlainObject(field.value) ? field.value : {},
      instancePath,
      paths,
      options
    );
    return;
  }
  if (field.kind === "array") {
    collectArrayPaths(field, instancePath, paths, options);
    return;
  }
  if (field.kind === "string-map") {
    collectMapPaths(field, instancePath, paths, options);
  }
}

function collectArrayPaths(
  field: FieldControl,
  instancePath: string,
  paths: Set<string>,
  options: CollectOptions
) {
  // Mirrors ArrayControl's branch order: a flat list of values (pills, choices
  // or scalars) is ONE control, with no per-item field to hang a message on, so
  // its item paths stay unmatched and the error surfaces in the form summary
  // instead of pointing at nothing.
  if (field.arrayDisplay === "filter-pills") return;
  if (
    field.arrayDisplay !== "stacked" &&
    (hasEnumItems(field) || scalarItemsType(field.itemSchema))
  ) {
    return;
  }

  const itemSchema = field.itemSchema ?? { type: "string" };
  const table =
    field.layout === "table" &&
    itemSchema.properties != null &&
    Object.keys(itemSchema.properties).length > 0;
  for (const [index, item] of (Array.isArray(field.value)
    ? field.value
    : []
  ).entries()) {
    const itemPath = appendInstancePath(instancePath, index);
    if (table) {
      collectObjectPaths(
        itemSchema as JsonSchemaObject,
        isPlainObject(item) ? item : {},
        itemPath,
        paths,
        options
      );
      continue;
    }
    paths.add(itemPath);
    collectControlPaths(
      resolveControl({
        key: `${field.key}[${index}]`,
        prop: itemSchema,
        required: false,
        value: item,
        onChange: () => {},
      }),
      itemPath,
      paths,
      options
    );
  }
}

// Mirrors ArrayControl's tags branch: resolved options win over the raw item
// enum, since a pre-extension may have supplied them.
function hasEnumItems(field: FieldControl): boolean {
  if (field.options && field.options.length > 0) return true;
  return Array.isArray(field.itemSchema?.enum) && field.itemSchema.enum.length > 0;
}

function collectMapPaths(
  field: FieldControl,
  instancePath: string,
  paths: Set<string>,
  options: CollectOptions
) {
  const value = isPlainObject(field.value) ? field.value : {};
  const known = field.knownProperties ?? {};
  const keys = [
    ...Object.keys(known),
    ...Object.keys(value).filter((key) => !(key in known)),
  ];
  for (const key of keys) {
    const schema = known[key] ?? mapValueSchema(field, key);
    const path = appendInstancePath(instancePath, key);
    paths.add(path);
    collectControlPaths(
      resolveControl({
        key,
        prop: schema,
        required: false,
        value: value[key],
        onChange: () => {},
      }),
      path,
      paths,
      options
    );
  }
}

function mapValueSchema(field: FieldControl, key: string): JsonSchemaProperty {
  for (const entry of field.valuePatternSchemas ?? []) {
    try {
      if (new RegExp(entry.pattern).test(key)) return entry.schema;
    } catch {
      continue;
    }
  }
  return field.valueSchema ?? { type: "string" };
}
