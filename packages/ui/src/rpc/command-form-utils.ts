import type { OpenAPIParameter } from "./types";

export function pathParamNames(path: string): string[] {
  return [...path.matchAll(/\{([^{}]+)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

export function normalizeParameters(
  parameters: OpenAPIParameter[],
  path: string,
): OpenAPIParameter[] {
  const pathParams = pathParamNames(path);
  const firstPathParam = pathParams[0];
  const seen = new Set(parameters.map((param) => param.name));
  const normalized = parameters.filter(
    (param) => !(param.name === "args" && firstPathParam != null && !seen.has(firstPathParam)),
  );
  for (const name of pathParams) {
    if (seen.has(name)) continue;
    normalized.unshift({
      name,
      in: "path",
      required: true,
      description: "Path parameter",
      schema: { type: "string" },
    });
  }
  return normalized;
}

export function submitValue(param: OpenAPIParameter, value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "[]" || trimmed === "null") return null;
  if (isDateParam(param) && isZeroDate(trimmed)) return null;
  return trimmed;
}

function isDateParam(param: OpenAPIParameter): boolean {
  const format = param.schema?.format?.toLowerCase();
  const text = `${param.name} ${param.description ?? ""}`.toLowerCase();
  return format === "date" || format === "date-time" || text.includes("date");
}

function isZeroDate(value: string): boolean {
  return value.startsWith("0001-01-01") || value === "0001-01-01";
}
