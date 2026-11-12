import type { JsonSchemaObject } from "../components/json-schema-form-types";

/** What a connection form's `type` property says about each type it offers. */
export type ConnectionTypeMeta = {
  /** Runtime icon name per type, from the schema's `x-enum-icons`. */
  icons: Record<string, string>;
  /** Display label per type, from the schema's `x-enum-labels`. */
  labels: Record<string, string>;
};

/** `sql_server` -> `Sql Server`: the label of a type the schema does not name. */
function titleize(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** How a connection type reads in prose and group headers. */
export function connectionTypeLabel(type: string, labels?: Record<string, string>): string {
  return labels?.[type] ?? titleize(type);
}

/**
 * The type a lookup option's icon stands for, by inverting the schema's
 * `x-enum-icons`. The wire carries the type's icon rather than the type itself,
 * so this is how an untyped picker groups its rows. Undefined when the icon is
 * not a type's, or several types share it.
 */
export function connectionTypeOfIcon(
  icon: unknown,
  icons: Record<string, string> | undefined,
): string | undefined {
  if (typeof icon !== "string" || !icons) return undefined;
  const types = Object.keys(icons).filter((type) => icons[type] === icon);
  return types.length === 1 ? types[0] : undefined;
}

/** Reads the icon and label tables off the `type` property of a served connection schema. */
export function connectionTypeMeta(schema: JsonSchemaObject): ConnectionTypeMeta {
  const type = schema.properties?.type;
  return {
    icons: stringRecord(type?.["x-enum-icons"], "x-enum-icons"),
    labels: stringRecord(type?.["x-enum-labels"], "x-enum-labels"),
  };
}

function stringRecord(raw: unknown, keyword: string): Record<string, string> {
  if (raw === undefined) return {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`connection schema type.${keyword} must be an object of type -> string`);
  }
  return Object.fromEntries(
    Object.entries(raw).map(([type, value]) => {
      if (typeof value !== "string") {
        throw new Error(`connection schema type.${keyword}.${type} must be a string, got ${JSON.stringify(value)}`);
      }
      return [type, value];
    }),
  );
}

/** The ref a connection is chosen by: `connection://name`, or `connection://namespace/name`. */
export function connectionRef({ name, namespace }: { name: string; namespace?: string }): string {
  return `connection://${namespace ? `${namespace}/` : ""}${name}`;
}
