import type { JsonSchemaObject, JsonSchemaProperty } from "../components/json-schema-form-types";

export interface SchemaViewerNode {
  key: string;
  label: string;
  /** JSON type or a synthetic group tag such as "branch", "activity", or "clients". */
  badge?: string | undefined;
  /** Count shown as a pill, usually the number of children under a schema group. */
  count?: number | undefined;
  /** Platform extension metadata, when present on the schema field. */
  platformType?: string | undefined;
  ascode?: string | undefined;
  description?: string | undefined;
  /** Full per-field provenance. Present on field nodes, not synthetic group nodes. */
  meta?: SchemaViewerFieldMeta | undefined;
  /** Detail-only child payload rendered as an expanded inline panel. */
  detail?: SchemaViewerFieldMeta | undefined;
  children?: SchemaViewerNode[] | undefined;
}

export type SchemaNode = SchemaViewerNode;

export interface SchemaViewerEnumValue {
  value: string;
  /** Human label from x-enum-labels for this value, when one differs from the code. */
  label?: string | undefined;
}

export interface SchemaViewerSourceLocation {
  path: string;
  startLine?: number | undefined;
  endLine?: number | undefined;
}

export interface SchemaViewerFieldMeta {
  /** JSON type label, e.g. "string", "number | null", "enum(3)", or "object". */
  type: string;
  /** Platform type extension. */
  platformType?: string | undefined;
  /** AsCode extension, or a description directive fallback. */
  ascode?: string | undefined;
  /** Format extension, or the standard JSON Schema format. */
  format?: string | undefined;
  /** Client reference extension. */
  clientRef?: boolean | undefined;
  /** x-layout */
  layout?: string | undefined;
  /** enum values paired with x-enum-labels labels by value. */
  enumValues?: SchemaViewerEnumValue[] | undefined;
  /** x-location */
  location?: SchemaViewerSourceLocation | undefined;
  /** x-source */
  source?: string | undefined;
  /** SQL lifted from a query directive in the description. */
  query?: string | undefined;
  /** Other platform directives found in the description. */
  annotations?: SchemaViewerAnnotation[] | undefined;
  /** Human-readable description with platform directives stripped out. */
  description?: string | undefined;
}

export interface SchemaViewerAnnotation {
  key: string;
  value: string;
}

interface ParsedDescription {
  text?: string | undefined;
  query?: string | undefined;
  ascode?: string | undefined;
  annotations?: SchemaViewerAnnotation[] | undefined;
}

const PLATFORM_EXTENSION_PREFIX = ["x-oi", "pa-"].join("");
const PLATFORM_DIRECTIVE_PREFIX = ["@oi", "pa-"].join("");
const PLATFORM_TYPE_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}type`;
const PLATFORM_ASCODE_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}ascode`;
const PLATFORM_FORMAT_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}format`;
const PLATFORM_CLIENT_REF_EXTENSION = `${PLATFORM_EXTENSION_PREFIX}client-ref`;
const PLATFORM_DIRECTIVE_PATTERN = new RegExp(`${PLATFORM_DIRECTIVE_PREFIX}([a-z][\\w-]*)\\s*`, "gi");

function asObject(schema: unknown): JsonSchemaObject | undefined {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return undefined;
  return schema as JsonSchemaObject;
}

function strExt(schema: JsonSchemaProperty, key: string): string | undefined {
  const value = schema[key];
  return typeof value === "string" ? value : undefined;
}

function enumSchema(schema: JsonSchemaProperty): JsonSchemaProperty | undefined {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema;
  for (const branch of [...(schema.anyOf ?? []), ...(schema.oneOf ?? [])]) {
    if (Array.isArray(branch.enum) && branch.enum.length > 0) return branch;
  }
  return undefined;
}

function typeLabel(schema: JsonSchemaProperty): string {
  const enumBranch = enumSchema(schema);
  if (enumBranch?.enum) return `enum(${enumBranch.enum.length})`;
  if (schema.const !== undefined) return "const";
  const type = schema.type;
  if (Array.isArray(type)) return type.join(" | ");
  if (type) return type;
  if (schema.properties || schema.additionalProperties || schema.patternProperties) return "object";
  if (schema.items) return "array";
  return "any";
}

function enumValues(schema: JsonSchemaProperty): SchemaViewerEnumValue[] | undefined {
  const carrier = enumSchema(schema);
  if (!carrier?.enum || carrier.enum.length === 0) return undefined;
  const rawLabels = carrier["x-enum-labels"] ?? schema["x-enum-labels"];
  const labels =
    rawLabels && typeof rawLabels === "object" ? (rawLabels as Record<string, string>) : undefined;
  return carrier.enum.map((entry) => {
    const value = String(entry);
    const label = labels?.[value];
    return label && label !== value ? { value, label } : { value };
  });
}

function location(schema: JsonSchemaProperty): SchemaViewerSourceLocation | undefined {
  const loc = schema["x-location"];
  if (!loc || typeof loc !== "object" || Array.isArray(loc)) return undefined;
  const record = loc as Record<string, unknown>;
  if (typeof record.path !== "string") return undefined;
  return {
    path: record.path,
    startLine: typeof record.startLine === "number" ? record.startLine : undefined,
    endLine: typeof record.endLine === "number" ? record.endLine : undefined,
  };
}

function parseDescription(raw: string | undefined): ParsedDescription {
  if (!raw) return {};
  const matches = [...raw.matchAll(PLATFORM_DIRECTIVE_PATTERN)];
  if (matches.length === 0) {
    const text = raw.trim();
    return text ? { text } : {};
  }

  const result: ParsedDescription = {};
  const first = matches[0];
  if (!first) return {};
  const firstIndex = first.index ?? 0;
  const text = raw.slice(0, firstIndex).trim();
  if (text) result.text = text;

  const annotations: SchemaViewerAnnotation[] = [];
  matches.forEach((match, index) => {
    const key = match[1]?.toLowerCase();
    if (!key) return;
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? raw.length) : raw.length;
    const value = raw.slice(start, end).trim();
    if (!value) return;
    if (key === "query") result.query = value.replace(/^sql\s+/i, "").trim();
    else if (key === "ascode") result.ascode = value;
    else annotations.push({ key, value });
  });

  if (annotations.length > 0) result.annotations = annotations;
  return result;
}

function fieldMeta(schema: JsonSchemaProperty): SchemaViewerFieldMeta {
  const desc = parseDescription(typeof schema.description === "string" ? schema.description : undefined);
  return {
    type: typeLabel(schema),
    platformType: strExt(schema, PLATFORM_TYPE_EXTENSION),
    ascode: strExt(schema, PLATFORM_ASCODE_EXTENSION) ?? desc.ascode,
    format: strExt(schema, PLATFORM_FORMAT_EXTENSION) ?? (typeof schema.format === "string" ? schema.format : undefined),
    clientRef: schema[PLATFORM_CLIENT_REF_EXTENSION] === true ? true : undefined,
    layout: strExt(schema, "x-layout"),
    enumValues: enumValues(schema),
    location: location(schema),
    source: strExt(schema, "x-source"),
    query: desc.query,
    annotations: desc.annotations,
    description: desc.text,
  };
}

export function hasHoverMeta(meta: SchemaViewerFieldMeta): boolean {
  return Boolean(
    meta.platformType ||
      meta.ascode ||
      meta.format ||
      meta.clientRef ||
      meta.layout ||
      meta.enumValues ||
      meta.location ||
      meta.source ||
      meta.query ||
      meta.annotations ||
      meta.description,
  );
}

function effectiveSchemaProperties(schema: JsonSchemaObject | undefined): Record<string, JsonSchemaProperty> {
  if (!schema) return {};
  const properties: Record<string, JsonSchemaProperty> = { ...schema.properties };
  for (const clause of schema.allOf ?? []) {
    if (clause.if !== undefined || clause.then !== undefined) continue;
    for (const [key, child] of Object.entries(clause.properties ?? {})) {
      properties[key] = child;
    }
  }
  return properties;
}

function detailChild(key: string, label: string, meta: SchemaViewerFieldMeta): SchemaViewerNode[] | undefined {
  if (!hasHoverMeta(meta)) return undefined;
  return [{ key: `${key}/__detail`, label, detail: meta }];
}

function fieldNode(name: string, schema: JsonSchemaProperty, keyPrefix: string): SchemaViewerNode {
  const key = `${keyPrefix}/${name}`;
  const meta = fieldMeta(schema);
  const node: SchemaViewerNode = {
    key,
    label: name,
    badge: meta.type,
    platformType: meta.platformType,
    ascode: meta.ascode,
    description: meta.description,
    meta,
  };

  const children = objectChildren(schema, key);
  if (children.length > 0) {
    node.children = children;
    node.count = children.length;
  } else {
    node.children = detailChild(key, name, meta);
  }
  return node;
}

function mapValueNode(label: string, schema: JsonSchemaProperty, keyPrefix: string): SchemaViewerNode {
  const meta = fieldMeta(schema);
  const children = objectChildren(schema, keyPrefix);
  return {
    key: keyPrefix,
    label,
    badge: meta.type,
    platformType: meta.platformType,
    ascode: meta.ascode,
    description: meta.description,
    meta,
    ...(children.length > 0
      ? { count: children.length, children }
      : { children: detailChild(keyPrefix, label, meta) }),
  };
}

function objectChildren(schema: JsonSchemaProperty, keyPrefix: string): SchemaViewerNode[] {
  const out: SchemaViewerNode[] = [];
  const own = effectiveSchemaProperties(asObject(schema));
  const itemProps = effectiveSchemaProperties(asObject(schema.items));
  const props = Object.keys(own).length > 0 ? own : itemProps;

  for (const [name, child] of Object.entries(props)) {
    out.push(fieldNode(name, child, keyPrefix));
  }

  const additional = asObject(schema.additionalProperties);
  if (additional) {
    out.push(mapValueNode("(any key)", additional, `${keyPrefix}/*`));
  }

  for (const [pattern, child] of Object.entries(schema.patternProperties ?? {})) {
    out.push(mapValueNode(`/${pattern}/`, child, `${keyPrefix}/pattern/${pattern}`));
  }

  return out;
}

function activityNames(value: JsonSchemaObject): string[] {
  const names = new Set<string>();
  const activity = value.properties?.activity;
  if (activity && Array.isArray(activity.enum)) activity.enum.forEach((entry) => names.add(String(entry)));
  for (const clause of value.allOf ?? []) {
    const condition = clause.if?.properties?.activity as JsonSchemaProperty | undefined;
    if (condition?.const !== undefined) names.add(String(condition.const));
    if (Array.isArray(condition?.enum)) condition.enum.forEach((entry) => names.add(String(entry)));
  }
  return [...names].sort();
}

function activityInput(value: JsonSchemaObject, activity: string): JsonSchemaObject | undefined {
  for (const clause of value.allOf ?? []) {
    const condition = clause.if?.properties?.activity as JsonSchemaProperty | undefined;
    const matches =
      condition?.const === activity ||
      (Array.isArray(condition?.enum) && condition.enum.includes(activity));
    if (!matches) continue;
    const input = asObject(clause.then?.properties?.input as JsonSchemaProperty | undefined);
    if (input) return input;
  }
  return asObject(value.properties?.input);
}

function activityBranchNode(target: string, value: JsonSchemaObject): SchemaViewerNode {
  const key = `branch/${target}/activity`;
  const names = activityNames(value);
  const activities: SchemaViewerNode[] = names.map((name) => {
    const input = activityInput(value, name);
    const inputFields = input ? objectChildren(input, `${key}/${name}/input`) : [];
    const children: SchemaViewerNode[] = [];
    if (inputFields.length > 0) {
      children.push({
        key: `${key}/${name}/input`,
        label: "input",
        badge: "object",
        count: inputFields.length,
        children: inputFields,
      });
    }
    return {
      key: `${key}/${name}`,
      label: name,
      badge: "activity",
      ...(children.length > 0 ? { children, count: children.length } : {}),
    };
  });
  const controls = sharedControlFields(value, key);
  return {
    key,
    label: `activity - ${target}`,
    badge: "branch",
    count: names.length,
    children: [...activities, ...controls],
  };
}

function sharedControlFields(value: JsonSchemaObject, keyPrefix: string): SchemaViewerNode[] {
  const out: SchemaViewerNode[] = [];
  for (const [name, child] of Object.entries(effectiveSchemaProperties(value))) {
    if (name === "activity" || name === "input") continue;
    out.push(fieldNode(name, child, `${keyPrefix}/_controls`));
  }
  if (out.length === 0) return [];
  return [
    {
      key: `${keyPrefix}/_controls`,
      label: "(common fields)",
      badge: "fields",
      count: out.length,
      children: out,
    },
  ];
}

function addressCountryNames(value: JsonSchemaObject): string[] {
  const country = asObject(value.properties?.CountryCode);
  if (country && Array.isArray(country.enum)) return country.enum.map(String).sort();
  return [];
}

function addressTypesForCountry(value: JsonSchemaObject, country: string): string[] {
  for (const clause of value.allOf ?? []) {
    const ifProps = clause.if?.properties ?? {};
    const countryCode = ifProps.CountryCode as JsonSchemaProperty | undefined;
    if (countryCode?.const !== country || ifProps.AddressType !== undefined) continue;
    const addressType = asObject(clause.then?.properties?.AddressType as JsonSchemaProperty | undefined);
    if (addressType && Array.isArray(addressType.enum)) return addressType.enum.map(String).sort();
  }
  return [];
}

function addressFieldsFor(
  value: JsonSchemaObject,
  country: string,
  addressType: string,
): JsonSchemaObject | undefined {
  for (const clause of value.allOf ?? []) {
    const ifProps = clause.if?.properties ?? {};
    const countryCode = ifProps.CountryCode as JsonSchemaProperty | undefined;
    const type = ifProps.AddressType as JsonSchemaProperty | undefined;
    if (countryCode?.const !== country || type?.const !== addressType) continue;
    const fields = asObject(clause.then?.properties?.fields as JsonSchemaProperty | undefined);
    if (fields) return fields;
  }
  return undefined;
}

function addressesNode(key: string, map: JsonSchemaObject): SchemaViewerNode | undefined {
  const value = asObject(map.additionalProperties);
  if (!value) return undefined;
  const role = asObject(map.propertyNames);
  const countries = addressCountryNames(value);
  const countryNodes: SchemaViewerNode[] = countries.map((country) => {
    const types = addressTypesForCountry(value, country);
    const typeNodes: SchemaViewerNode[] = types.map((type) => {
      const fields = addressFieldsFor(value, country, type);
      const fieldNodes = fields ? objectChildren(fields, `${key}/${country}/${type}/fields`) : [];
      const children: SchemaViewerNode[] =
        fieldNodes.length > 0
          ? [
              {
                key: `${key}/${country}/${type}/fields`,
                label: "fields",
                badge: "object",
                count: fieldNodes.length,
                children: fieldNodes,
              },
            ]
          : [];
      return {
        key: `${key}/${country}/${type}`,
        label: type,
        badge: "activity",
        ...(children.length > 0 ? { children, count: children.length } : {}),
      };
    });
    return {
      key: `${key}/${country}`,
      label: country,
      badge: "branch",
      count: typeNodes.length,
      children: typeNodes,
    };
  });

  return {
    key,
    label: "addresses",
    badge: "branch",
    count: countries.length,
    ...(role?.[PLATFORM_ASCODE_EXTENSION] ? { ascode: String(role[PLATFORM_ASCODE_EXTENSION]) } : {}),
    children: countryNodes,
  };
}

function stepBranchNode(key: string, value: JsonSchemaObject): SchemaViewerNode {
  const children = objectChildren(value, `branch/${key}`);
  return { key: `branch/${key}`, label: key, badge: "branch", count: children.length, children };
}

function stepsNode(schema: JsonSchemaObject): SchemaViewerNode | undefined {
  const items = asObject(schema.properties?.steps?.items as JsonSchemaProperty | undefined);
  const branches = (items?.oneOf ?? []) as JsonSchemaProperty[];
  if (branches.length === 0) return undefined;

  const children: SchemaViewerNode[] = [];
  for (const branch of branches) {
    const key = branch.required?.[0];
    if (!key) continue;
    const value = asObject(branch.properties?.[key]);
    if (!value) continue;
    if (value.required?.includes("activity")) {
      children.push(activityBranchNode(key, value));
    } else if (key === "policy") {
      children.push({ ...stepBranchNode(key, value), label: "policy-create" });
    } else {
      children.push(stepBranchNode(key, value));
    }
  }

  return { key: "steps", label: "Steps", badge: "branch", count: children.length, children };
}

function setupNode(schema: JsonSchemaObject): SchemaViewerNode | undefined {
  const setup = asObject(schema.properties?.setup as JsonSchemaProperty | undefined);
  if (!setup) return undefined;

  const children: SchemaViewerNode[] = [];
  for (const which of ["scheme", "customer"] as const) {
    const block = asObject(setup.properties?.[which]);
    const fields = asObject(block?.properties?.fields);
    if (fields) {
      const fieldNodes = objectChildren(fields, `setup/${which}/fields`);
      children.push({
        key: `setup/${which}`,
        label: `${which} fields`,
        badge: "fields",
        count: fieldNodes.length,
        children: fieldNodes,
      });
    }
    const addressMap = asObject(block?.properties?.addresses);
    const addresses = addressMap ? addressesNode(`setup/${which}/addresses`, addressMap) : undefined;
    if (addresses) children.push({ ...addresses, label: `${which} addresses` });
  }

  const clients = asObject(setup.properties?.clients);
  const clientTypes = Object.keys(clients?.properties ?? {});
  if (clients && clientTypes.length > 0) {
    const typeNodes = clientTypes.map((type) => {
      const entry = asObject(asObject(clients.properties?.[type])?.items as JsonSchemaProperty | undefined);
      const fields = entry
        ? objectChildren(entry, `setup/clients/${type}`).filter((node) => node.label !== "addresses")
        : [];
      const addressMap = asObject(entry?.properties?.addresses);
      const addresses = addressMap ? addressesNode(`setup/clients/${type}/addresses`, addressMap) : undefined;
      const kids = addresses ? [...fields, addresses] : fields;
      return {
        key: `setup/clients/${type}`,
        label: type,
        badge: "clientType",
        count: kids.length,
        children: kids,
      };
    });
    children.push({
      key: "setup/clients",
      label: "clients",
      badge: "clientTypes",
      count: clientTypes.length,
      children: typeNodes,
    });
  }

  return { key: "setup", label: "Setup", badge: "group", count: children.length, children };
}

function topLevelFields(schema: JsonSchemaObject): SchemaViewerNode[] {
  const skip = new Set(["setup", "steps"]);
  const out: SchemaViewerNode[] = [];
  for (const [name, child] of Object.entries(effectiveSchemaProperties(schema))) {
    if (skip.has(name)) continue;
    out.push(fieldNode(name, child, "root"));
  }
  return out;
}

export function buildSchemaTree(schema: JsonSchemaObject): SchemaViewerNode[] {
  const roots: SchemaViewerNode[] = [];
  const setup = setupNode(schema);
  if (setup) roots.push(setup);
  const steps = stepsNode(schema);
  if (steps) roots.push(steps);
  roots.push(...topLevelFields(schema));
  return roots;
}

export function buildSchemaViewerTree(schema: JsonSchemaObject): SchemaViewerNode[] {
  return buildSchemaTree(schema);
}

export function buildStepBranchTree(
  schema: JsonSchemaObject,
  branchKey: string,
  isActivity: boolean,
): SchemaViewerNode[] {
  const items = asObject(schema.properties?.steps?.items as JsonSchemaProperty | undefined);
  const branches = (items?.oneOf ?? []) as JsonSchemaProperty[];
  for (const branch of branches) {
    if (!branch.required?.includes(branchKey)) continue;
    const value = asObject(branch.properties?.[branchKey]);
    if (!value) continue;
    const branchIsActivity = Boolean(value.required?.includes("activity"));
    if (branchIsActivity !== isActivity) continue;
    if (branchIsActivity) return [activityBranchNode(branchKey, value)];
    const node =
      branchKey === "policy"
        ? { ...stepBranchNode(branchKey, value), label: "policy-create" }
        : stepBranchNode(branchKey, value);
    return [node];
  }
  return [];
}
