import type { StaticIconComponent } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import { reconcileModelCapabilities } from "./model-capabilities";
import {
  backendForFamilyMode,
  familyById,
  modelForFamily,
  modelMatchesBackend,
  selectionForBackend,
  type SpecRuntimeFamily,
} from "./runtime-mode";

type RuntimeBackendValue = ChatModelRuntime & {
  cliArgs?: Record<string, unknown> | undefined;
};

export function runtimeFamilyBrand(family: SpecRuntimeFamily): {
  icon: StaticIconComponent | undefined;
  color: string | undefined;
} {
  const key = providerIcon(family.id) ? family.id : family.provider;
  return { icon: providerIcon(key), color: providerIconColor(key) };
}

/** Matches a catalog row against both runtime identity and execution selectors. */
export function runtimeModelMatches(
  model: ChatModel,
  value: ChatModelRuntime,
): boolean {
  if (!runtimeModelIdentityMatches(model, value)) return false;
  if (!modelMatchesBackend(model, value.backend)) return false;
  if (
    value.backend !== undefined &&
    model.runtime?.backend !== undefined &&
    model.runtime.backend !== value.backend
  ) {
    return false;
  }
  if (
    value.mode !== undefined &&
    model.runtime?.mode !== undefined &&
    model.runtime.mode !== value.mode
  ) {
    return false;
  }
  return true;
}

/** Finds one exact runtime row, falling back only when its identity is unique. */
export function runtimeModelForValue(
  models: ChatModel[],
  value: ChatModelRuntime,
  isEligible: (model: ChatModel) => boolean = () => true,
): ChatModel | undefined {
  const exact = models.find(
    (model) => isEligible(model) && runtimeModelMatches(model, value),
  );
  if (exact) return exact;
  const identityMatches = models.filter((model) =>
    runtimeModelIdentityMatches(model, value),
  );
  const only = identityMatches.length === 1 ? identityMatches[0] : undefined;
  return only && isEligible(only) ? only : undefined;
}

function runtimeModelIdentityMatches(
  model: ChatModel,
  value: ChatModelRuntime,
): boolean {
  return (
    (value.id !== undefined &&
      (model.id === value.id || model.runtime?.id === value.id)) ||
    (value.model !== undefined &&
      (model.id === value.model || model.runtime?.model === value.model))
  );
}

/** Applies a family/mode transition without replacing user-owned runtime options. */
export function applyRuntimeBackend<T extends RuntimeBackendValue>(
  value: T,
  models: ChatModel[],
  families: SpecRuntimeFamily[],
  familyId: string,
  modeId: string,
  reasoningEfforts: readonly string[],
): T {
  const backend = backendForFamilyMode(families, familyId, modeId);
  const mode = selectionForBackend(families, backend).mode;
  if (
    backend === (value.backend ?? "") &&
    (value.mode === undefined || mode === value.mode)
  ) {
    return value;
  }

  const currentModel = runtimeModelForValue(models, value);
  const modelId =
    currentModel?.runtime?.model ?? value.model ?? currentModel?.id ?? value.id;
  const nextModel = modelForFamily(
    modelId,
    models,
    familyById(families, familyId),
    backend,
  );
  let next = withoutCatalogModel(value);
  if (nextModel) {
    next = reconcileModelCapabilities(next, nextModel, reasoningEfforts, {
      backend,
      mode,
    });
  } else {
    next = { ...next, backend, mode };
  }
  delete next.cliArgs;
  return next;
}

function withoutCatalogModel<T extends RuntimeBackendValue>(value: T): T {
  const next = { ...value };
  delete next.model;
  delete next.id;
  return next;
}
