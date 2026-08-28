import type { ChatModel, ChatModelRuntime } from "../chat/types";

// Runtime controls and catalog rows share one wire shape. Reconciliation copies
// catalog identity while retaining user-owned runtime options that remain valid.
export type ModelRuntimeSelection = ChatModelRuntime;

/** Lists the effort values accepted by the selected catalog model. */
export function effortOptionsForModel(
  model: ChatModel | undefined,
  fallbackEfforts: readonly string[],
): string[] {
  if (!model?.capabilitiesKnown) return [...fallbackEfforts];
  if (!model.reasoning) return [];
  return [...(model.supportedEfforts ?? [])];
}

/** Applies catalog identity and capabilities under the caller's execution policy. */
export function reconcileModelCapabilities<T extends ModelRuntimeSelection>(
  value: T,
  model: ChatModel | undefined,
  fallbackEfforts: readonly string[],
  execution?: {
    backend: string | undefined;
    mode: string | undefined;
  },
): T {
  const next = { ...value } as ModelRuntimeSelection;
  if (model?.runtime) {
    delete next.model;
    delete next.id;
    delete next.backend;
    delete next.mode;
    Object.assign(next, model.runtime);
  } else if (model) {
    next.model = model.id;
  }

  if (execution) {
    if (execution.backend) next.backend = execution.backend;
    else delete next.backend;
    if (execution.mode) next.mode = execution.mode;
    else delete next.mode;
  }

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
