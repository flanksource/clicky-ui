import type { ReactNode } from "react";
import type {
  FieldControl,
  PostExtension,
  PostExtensionContext,
} from "./json-schema-form-types";

export type FieldNodes = { label: ReactNode; value: ReactNode };

export function applyPostExtensions(
  field: FieldControl,
  nodes: FieldNodes,
  extensions: PostExtension[],
  ctx?: PostExtensionContext,
): FieldNodes {
  return extensions.reduce(
    (current, extension) => extension(field, current, ctx),
    nodes,
  );
}
