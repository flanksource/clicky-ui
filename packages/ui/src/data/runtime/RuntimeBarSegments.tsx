import { InputField } from "../../components/InputField";
import { cn } from "../../lib/utils";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "../chat/effort-icons";
import { providerIcon } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import { runtimeFamilyBrand } from "./RuntimeBar.model";
import type { RuntimeBarValue } from "./RuntimeBar";
import { CostSegment, TimeoutSegment } from "./RuntimeBarLimits";
import {
  RuntimeSegment,
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "./RuntimeBarSegment";
import { isUnavailable } from "./availability";
import {
  modelsForFamily,
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "./runtime-mode";
import {
  UNSPECIFIED_HINT,
  UNSPECIFIED_LABEL,
  unspecifiedHint,
} from "./unspecified";

export type RuntimeBarSegmentsProps = {
  value: RuntimeBarValue;
  models: ChatModel[];
  modelOptions: ChatModel[];
  resolvedModel: ChatModel | undefined;
  selectedModelUnavailable: boolean;
  /** Display name of the model this layer would inherit when unspecified. */
  inheritedModelLabel?: string | undefined;
  families: SpecRuntimeFamily[];
  family: SpecRuntimeFamily;
  mode: SpecRuntimeModeOption;
  selectedMode: string;
  reasoningEfforts: string[];
  supportedEfforts: string[];
  locked: boolean;
  showModel: boolean;
  showEffort: boolean;
  showTimeout: boolean;
  showCost: boolean;
  ariaLabel: string;
  className?: string | undefined;
  onModeChange: (familyId: string, modeId: string) => void;
  onCustomModel: (model: string) => void;
  onModelSelect: (model: ChatModel) => void;
  onModelClear: () => void;
  onEffortChange: (effort: string) => void;
  onTimeoutChange: (timeout: string | undefined) => void;
  onCostChange: (cost: number | undefined) => void;
};

export function RuntimeBarSegments({
  value,
  models,
  modelOptions,
  resolvedModel,
  selectedModelUnavailable,
  inheritedModelLabel,
  families,
  family,
  mode,
  selectedMode,
  reasoningEfforts,
  supportedEfforts,
  locked,
  showModel,
  showEffort,
  showTimeout,
  showCost,
  ariaLabel,
  className,
  onModeChange,
  onCustomModel,
  onModelSelect,
  onModelClear,
  onEffortChange,
  onTimeoutChange,
  onCostChange,
}: RuntimeBarSegmentsProps) {
  const brand = runtimeFamilyBrand(family);
  const modelLabel = selectedModelUnavailable
    ? "Unavailable selection"
    : (resolvedModel?.label ?? value.model ?? UNSPECIFIED_LABEL);
  const showEffortSegment = showEffort && supportedEfforts.length > 0;

  // Identity and settings wrap as two units, so a narrow bar drops its settings
  // onto a second row instead of clipping them. The settings row carries both a
  // left and a top divider, pulled 1px outside the bar's padding box; the bar's
  // overflow clipping hides whichever one does not apply to the current wrap.
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit max-w-full flex-wrap items-stretch overflow-hidden rounded-md border border-input bg-background max-sm:w-full",
        className,
      )}
    >
      <div
        data-runtime-bar-section="identity"
        className="flex h-control-h min-w-0 max-w-full items-stretch max-sm:grow"
      >
        <RuntimeSegment
          menuLabel="Family"
          title={`Family — ${family.label}`}
          disabled={locked}
          items={familyItems({
            families,
            models,
            selectedId: family.id,
            onSelect: (familyId) => onModeChange(familyId, selectedMode),
          })}
        >
          {brand.icon && (
            <Icon
              icon={brand.icon}
              className={cn("size-4 shrink-0", brand.color)}
            />
          )}
          <span
            className={cn(SEGMENT_CAPTION_CLASS, brand.icon && "max-sm:sr-only")}
          >
            {family.label}
          </span>
        </RuntimeSegment>
        <RuntimeSegment
          menuLabel="Runtime mode"
          title={mode.title ?? "Runtime mode"}
          disabled={locked}
          items={modeItems({
            family,
            selectedId: selectedMode,
            onSelect: (modeId) => onModeChange(family.id, modeId),
          })}
        >
          {mode.icon && (
            <Icon
              icon={mode.icon}
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}
          <span className={SEGMENT_CAPTION_CLASS}>{mode.label}</span>
        </RuntimeSegment>
        {showModel && (
          <RuntimeSegment
            menuLabel="Model"
            title={
              selectedModelUnavailable
                ? "Model — unavailable selection"
                : value.model
                  ? `Model — ${value.model}`
                  : "Model — unspecified"
            }
            disabled={locked}
            className="min-w-0 max-w-56 flex-1 max-sm:max-w-none"
            header={
              <div className="grid gap-1">
                <span className={SEGMENT_KEY_CLASS}>Model id</span>
                <InputField
                  value={selectedModelUnavailable ? "" : (value.model ?? "")}
                  onChange={onCustomModel}
                  {...(selectedModelUnavailable
                    ? { placeholder: "Unavailable selection" }
                    : {})}
                  aria-label="Model id"
                  disabled={locked}
                  inputClassName="font-mono text-xs"
                  className="bg-background"
                />
              </div>
            }
            items={modelItems({
              models: modelOptions,
              group: `${family.label} models`,
              selectedId: selectedModelUnavailable
                ? undefined
                : (resolvedModel?.id ?? value.model),
              inheritedLabel: inheritedModelLabel,
              onSelect: onModelSelect,
              onClear: onModelClear,
            })}
          >
            <span className="min-w-0 truncate font-mono text-xs text-foreground">
              {modelLabel}
            </span>
          </RuntimeSegment>
        )}
      </div>
      {(showEffortSegment || showTimeout || showCost) && (
        <div
          data-runtime-bar-section="settings"
          className="-ml-px -mt-px flex h-control-h min-w-0 items-stretch border-l border-t border-border max-sm:w-full max-sm:[&>div]:flex-1"
        >
          {showEffortSegment && (
            <RuntimeSegment
              menuLabel="Reasoning effort"
              title="Reasoning effort"
              items={effortItems({
                offered: effortUniverse(
                  reasoningEfforts,
                  supportedEfforts,
                  value.effort,
                ),
                supported: supportedEfforts,
                selected: value.effort,
                onSelect: onEffortChange,
              })}
            >
              <span className={cn(SEGMENT_KEY_CLASS, "min-w-0 truncate")}>
                Effort
              </span>
              <EffortGlyph effort={value.effort} />
              <span className={cn(SEGMENT_CAPTION_CLASS, "shrink-0")}>
                {value.effort ? effortLevelLabel(value.effort) : UNSPECIFIED_LABEL}
              </span>
            </RuntimeSegment>
          )}
          {showTimeout && (
            <TimeoutSegment
              value={value.budget?.timeout}
              onChange={onTimeoutChange}
            />
          )}
          {showCost && (
            <CostSegment value={value.budget?.cost} onChange={onCostChange} />
          )}
        </div>
      )}
    </div>
  );
}

function EffortGlyph({ effort }: { effort?: string | undefined }) {
  const glyph = effort ? effortLevelIcon(effort) : undefined;
  if (!glyph) return null;
  return (
    <Icon
      icon={glyph}
      className={cn(
        "size-4 shrink-0",
        effort ? effortLevelColor(effort) : undefined,
      )}
    />
  );
}

function familyItems({
  families,
  models,
  selectedId,
  onSelect,
}: {
  families: SpecRuntimeFamily[];
  models: ChatModel[];
  selectedId: string;
  onSelect: (familyId: string) => void;
}): DropdownMenuItem[] {
  return families
    .filter((family) =>
      family.modes.some((mode) => !isUnavailable(mode.availability)),
    )
    .map((family) => {
      const brand = runtimeFamilyBrand(family);
      const count = modelsForFamily(models, family).length;
      return {
        group: "Family",
        label: (
          <SegmentItemLabel
            text={family.label}
            {...(count > 0 ? { hint: `${count} models` } : {})}
            selected={family.id === selectedId}
          />
        ),
        ...(brand.icon ? { icon: brand.icon } : {}),
        onSelect: () => onSelect(family.id),
      };
    });
}

function modeItems({
  family,
  selectedId,
  onSelect,
}: {
  family: SpecRuntimeFamily;
  selectedId: string;
  onSelect: (modeId: string) => void;
}): DropdownMenuItem[] {
  return family.modes
    .filter((mode) => !isUnavailable(mode.availability))
    .map((mode) => ({
      group: "Mode · runtime",
      label: (
        <SegmentItemLabel
          text={mode.label}
          {...(mode.title ? { hint: mode.title } : {})}
          selected={mode.id === selectedId}
        />
      ),
      ...(mode.icon ? { icon: mode.icon } : {}),
      ...(mode.title ? { title: mode.title } : {}),
      onSelect: () => onSelect(mode.id),
    }));
}

function modelItems({
  models,
  group,
  selectedId,
  inheritedLabel,
  onSelect,
  onClear,
}: {
  models: ChatModel[];
  group: string;
  selectedId?: string | undefined;
  inheritedLabel?: string | undefined;
  onSelect: (model: ChatModel) => void;
  onClear: () => void;
}): DropdownMenuItem[] {
  const clear: DropdownMenuItem = {
    group: "Model",
    label: (
      <SegmentItemLabel
        text={UNSPECIFIED_LABEL}
        hint={unspecifiedHint(inheritedLabel)}
        selected={!selectedId}
      />
    ),
    onSelect: onClear,
  };
  return [
    clear,
    ...models.map((model) => {
      const glyph: StaticIconComponent | undefined = providerIcon(
        model.provider,
      );
      return {
        group,
        label: (
          <SegmentItemLabel
            text={model.label}
            {...(model.id === model.label ? {} : { hint: model.id })}
            selected={model.id === selectedId}
            stacked
          />
        ),
        ...(glyph ? { icon: glyph } : {}),
        onSelect: () => onSelect(model),
      };
    }),
  ];
}

function effortItems({
  offered,
  supported,
  selected,
  onSelect,
}: {
  offered: string[];
  supported: string[];
  selected?: string | undefined;
  onSelect: (effort: string) => void;
}): DropdownMenuItem[] {
  const current = selected?.trim() ?? "";
  const none: DropdownMenuItem = {
    group: "Reasoning effort",
    label: (
      <SegmentItemLabel
        text={UNSPECIFIED_LABEL}
        hint={UNSPECIFIED_HINT}
        selected={current === ""}
      />
    ),
    onSelect: () => onSelect(""),
  };
  return [
    none,
    ...offered.map((effort) => {
      const glyph = effortLevelIcon(effort);
      const usable = supported.includes(effort);
      return {
        group: "Reasoning effort",
        label: (
          <SegmentItemLabel
            text={effortLevelLabel(effort)}
            {...(usable ? {} : { hint: "unsupported" })}
            selected={effort === current}
          />
        ),
        ...(glyph ? { icon: glyph } : {}),
        disabled: !usable,
        onSelect: () => onSelect(effort),
      };
    }),
  ];
}

function effortUniverse(
  offered: readonly string[],
  supported: readonly string[],
  selected: string | undefined,
): string[] {
  const all = [...offered, ...supported, selected ?? ""]
    .map((effort) => effort.trim())
    .filter(Boolean);
  return [...new Set(all)];
}
