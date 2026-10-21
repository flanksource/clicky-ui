import { RuntimeBar, type RuntimeBarProps } from "../runtime/RuntimeBar";
import {
  runtimeFieldSupport,
  SUPPORT_ALL_RUNTIME_FIELDS,
} from "../runtime/runtime-field-support";
import {
  familyForModel,
  firstMode,
  runtimeModeError,
  runtimeModeFromModel,
  runtimeModelError,
  SPEC_RUNTIME_FAMILIES,
} from "../runtime/runtime-mode";
import { runtimeSpecFields } from "./runtime-spec-fields";
import type {
  AISpecRuntimeCommit,
  AISpecRuntimeValue,
} from "./SpecRuntimeEditor.model";
import type { SpecSectionId } from "./SpecRuntimeEditor/types";

export type SpecRuntimeBarProps = Pick<
  RuntimeBarProps<AISpecRuntimeValue>,
  | "value"
  | "onChange"
  | "models"
  | "families"
  | "effectiveMode"
  | "effectiveModel"
  | "reasoningEfforts"
  | "ariaLabel"
  | "className"
> & {
  readOnly?: boolean | undefined;
  variant?: "run" | "preset" | undefined;
  sections?: readonly SpecSectionId[] | undefined;
  inheritedCommits?: AISpecRuntimeCommit[] | undefined;
};

export function SpecRuntimeBar({
  value,
  onChange,
  models = [],
  families: catalog,
  effectiveMode,
  effectiveModel,
  reasoningEfforts,
  ariaLabel = "Runtime",
  className,
  readOnly = false,
  variant = "run",
  sections,
  inheritedCommits,
}: SpecRuntimeBarProps) {
  const families = catalog?.length ? catalog : SPEC_RUNTIME_FAMILIES;
  const family = familyForModel(
    families,
    models,
    value.model || effectiveModel,
  );
  const mode =
    value.mode?.trim() ||
    runtimeModeFromModel(value.model) ||
    effectiveMode ||
    firstMode(families[0] ?? SPEC_RUNTIME_FAMILIES[0]!).id;
  const error =
    runtimeModelError(value.model || effectiveModel) ??
    runtimeModeError(families, mode, family?.id);
  const supports = error
    ? SUPPORT_ALL_RUNTIME_FIELDS
    : runtimeFieldSupport(families, mode, family?.id);
  const change = (next: AISpecRuntimeValue) => {
    if (!readOnly) onChange(next);
  };
  const fields = runtimeSpecFields({
    value,
    onChange: change,
    models,
    families,
    effectiveMode,
    effectiveModel,
    variant,
    inheritedCommits,
  }).filter(
    (field) =>
      !sections ||
      sections.includes(
        field.id === "permissions.mode"
          ? "permissions"
          : field.id === "workflow.commits"
            ? "commit"
            : "workspace",
      ),
  );
  return (
    <fieldset
      disabled={readOnly}
      className="m-0 min-w-0 border-0 p-0 disabled:opacity-50"
    >
      <RuntimeBar
        value={value}
        onChange={change}
        models={models}
        families={families}
        effectiveMode={effectiveMode}
        effectiveModel={effectiveModel}
        reasoningEfforts={reasoningEfforts}
        showModel={supports("model")}
        showEffort={supports("effort")}
        showCost={supports("budget.cost")}
        showTimeout={supports("budget.timeout")}
        actions={{ fields }}
        ariaLabel={ariaLabel}
        className={className}
      />
    </fieldset>
  );
}
