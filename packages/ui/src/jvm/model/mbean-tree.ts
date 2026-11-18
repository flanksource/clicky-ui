export interface MBeanLeaf {
  objectName: string;
  /** The `name` property (or the first other property) with quotes removed. */
  label: string;
  /** The remaining `key=value` properties, comma separated. */
  metadata: string;
}

export interface MBeanTypeGroup {
  type: string;
  mbeans: MBeanLeaf[];
}

export interface MBeanDomain {
  domain: string;
  count: number;
  types: MBeanTypeGroup[];
}

export interface ObjectNameProperty {
  key: string;
  /** Raw value, quotes included. */
  value: string;
  raw: string;
}

export const UNTYPED_MBEAN = "Untyped";

const TYPE_KEYS = ["type", "j2eeType", "ObjectType", "Type"];

function splitProperties(objectName: string, value: string): string[] {
  const properties: string[] = [];
  let quoted = false;
  let escaped = false;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (escaped) escaped = false;
    else if (character === "\\" && quoted) escaped = true;
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      properties.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (quoted || escaped) throw new Error(`Invalid MBean ObjectName "${objectName}": unterminated quoted value`);
  properties.push(value.slice(start).trim());
  return properties;
}

export function unquoteObjectNameValue(value: string): string {
  return value.length >= 2 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
}

/** Splits a JMX ObjectName into its domain and key properties, honouring quoted values. */
export function parseObjectName(objectName: string): { domain: string; properties: ObjectNameProperty[] } {
  const separator = objectName.indexOf(":");
  if (separator <= 0 || separator === objectName.length - 1) {
    throw new Error(`Invalid MBean ObjectName "${objectName}": expected domain:key=value`);
  }
  const properties = splitProperties(objectName, objectName.slice(separator + 1)).map((raw) => {
    const assignment = raw.indexOf("=");
    if (assignment <= 0) throw new Error(`Invalid MBean ObjectName "${objectName}": expected key=value property`);
    return { key: raw.slice(0, assignment), value: raw.slice(assignment + 1), raw };
  });
  return { domain: objectName.slice(0, separator), properties };
}

function classify(objectName: string): { domain: string; type: string; leaf: MBeanLeaf } {
  const { domain, properties } = parseObjectName(objectName);
  const typeProperty = TYPE_KEYS.map((key) => properties.find((property) => property.key === key)).find(Boolean);
  const nameProperty =
    properties.find((property) => property.key === "name") ??
    properties.find((property) => property.key.toLowerCase() === "name");
  const remaining = properties.filter((property) => property !== typeProperty && property !== nameProperty);
  const identity = nameProperty ?? remaining[0];
  const type = typeProperty ? unquoteObjectNameValue(typeProperty.value) : UNTYPED_MBEAN;
  return {
    domain,
    type,
    leaf: {
      objectName,
      label: unquoteObjectNameValue(identity?.value ?? "") || type,
      metadata: remaining.filter((property) => property !== identity).map((property) => property.raw).join(", "),
    },
  };
}

function compareTypes(left: string, right: string): number {
  if (left === right) return 0;
  if (left === UNTYPED_MBEAN) return 1;
  if (right === UNTYPED_MBEAN) return -1;
  return left.localeCompare(right);
}

/**
 * Groups ObjectNames by domain, then by their `type` (or `j2eeType`) property.
 * Domains and types sort alphabetically with untyped MBeans last; leaves sort by label.
 */
export function buildMBeanBrowserTree(names: string[]): MBeanDomain[] {
  const domains = new Map<string, Map<string, MBeanLeaf[]>>();
  for (const objectName of names) {
    const parsed = classify(objectName);
    const types = domains.get(parsed.domain) ?? new Map<string, MBeanLeaf[]>();
    types.set(parsed.type, [...(types.get(parsed.type) ?? []), parsed.leaf]);
    domains.set(parsed.domain, types);
  }
  return [...domains.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([domain, types]) => ({
      domain,
      count: [...types.values()].reduce((total, mbeans) => total + mbeans.length, 0),
      types: [...types.entries()]
        .sort(([left], [right]) => compareTypes(left, right))
        .map(([type, mbeans]) => ({
          type,
          mbeans: mbeans.sort(
            (left, right) => left.label.localeCompare(right.label) || left.objectName.localeCompare(right.objectName),
          ),
        })),
    }));
}
