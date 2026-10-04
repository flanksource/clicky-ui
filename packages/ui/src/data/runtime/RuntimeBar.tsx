import { useState } from "react";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import { withBudgetLimit, type RuntimeBarBudget } from "./RuntimeBar.limits";
import { runtimeModelForValue } from "./RuntimeBar.model";
import { RuntimeBarLayout } from "./RuntimeBarLayout";
import type { RuntimeBarActionsProps } from "./RuntimeBarActions";
import { timeoutField, budgetField, effortField } from "./RuntimeBar.fields";
import {
  modelGroupsForMode,
  runtimeModes,
  withRuntimeMode,
} from "./RuntimeBar.selection";
import { isSelectableModel } from "./availability";
import {
  effortOptionsForModel,
  reconcileModelCapabilities,
} from "./model-capabilities";
import {
  SPEC_RUNTIME_FAMILIES,
  familyById,
  selectionForRuntime,
  runtimeModeFromModel,
  type SpecRuntimeFamily,
} from "./runtime-mode";

export type RuntimeBarValue = ChatModelRuntime & {
  cliArgs?: Record<string, unknown>;
  /** Run limits edited by the opt-in timeout and max cost controls. */
  budget?: RuntimeBarBudget;
};

export type RuntimeBarProps<T extends RuntimeBarValue = RuntimeBarValue> = {
  value: T;
  onChange: (value: T) => void;
  /** Model catalog grouped by family and filtered by the selected mode. */
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  /** Resolved mode shown when the editable value inherits it from another layer. */
  effectiveMode?: string | undefined;
  /** Resolved model used to identify the inherited provider family without persisting it. */
  effectiveModel?: string | undefined;
  /** Effort tiers offered when the catalog does not describe the model. */
  reasoningEfforts?: string[] | undefined;
  /** Locks model identity (family, mode, and model) while leaving effort editable. */
  locked?: boolean | undefined;
  /** Whether the selected runtime exposes a model argument. */
  showModel?: boolean | undefined;
  /** Whether the selected runtime exposes reasoning effort. */
  showEffort?: boolean | undefined;
  /** Opt-in control for `budget.timeout`. */
  showTimeout?: boolean | undefined;
  /** Opt-in control for `budget.cost`. */
  showCost?: boolean | undefined;
  /** Host-level settings belonging to the surrounding spec rather than this runtime row. */
  actions?:
    | Pick<RuntimeBarActionsProps, "fields" | "menu" | "menuLabel">
    | undefined;
  ariaLabel?: string | undefined;
  className?: string | undefined;
};

/** Mode-first runtime controls with settings that adapt to the container width. */
export function RuntimeBar<T extends RuntimeBarValue>({
  value,
  onChange,
  models = [],
  families = SPEC_RUNTIME_FAMILIES,
  effectiveMode,
  effectiveModel,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  locked = false,
  showModel = true,
  showEffort = true,
  showTimeout = false,
  showCost = false,
  actions,
  ariaLabel = "Runtime",
  className,
}: RuntimeBarProps<T>) {
  const [preference, setPreference] = useState<{
    model: string | undefined;
    family: string | undefined;
  }>({ model: effectiveModel, family: undefined });
  if (preference.model !== effectiveModel) {
    setPreference({ model: effectiveModel, family: undefined });
  }
  const preferredFamily =
    preference.model === effectiveModel ? preference.family : undefined;
  const specMode =
    value.mode?.trim() ||
    runtimeModeFromModel(value.model) ||
    effectiveMode?.trim();
  const selection = selectionForRuntime(
    families,
    specMode,
    value.id || value.model || (preferredFamily ? undefined : effectiveModel),
    models,
    preferredFamily,
  );
  const family = familyById(families, selection.family);
  const modes = runtimeModes(families);
  const mode = modes.find((entry) => entry.id === selection.mode);
  if (!mode)
    throw new Error(
      `No available runtime mode for ${JSON.stringify(selection.mode)}`,
    );
  const groups = modelGroupsForMode({ models, families, mode: mode.id });
  const resolvedModel = runtimeModelForValue(
    groups.flatMap((group) => group.models),
    value,
  );
  const selectedModelUnavailable = Boolean(
    !resolvedModel &&
    (value.id || value.model) &&
    runtimeModelForValue(models, value, (entry) => !isSelectableModel(entry)),
  );
  const supportedEfforts = effortOptionsForModel(
    resolvedModel,
    reasoningEfforts,
  );
  // The name an Unspecified model would resolve to, so the picker can say what
  // it inherits instead of leaving the operator guessing.
  const inheritedModelLabel =
    value.model || value.id
      ? undefined
      : (runtimeModelForValue(
          models,
          effectiveModel !== undefined ? { model: effectiveModel } : {},
          isSelectableModel,
        )?.label ?? effectiveModel);

  const applyMode = (familyId: string, modeId: string) => {
    setPreference({ model: effectiveModel, family: familyId });
    const next = withRuntimeMode({
      value,
      models,
      families,
      mode: modeId,
      reasoningEfforts,
    });
    if (next !== value) onChange(next);
  };

  const applyCustomModel = (model: string) => {
    onChange(
      withOptionalRuntimeValue(withoutCatalogModel(value), "model", model),
    );
  };
  // A family's model catalog can serve several modes. Selecting a row must not
  // silently move the user away from the mode they chose.
  const applyModel = (model: ChatModel) => {
    const next = reconcileModelCapabilities(
      withoutCatalogModel(value),
      model,
      reasoningEfforts,
      { mode: mode.id },
    );
    onChange(next);
  };
  const clearModel = () => {
    onChange(withoutCatalogModel(value));
  };
  const applyEffort = (effort: string) =>
    onChange(withOptionalRuntimeValue(value, "effort", effort));

  const fields = [
    ...(showEffort && supportedEfforts.length > 0
      ? [
          effortField({
            value: value.effort,
            offered: reasoningEfforts,
            supported: supportedEfforts,
            onChange: applyEffort,
          }),
        ]
      : []),
    ...(actions?.fields ?? []),
    ...(showCost
      ? [
          budgetField({
            value: value.budget?.cost,
            onChange: (cost) => onChange(withBudgetLimit(value, "cost", cost)),
          }),
        ]
      : []),
    ...(showTimeout
      ? [
          timeoutField({
            value: value.budget?.timeout,
            onChange: (timeout) =>
              onChange(withBudgetLimit(value, "timeout", timeout)),
          }),
        ]
      : []),
  ];
  return (
    <RuntimeBarLayout
      ariaLabel={ariaLabel}
      className={className}
      actions={{ ...actions, fields }}
      identity={{
        family,
        mode,
        modes,
        groups,
        selectedModel: resolvedModel,
        model: value.model,
        unavailable: selectedModelUnavailable,
        inheritedModelLabel,
        locked,
        showModel,
        onModeChange: (modeId) => applyMode(family.id, modeId),
        onCustomModel: applyCustomModel,
        onModelSelect: applyModel,
        onModelClear: clearModel,
        onFamilySelect: (familyId) => {
          setPreference({ model: effectiveModel, family: familyId });
          onChange(withoutCatalogModel(value));
        },
      }}
    />
  );
}

function withoutCatalogModel<T extends RuntimeBarValue>(value: T): T {
  return withOptionalRuntimeValue(
    withOptionalRuntimeValue(value, "model", undefined),
    "id",
    undefined,
  );
}

function withOptionalRuntimeValue<T extends RuntimeBarValue>(
  value: T,
  key: keyof RuntimeBarValue,
  next: unknown,
): T {
  const updated = { ...value } as Record<string, unknown>;
  if (next === undefined || next === "") {
    delete updated[key];
  } else {
    updated[key] = next;
  }
  return updated as T;
}
