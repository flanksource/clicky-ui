import { useState } from "react";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import { applyRuntimeMode, runtimeModelForValue } from "./RuntimeBar.model";
import { RuntimeBarCombo } from "./RuntimeBarCombo";
import { RuntimeBarSegments } from "./RuntimeBarSegments";
import { isSelectableModel } from "./availability";
import {
  effortOptionsForModel,
  reconcileModelCapabilities,
} from "./model-capabilities";
import {
  SPEC_RUNTIME_FAMILIES,
  familyById,
  firstMode,
  modelsForFamily,
  selectionForRuntime,
  runtimeModeFromModel,
  type SpecRuntimeFamily,
} from "./runtime-mode";

export type RuntimeBarValue = ChatModelRuntime & {
  cliArgs?: Record<string, unknown>;
};

export type RuntimeBarProps<T extends RuntimeBarValue = RuntimeBarValue> = {
  value: T;
  onChange: (value: T) => void;
  /** `segmented` uses field triggers; `combo` uses one direct-edit menu. */
  variant?: "combo" | "segmented";
  /** Model catalog. Only the selected family's models are listed; a family the
   *  catalog does not describe is served by the segment's free-text entry. */
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
  ariaLabel?: string | undefined;
  className?: string | undefined;
};

/** Self-describing runtime controls with segmented and combo presentations. */
export function RuntimeBar<T extends RuntimeBarValue>({
  value,
  onChange,
  variant = "segmented",
  models = [],
  families = SPEC_RUNTIME_FAMILIES,
  effectiveMode,
  effectiveModel,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  locked = false,
  showModel = true,
  showEffort = true,
  ariaLabel = "Runtime",
  className,
}: RuntimeBarProps<T>) {
  const [preferredFamily, setPreferredFamily] = useState<string>();
  const specMode =
    runtimeModeFromModel(value.model) ||
    value.mode?.trim() ||
    effectiveMode?.trim();
  const selection = selectionForRuntime(
    families,
    specMode,
    value.model || effectiveModel,
    models,
    preferredFamily,
  );
  const family = familyById(families, selection.family);
  const mode =
    family.modes.find((entry) => entry.id === selection.mode) ??
    firstMode(family);
  const modelOptions = modelsForFamily(models, family, specMode);
  const resolvedModel = runtimeModelForValue(models, value, isSelectableModel);
  const selectedModelUnavailable = Boolean(
    !resolvedModel &&
    (value.id || value.model) &&
    runtimeModelForValue(models, value, (entry) => !isSelectableModel(entry)),
  );
  const supportedEfforts = effortOptionsForModel(
    resolvedModel,
    reasoningEfforts,
  );

  const applyMode = (familyId: string, modeId: string) => {
    setPreferredFamily(familyId);
    const next = applyRuntimeMode(
      value,
      models,
      families,
      familyId,
      modeId,
      reasoningEfforts,
    );
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

  if (variant === "combo") {
    return (
      <RuntimeBarCombo
        value={value}
        families={families}
        family={family}
        mode={mode}
        selectedMode={selection.mode}
        models={modelOptions}
        selectedModel={resolvedModel}
        selectedModelUnavailable={selectedModelUnavailable}
        supportedEfforts={supportedEfforts}
        locked={locked}
        showModel={showModel}
        showEffort={showEffort}
        ariaLabel={ariaLabel}
        className={className}
        onFamilyChange={(familyId) => applyMode(familyId, selection.mode)}
        onModeChange={(modeId) => applyMode(family.id, modeId)}
        onModelSelect={applyModel}
        onModelClear={clearModel}
        onEffortChange={applyEffort}
      />
    );
  }

  return (
    <RuntimeBarSegments
      value={value}
      models={models}
      modelOptions={modelOptions}
      resolvedModel={resolvedModel}
      selectedModelUnavailable={selectedModelUnavailable}
      families={families}
      family={family}
      mode={mode}
      selectedMode={selection.mode}
      reasoningEfforts={reasoningEfforts}
      supportedEfforts={supportedEfforts}
      locked={locked}
      showModel={showModel}
      showEffort={showEffort}
      ariaLabel={ariaLabel}
      className={className}
      onModeChange={applyMode}
      onCustomModel={applyCustomModel}
      onModelSelect={applyModel}
      onModelClear={clearModel}
      onEffortChange={applyEffort}
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
