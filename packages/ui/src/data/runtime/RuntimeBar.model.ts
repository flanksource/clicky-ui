import type { StaticIconComponent } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import {
  modelMatchesBackend,
  type SpecRuntimeFamily,
} from "./runtime-mode";

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
  if (value.id !== undefined) {
    return model.id === value.id || model.runtime?.id === value.id;
  }
  return Boolean(
    value.model !== undefined &&
      (model.id === value.model || model.runtime?.model === value.model),
  );
}
