import {
  resolveControl,
  scalarItemsType,
} from "./json-schema-form-resolve";
import { applyListenerState } from "./json-schema-form-listeners";
import { isPlainObject } from "../lib/collections";
import { hasObjectItemProperties, isEmptyValue } from "./json-schema-form-utils";
import { matchesFieldFilter } from "./json-schema-form-filter";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import type {
  ExpressionEvaluator,
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
  viewOnly,
  hideReadOnlyFields,
  hideEmpty,
  fieldFilter,
  pre,
  rootValue = value,
  instancePath = "",
  expressionEvaluator,
}: {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  errors: JsonSchemaFormError[];
  hiddenKeys?: string[];
  // The form-level `readOnly` prop: a read-only form is a view, which omits
  // writeOnly fields, so their errors cannot be shown on them.
  viewOnly: boolean;
  hideReadOnlyFields: boolean;
  hideEmpty: boolean;
  fieldFilter?: string;
  pre: PreExtension[];
  rootValue?: Record<string, unknown>;
  instancePath?: string;
  expressionEvaluator?: ExpressionEvaluator;
}): JsonSchemaFormError[] {
  const rendered = new Set<string>();
  collectObjectPaths(schema, value, instancePath, rendered, {
    hiddenKeys: new Set(hiddenKeys ?? []),
    viewOnly,
    hideReadOnlyFields,
    hideEmpty,
    pre,
    rootValue,
    root: true,
    ...(fieldFilter ? { fieldFilter } : {}),
    ...(expressionEvaluator ? { expressionEvaluator } : {}),
  });
  return errors.filter((error) => !rendered.has(error.instancePath));
}

interface CollectOptions {
  hiddenKeys: Set<string>;
  // Mirrors RenderContext.viewOnly: the form is read-only, or an ancestor
  // field is readOnly.
  viewOnly: boolean;
  hideReadOnlyFields: boolean;
  hideEmpty: boolean;
  fieldFilter?: string;
  pre: PreExtension[];
  rootValue: Record<string, unknown>;
  root: boolean;
  expressionEvaluator?: ExpressionEvaluator;
}

function collectObjectPaths(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  basePath: string,
  paths: Set<string>,
  options: CollectOptions
) {
  const { properties, required } = applyListenerState(schema, value, {
    root: options.rootValue,
    ...(options.expressionEvaluator ? { evaluate: options.expressionEvaluator } : {}),
  });
  const discriminator =
    options.root && typeof schema["x-discriminator"] === "string"
      ? schema["x-discriminator"]
      : undefined;
  const pickerPhase =
    discriminator != null &&
    (value[discriminator] == null || value[discriminator] === "");

  for (const [key, prop] of Object.entries(properties)) {
    // Mirrors buildField: a hidden field renders nothing to hang an error on.
    if (prop["x-hidden"]) continue;
    if (options.root && options.hiddenKeys.has(key)) continue;
    if (
      options.root &&
      options.fieldFilter &&
      !matchesFieldFilter({ key, prop, filter: options.fieldFilter, value: value[key] })
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
    // A field the form drops is not a place an error can be shown, so its error
    // has to surface as unmatched rather than vanish with the field.
    if (omitsWriteOnly(field, options)) continue;
    if (options.hideEmpty && isEmptyValue(field.value)) continue;

    const path = appendInstancePath(basePath, key);
    paths.add(path);
    collectControlPaths(field, path, paths, { ...options, root: false, viewOnly: subtreeIsView(field, options) });
  }
}

// Mirrors buildField: a writeOnly value is never shown in a view, nor by a
// field that is itself readOnly.
function omitsWriteOnly(field: FieldControl, options: CollectOptions): boolean {
  return field.writeOnly === true && (options.viewOnly || field.readOnly === true);
}

// Mirrors buildField: a readOnly field's subtree is a view.
function subtreeIsView(field: FieldControl, options: CollectOptions): boolean {
  return options.viewOnly || field.readOnly === true;
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
  const table = field.layout === "table" && hasObjectItemProperties(itemSchema);
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
    const itemField = resolveControl({
      key: `${field.key}[${index}]`,
      prop: itemSchema,
      required: false,
      value: item,
      onChange: () => {},
    });
    if (omitsWriteOnly(itemField, options)) continue;
    paths.add(itemPath);
    collectControlPaths(itemField, itemPath, paths, { ...options, viewOnly: subtreeIsView(itemField, options) });
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
    const valueField = resolveControl({
      key,
      prop: schema,
      required: false,
      value: value[key],
      onChange: () => {},
    });
    if (omitsWriteOnly(valueField, options)) continue;
    paths.add(path);
    collectControlPaths(valueField, path, paths, { ...options, viewOnly: subtreeIsView(valueField, options) });
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
