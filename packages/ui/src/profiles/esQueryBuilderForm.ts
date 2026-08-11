/**
 * The pure helpers behind the query builder: which parameters exist, what they
 * default to, and the field mappings a schema describes.
 *
 * Kept apart from esQueryBuilder.tsx so that module exports only components
 * (react/only-export-components).
 */

import type { EsFieldMapping } from "./esQueryOperators";
import type { ParamDraft } from "./profileWizardModel";

/** paramNames lists the parameters an operand may bind, in declared order. */
export function paramNames(params: ParamDraft[] | undefined): string[] {
  return (params ?? [])
    .map((param) => param.name ?? "")
    .filter((name) => name !== "");
}

/** paramRoles is the name-to-role table the compiler folds roles from. */
export function paramRoles(
  params: ParamDraft[] | undefined,
): Record<string, string> {
  const roles: Record<string, string> = {};
  for (const param of params ?? []) {
    if (param.name && param.role) roles[param.name] = param.role;
  }
  return roles;
}

/**
 * defaultParamValues is what the declared parameters resolve to before anyone
 * filters. The compiler needs them to bind a {param:…} operand and to
 * interpolate a {{.params.…}} one, so the preview shows the DSL a run produces.
 */
export function defaultParamValues(
  params: ParamDraft[] | undefined,
): Record<string, unknown> {
  return Object.fromEntries(
    (params ?? [])
      .filter((param) => param.name && param.default !== undefined)
      .map((param) => [param.name as string, param.default]),
  );
}

/**
 * esQueryFields reads the field mappings off a browser inspection. Only an
 * OpenSearch target carries them, so anything else builds against free text.
 */
export function esQueryFields(completion: unknown): EsFieldMapping[] {
  const typed = completion as { kind?: string; fields?: EsFieldMapping[] };
  return typed?.kind === "json-fields" ? (typed.fields ?? []) : [];
}
