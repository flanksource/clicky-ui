import type { ChatModel, ChatModelRuntime } from "../chat/types";

// The selection a runtime control edits is exactly the wire value a catalog row
// carries (`reconcileModelCapabilities` copies one onto the other), so it stays
// one declaration — a field added to the catalog shape cannot drift out of the
// editable shape.
export type ModelRuntimeSelection = ChatModelRuntime;

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
  if (model?.runtime) {
    delete next.model;
    delete next.id;
    delete next.backend;
    delete next.temperature;
    delete next.effort;
    delete next.noCache;
    delete next.fallbacks;
    Object.assign(next, model.runtime);
  } else if (model) {
    next.model = model.id;
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
