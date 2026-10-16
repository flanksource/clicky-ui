import { ConnectionLoggingPolicy } from "../components/ConnectionLoggingPolicy";
import type { FieldControl } from "../components/json-schema-form-types";
import type { PostExtensionContext } from "../components/json-schema-form-runtime-types";
import { isPlainObject } from "../lib/collections";
import { connectionLoggingCapability } from "./connectionLoggingModel";

/**
 * The logging policy editor in place of the connection schema's synthetic
 * `logging` field. Its overrides live in the connection's `properties` map, so
 * it edits the root form value rather than its own field.
 */
export function ConnectionLoggingField({
  field,
  ctx,
}: {
  field: FieldControl;
  ctx: PostExtensionContext;
}) {
  if (!ctx.rootValue || !ctx.onRootChange) {
    throw new Error(
      "connection logging requires root form value and onRootChange",
    );
  }
  const rootValue = ctx.rootValue;
  const onRootChange = ctx.onRootChange;
  const properties = isPlainObject(rootValue.properties)
    ? stringProperties(rootValue.properties)
    : {};

  return (
    <ConnectionLoggingPolicy
      definition={connectionLoggingCapability(field)}
      value={properties}
      readOnly={field.readOnly ?? false}
      onChange={(next) => onRootChange({ ...rootValue, properties: next })}
    />
  );
}

function stringProperties(
  value: Record<string, unknown>,
): Record<string, string> {
  const properties: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") properties[key] = item;
  }
  return properties;
}
