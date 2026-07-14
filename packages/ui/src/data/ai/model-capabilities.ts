import type { ChatModel } from "../chat/types";

export type ModelRuntimeSelection = {
  model?: string;
  effort?: string;
  temperature?: number;
};

export function effortOptionsForModel(
  model: ChatModel | undefined,
  fallbackEfforts: readonly string[],
): string[] {
  if (!model?.capabilitiesKnown) return [...fallbackEfforts];
  if (!model.reasoning) return [];
  return [...(model.supportedEfforts ?? [])];
}

export function reconcileModelCapabilities<T extends ModelRuntimeSelection>(
  value: T,
  model: ChatModel | undefined,
  fallbackEfforts: readonly string[],
): T {
  const next = { ...value } as ModelRuntimeSelection;
  if (model) next.model = model.id;

  const efforts = effortOptionsForModel(model, fallbackEfforts);
  if (model?.capabilitiesKnown && efforts.length === 0) {
    delete next.effort;
  } else if (
    efforts.length > 0 &&
    (!next.effort || !efforts.includes(next.effort))
  ) {
    const preferred = model?.defaultEffort;
    next.effort =
      preferred && efforts.includes(preferred)
        ? preferred
        : efforts.includes("medium")
          ? "medium"
        : efforts[0]!;
  }

  if (model?.temperature === false) delete next.temperature;
  return next as T;
}
