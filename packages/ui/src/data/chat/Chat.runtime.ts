import {
  reconcileModelCapabilities,
  type ModelRuntimeSelection,
} from "../runtime/model-capabilities";
import { runtimeModelForValue } from "../runtime/RuntimeBar.model";
import type { ChatModel, ChatModelRuntime } from "./types";

export type ResolveChatRuntimeOptions = {
  models: ChatModel[];
  current?: ChatModelRuntime | undefined;
  preferredModel?: string | undefined;
  effort?: string | undefined;
  temperature?: number | undefined;
  reasoningEfforts: readonly string[];
};

export function resolveChatRuntime({
  models,
  current = {},
  preferredModel,
  effort,
  temperature,
  reasoningEfforts,
}: ResolveChatRuntimeOptions): ChatModelRuntime {
  const currentModel = selectedChatModel(models, current);
  const selected = preferredModel
    ? currentModel?.id === preferredModel
      ? currentModel
      : models.find((model) => model.id === preferredModel)
    : currentModel;
  let next: ChatModelRuntime;
  if (selected) {
    const preservesExecutionSelection = Boolean(
      selected === currentModel &&
      current.mode !== undefined &&
      selected.runtime?.mode !== undefined &&
      selected.runtime.mode !== current.mode,
    );
    next = reconcileModelCapabilities(
      current,
      selected,
      reasoningEfforts,
      preservesExecutionSelection ? { mode: current.mode } : undefined,
    );
    if (!next.id && !next.model) next.id = selected.id;
  } else if (preferredModel) {
    next = { ...current, model: preferredModel };
  } else {
    next = { ...current };
  }
  return withRuntimeOverrides(next, effort, temperature);
}

export function selectedChatModel(
  models: ChatModel[],
  runtime: ModelRuntimeSelection,
): ChatModel | undefined {
  return runtimeModelForValue(models, runtime);
}

export function withRuntimeOverrides<T extends ChatModelRuntime>(
  runtime: T,
  effort: string | undefined,
  temperature: number | undefined,
): T {
  const next = { ...runtime };
  if (effort !== undefined) {
    setOptionalRuntimeField(next as Record<string, unknown>, "effort", effort);
  }
  if (temperature !== undefined) next.temperature = temperature;
  return next;
}

export function withRuntimeField<T extends ChatModelRuntime>(
  runtime: T,
  key: keyof ChatModelRuntime,
  value: unknown,
): T {
  const next = { ...runtime } as Record<string, unknown>;
  setOptionalRuntimeField(next, key, value);
  return next as T;
}

export function hasStructuredRuntime(
  runtime: ChatModelRuntime,
  selected: ChatModel | undefined,
): boolean {
  return Boolean(
    selected?.runtime ||
    runtime.id ||
    runtime.mode ||
    runtime.noCache ||
    runtime.fallbacks?.length,
  );
}

function setOptionalRuntimeField(
  runtime: Record<string, unknown>,
  key: keyof ChatModelRuntime,
  value: unknown,
): void {
  if (value === undefined || value === "") {
    delete runtime[key];
  } else {
    runtime[key] = value;
  }
}
