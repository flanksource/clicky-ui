import type { FixtureFenceSchemas } from "./types";
import {
  firstFenceMetaToken,
  fixtureFenceKind,
  resolveFixtureFenceSchema,
} from "./fixture-blocks";

export function fixtureCodeBlockMatches(
  language: string | null | undefined,
  meta: string | null | undefined,
  schemas: FixtureFenceSchemas,
): boolean {
  const resolvedLanguage = language ?? "";
  const resolvedMeta = meta ?? "";
  if (resolveFixtureFenceSchema(resolvedLanguage, resolvedMeta, schemas) != null) {
    return true;
  }
  const kind = fixtureFenceKind(resolvedLanguage, resolvedMeta);
  if (
    kind === "test" ||
    kind === "lint" ||
    kind === "exec" ||
    kind === "ai" ||
    kind === "prompt"
  ) {
    return true;
  }
  return (
    (resolvedLanguage.toLowerCase() === "yaml" ||
      resolvedLanguage.toLowerCase() === "yml") &&
    firstFenceMetaToken(resolvedMeta) !== ""
  );
}
