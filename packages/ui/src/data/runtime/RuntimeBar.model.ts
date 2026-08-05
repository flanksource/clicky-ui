import type { StaticIconComponent } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import type { RuntimeBarValue } from "./RuntimeBar";
import type { SpecRuntimeFamily } from "./runtime-mode";

export function runtimeFamilyBrand(family: SpecRuntimeFamily): {
  icon: StaticIconComponent | undefined;
  color: string | undefined;
} {
  const key = providerIcon(family.id) ? family.id : family.provider;
  return { icon: providerIcon(key), color: providerIconColor(key) };
}

export function runtimeModelMatches(
  model: ChatModel,
  value: RuntimeBarValue,
): boolean {
  return (
    (value.id !== undefined &&
      (model.id === value.id || model.runtime?.id === value.id)) ||
    (value.model !== undefined &&
      (model.id === value.model || model.runtime?.model === value.model))
  );
}
