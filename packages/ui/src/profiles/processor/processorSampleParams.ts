import { defaultParamValues } from "../elasticsearch/esQueryBuilderForm";
import type { ParamDraft } from "../wizard/profileWizardModel";

export function processorPreviewParams(profile: unknown): ParamDraft[] {
  if (!isRecord(profile) || !Array.isArray(profile.params)) return [];
  return profile.params.filter(isRecord) as ParamDraft[];
}

export function processorPreviewParamDefaults(
  params: ParamDraft[],
): Record<string, unknown> {
  return defaultParamValues(params);
}

export function missingProcessorPreviewParams(
  params: ParamDraft[],
  values: Record<string, unknown>,
): string[] {
  return params
    .filter(
      (param) => param.required && param.name && empty(values[param.name]),
    )
    .map((param) => param.label?.trim() || param.name || "parameter");
}

export function parseProcessorPreviewParam(
  param: ParamDraft,
  raw: string,
): unknown {
  if (raw === "") return undefined;
  if (param.type === "number") return Number(raw);
  if (param.type === "boolean") return raw === "true";
  if (param.type === "list") {
    return raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return raw;
}

function empty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
