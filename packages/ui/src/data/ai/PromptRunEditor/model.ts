import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";

export type AIPromptRunSpec = AISpecRuntimeValue & {
  messages?: unknown[];
  toolPreferences?: unknown;
  toolApproval?: unknown;
};

export type AISpecRuntimeModel = Pick<
  AISpecRuntimeValue,
  "model" | "id" | "mode" | "temperature" | "effort" | "noCache" | "fallbacks"
>;

export type AIPromptRunValue = {
  variables?: Record<string, unknown>;
  spec?: AIPromptRunSpec;
  runtimes?: AISpecRuntimeModel[];
  chat?: boolean;
  /** Saved runtime profile (id or name) layered under `spec` by the host. */
  runtimeProfile?: string;
};

const MODEL_KEYS = [
  "model",
  "id",
  "mode",
  "temperature",
  "effort",
  "noCache",
  "fallbacks",
] as const satisfies readonly (keyof AISpecRuntimeModel)[];

export function runtimeModelFromSpec(
  spec: AIPromptRunSpec | undefined,
): AISpecRuntimeModel {
  if (!spec) return {};
  const model: AISpecRuntimeModel = {};
  for (const key of MODEL_KEYS) {
    const value = spec[key];
    if (value !== undefined) {
      Object.assign(model, { [key]: value });
    }
  }
  return model;
}

export function runtimeRows(value: AIPromptRunValue): AISpecRuntimeModel[] {
  return value.runtimes?.length
    ? value.runtimes
    : [runtimeModelFromSpec(value.spec)];
}

export function withRuntimeRows(
  value: AIPromptRunValue,
  rows: AISpecRuntimeModel[],
): AIPromptRunValue {
  const first = rows[0] ?? {};
  const spec = withRuntimeModel(value.spec ?? {}, first);
  if (rows.length <= 1) {
    const next = { ...value, spec };
    delete next.runtimes;
    return next;
  }
  return { ...value, spec, runtimes: rows };
}

function withRuntimeModel(
  spec: AIPromptRunSpec,
  model: AISpecRuntimeModel,
): AIPromptRunSpec {
  const next = { ...spec };
  for (const key of MODEL_KEYS) {
    delete next[key];
  }
  return { ...next, ...model };
}
