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

/**
 * Applies catalog identity and capabilities under the caller's execution
 * policy. A model or mode change never invents a reasoning effort the user
 * did not choose — it only drops one the new model can't run. Pass
 * `defaultEffort: true` for a seeding path (chat's initial/default runtime)
 * that must land on a usable tier when nothing is set.
 */
export function reconcileModelCapabilities<T extends ModelRuntimeSelection>(
  value: T,
  model: ChatModel | undefined,
  fallbackEfforts: readonly string[],
  execution?: {
    mode?: string | undefined;
    defaultEffort?: boolean;
  },
): T {
  const next = { ...value } as ModelRuntimeSelection;
  if (model?.runtime) {
    delete next.model;
    delete next.id;
    delete next.mode;
    Object.assign(next, model.runtime);
  } else if (model) {
    next.model = model.id;
  }

  if (execution?.mode !== undefined) {
    next.mode = execution.mode;
  }

  const efforts = effortOptionsForModel(model, fallbackEfforts);
  const unsupported = Boolean(next.effort) && !efforts.includes(next.effort!);
  if ((model?.capabilitiesKnown && efforts.length === 0) || unsupported) {
    delete next.effort;
  }
  if (execution?.defaultEffort && efforts.length > 0 && !next.effort) {
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
