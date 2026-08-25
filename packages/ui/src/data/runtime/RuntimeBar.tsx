import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import { applyRuntimeBackend, runtimeModelForValue } from "./RuntimeBar.model";
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
  selectionForBackend,
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
  /** Resolved backend shown when the editable value inherits it from another layer. */
  effectiveBackend?: string | undefined;
  /** Effort tiers offered when the catalog does not describe the model. */
  reasoningEfforts?: string[] | undefined;
  /** Locks model identity (family, backend, and model) while leaving effort editable. */
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
  effectiveBackend,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  locked = false,
  showModel = true,
  showEffort = true,
  ariaLabel = "Runtime",
  className,
}: RuntimeBarProps<T>) {
  const backend = value.backend?.trim() || effectiveBackend?.trim();
  const selection = selectionForBackend(families, backend);
  const family = familyById(families, selection.family);
  const mode =
    family.modes.find((entry) => entry.id === selection.mode) ??
    firstMode(family);
  const modelOptions = modelsForFamily(models, family, value.backend);
  const resolvedModel = runtimeModelForValue(models, value, isSelectableModel);
  const selectedModelUnavailable = Boolean(
    (value.id || value.model) &&
      runtimeModelForValue(models, value, (entry) => !isSelectableModel(entry)),
  );
  const supportedEfforts = effortOptionsForModel(
    resolvedModel,
    reasoningEfforts,
  );

  const applyBackend = (familyId: string, modeId: string) => {
    const next = applyRuntimeBackend(
      value,
      models,
      families,
      familyId,
      modeId,
      reasoningEfforts,
    );
    if (next !== value) onChange(next);
  };

  const preserveSelectedMode = (next: T) =>
    value.backend === mode.backend
      ? withRuntimeValue(next, { mode: mode.id })
      : next;
  const applyCustomModel = (model: string) => {
    onChange(
      preserveSelectedMode(
        withOptionalRuntimeValue(withoutCatalogModel(value), "model", model),
      ),
    );
  };
  // A menu row carries the backend of the catalog it was listed under, and one
  // catalog serves several backends — claude-cli and claude-cmux models are
  // listed as claude-agent rows. Copying the row's runtime verbatim would let
  // picking a model silently move the user off the mode they chose, so a row
  // drawn from the selected mode's own catalog keeps that mode.
  const applyModel = (model: ChatModel) => {
    const next = reconcileModelCapabilities(
      withoutCatalogModel(value),
      model,
      reasoningEfforts,
      { backend: mode.backend, mode: mode.id },
    );
    onChange(next);
  };
  const clearModel = () => {
    onChange(preserveSelectedMode(withoutCatalogModel(value)));
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
        onFamilyChange={(familyId) => applyBackend(familyId, selection.mode)}
        onModeChange={(modeId) => applyBackend(family.id, modeId)}
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
      onBackendChange={applyBackend}
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

function withRuntimeValue<T extends RuntimeBarValue>(
  value: T,
  patch: Partial<RuntimeBarValue>,
): T {
  return { ...value, ...patch };
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
