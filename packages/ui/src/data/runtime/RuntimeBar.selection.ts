import type { ChatModel } from "../chat/types";
import type { RuntimeBarValue } from "./RuntimeBar";
import { isUnavailable } from "./availability";
import { reconcileModelCapabilities } from "./model-capabilities";
import { runtimeModelForValue } from "./RuntimeBar.model";
import {
  modelsForFamily,
  runtimeModeFromModel,
  runtimeModeIcon,
  type SpecRuntimeFamily,
} from "./runtime-mode";

export function runtimeModes(families: SpecRuntimeFamily[]) {
  return [
    ...new Map(
      families
        .flatMap((family) => family.modes)
        .filter((mode) => !isUnavailable(mode.availability))
        .map((mode) => {
          const icon = mode.icon ?? runtimeModeIcon(mode.id);
          return [mode.id, icon ? { ...mode, icon } : mode] as const;
        }),
    ).values(),
  ];
}

export function modelGroupsForMode({
  models,
  families,
  mode,
}: {
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  mode: string;
}) {
  return families
    .filter((family) =>
      family.modes.some(
        (entry) => entry.id === mode && !isUnavailable(entry.availability),
      ),
    )
    .map((family) => ({
      family,
      models: modelsForFamily(models, family, mode).filter((model) => {
        const modelMode =
          model.runtime?.mode ??
          runtimeModeFromModel(model.runtime?.model ?? model.id);
        return modelMode === undefined || modelMode === mode;
      }),
    }));
}

export function withRuntimeMode<T extends RuntimeBarValue>({
  value,
  models,
  families,
  mode,
  reasoningEfforts,
}: {
  value: T;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  mode: string;
  reasoningEfforts: readonly string[];
}): T {
  if (!runtimeModes(families).some((entry) => entry.id === mode)) {
    throw new Error(`Runtime mode ${JSON.stringify(mode)} is unavailable`);
  }
  const eligible = modelGroupsForMode({ models, families, mode }).flatMap(
    (group) => group.models,
  );
  const model = runtimeModelForValue(eligible, { ...value, mode });
  const next = { ...value, mode };
  delete next.id;
  delete next.model;
  delete next.cliArgs;
  return model
    ? reconcileModelCapabilities(next, model, reasoningEfforts, { mode })
    : next;
}
