import type { FieldControl } from "./json-schema-form-types";

export function hasFormHelp(field: FieldControl): boolean {
  return Boolean(field.helper || field.schema["x-help"]?.links?.length);
}
