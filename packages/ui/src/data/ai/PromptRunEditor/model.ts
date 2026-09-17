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
  /** Ordered runtime presets layered under spec. */
  presets?: string[];
  /** @deprecated Ignored by current hosts; use presets. */
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

export type PromptRunModelMode = "single" | "multi";

export function modelModeOf(value: AIPromptRunValue): PromptRunModelMode {
  return runtimeRows(value).length > 1 ? "multi" : "single";
}

// Multi-model means at least two comparison rows, so switching seeds a second
// row on the first row's mode and switching back keeps only the first row.
export function withModelMode(
  value: AIPromptRunValue,
  mode: PromptRunModelMode,
): AIPromptRunValue {
  const rows = runtimeRows(value);
  if (mode === "single") return withRuntimeRows(value, rows.slice(0, 1));
  if (rows.length > 1) return value;
  const first = rows[0] ?? {};
  return withRuntimeRows(value, [
    first,
    first.mode ? { mode: first.mode } : {},
  ]);
}

export type AISingleRuntime = AISpecRuntimeModel &
  Pick<AISpecRuntimeValue, "budget">;

export function singleRuntimeOf(value: AIPromptRunValue): AISingleRuntime {
  const runtime: AISingleRuntime = { ...runtimeRows(value)[0] };
  if (value.spec?.budget) runtime.budget = value.spec.budget;
  return runtime;
}

export function withSingleRuntime(
  value: AIPromptRunValue,
  { budget, ...runtime }: AISingleRuntime,
): AIPromptRunValue {
  const spec = { ...value.spec };
  if (budget) spec.budget = budget;
  else delete spec.budget;
  return withRuntimeRows({ ...value, spec }, [runtime]);
}

// A recent runtime replaces the single run's model identity (limits stay on the
// spec) or joins a multi-model run as another comparison row.
export function withRecentRuntime(
  value: AIPromptRunValue,
  runtime: AISpecRuntimeModel,
): AIPromptRunValue {
  return withRuntimeRows(
    value,
    modelModeOf(value) === "single"
      ? [runtime]
      : [...runtimeRows(value), runtime],
  );
}

export const RECENT_RUNTIME_LIMIT = 5;

// Newest first. A row that inherits both model and mode says nothing about
// which runtime was used, so it is not worth offering again.
export function recordRecentRuntimes(
  recent: readonly AISpecRuntimeModel[],
  used: readonly AISpecRuntimeModel[],
): AISpecRuntimeModel[] {
  const next = [
    ...used.filter((runtime) => runtime.model || runtime.mode),
    ...recent,
  ];
  const seen = new Set<string>();
  return next
    .filter((runtime) => {
      const key = recentRuntimeKey(runtime);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, RECENT_RUNTIME_LIMIT);
}

export function recentRuntimeKey(runtime: AISpecRuntimeModel): string {
  return JSON.stringify(MODEL_KEYS.map((key) => runtime[key] ?? null));
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
