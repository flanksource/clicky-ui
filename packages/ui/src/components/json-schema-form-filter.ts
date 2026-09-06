import { isPlainObject } from "../lib/collections";
import {
  effectiveProperties,
  isOpenStringMap,
  schemaRendersAsObject,
} from "./json-schema-form-resolve";
import type {
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

export function matchesFieldFilter({
  key,
  prop,
  filter,
  value,
}: {
  key: string;
  prop: JsonSchemaProperty;
  filter: string;
  value?: unknown;
}): boolean {
  const query = filter.trim().toLowerCase();
  if (
    !query ||
    key.toLowerCase().includes(query) ||
    prop.title?.toLowerCase().includes(query)
  )
    return true;
  if (prop.format === "password") return false;
  if (Array.isArray(value)) {
    return value.some((item) =>
      matchesFieldFilter({
        key: "",
        prop: prop.items ?? {},
        filter,
        value: item,
      }),
    );
  }
  if (isPlainObject(value)) {
    const { properties } = effectiveProperties(prop as JsonSchemaObject, value);
    const openMap =
      isOpenStringMap(prop) ||
      (schemaRendersAsObject(prop) &&
        !prop.properties &&
        Object.keys(properties).length === 0);
    const keys = new Set([...Object.keys(properties), ...Object.keys(value)]);
    return [...keys].some((childKey) => {
      const child =
        properties[childKey] ??
        Object.entries(prop.patternProperties ?? {}).find(([pattern]) =>
          new RegExp(pattern).test(childKey),
        )?.[1] ??
        (isPlainObject(prop.additionalProperties)
          ? prop.additionalProperties
          : openMap
            ? { type: "string" }
            : undefined);
      return (
        child !== undefined &&
        matchesFieldFilter({
          key: childKey,
          prop: child,
          filter,
          value: value[childKey],
        })
      );
    });
  }
  if (value === null || value === undefined) return false;
  const text = String(value).toLowerCase();
  const label = prop["x-enum-labels"]?.[String(value)];
  return text.includes(query) || Boolean(label?.toLowerCase().includes(query));
}
