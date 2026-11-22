import type { PreExtension } from "./json-schema-form-runtime-types";
import { SiblingSelect } from "./json-schema-form-sibling-select";

export interface SiblingPrefixOptions {
  /** The field whose input carries the dropdown. */
  key: string;
  /** The enum sibling the dropdown edits; its own row is dropped. */
  from: string;
}

// siblingPrefixPre builds a `pre` extension that draws an enum sibling (`from`)
// as a dropdown at the start of another field's input (`key`), for a value that
// only reads with that field (a route beside the system it reaches). It acts only
// on objects holding both properties.
export function siblingPrefixPre({ key, from }: SiblingPrefixOptions): PreExtension {
  return (field, { parent }) => {
    if (field.key !== key && field.key !== from) return field;
    const properties = parent?.schema.properties;
    if (!parent || !properties?.[key] || !properties[from]) return field;
    if (field.key === from) return null;
    return { ...field, prefix: <SiblingSelect field={field} parent={parent} from={from} prop={properties[from]} /> };
  };
}
