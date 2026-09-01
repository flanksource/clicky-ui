import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { UiCheck, UiChevronDown } from "../../icons";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "../chat/effort-icons";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import type { RuntimeBarValue } from "./RuntimeBar";
import { runtimeFamilyBrand } from "./RuntimeBar.model";
import { isUnavailable } from "./availability";
import {
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "./runtime-mode";

export type RuntimeBarComboProps = {
  value: RuntimeBarValue;
  families: SpecRuntimeFamily[];
  family: SpecRuntimeFamily;
  mode: SpecRuntimeModeOption;
  selectedMode: string;
  models: ChatModel[];
  selectedModel: ChatModel | undefined;
  selectedModelUnavailable: boolean;
  supportedEfforts: string[];
  locked: boolean;
  showModel: boolean;
  showEffort: boolean;
  ariaLabel: string;
  className?: string | undefined;
  onFamilyChange: (familyId: string) => void;
  onModeChange: (modeId: string) => void;
  onModelSelect: (model: ChatModel) => void;
  onModelClear: () => void;
  onEffortChange: (effort: string) => void;
};

export function RuntimeBarCombo({
  value,
  families,
  family,
  mode,
  selectedMode,
  models,
  selectedModel,
  selectedModelUnavailable,
  supportedEfforts,
  locked,
  showModel,
  showEffort,
  ariaLabel,
  className,
  onFamilyChange,
  onModeChange,
  onModelSelect,
  onModelClear,
  onEffortChange,
}: RuntimeBarComboProps) {
  const brand = runtimeFamilyBrand(family);
  const modelLabel = showModel
    ? selectedModelUnavailable
      ? "Unavailable selection"
      : (selectedModel?.label ?? value.model ?? "Prompt default")
    : `${family.label} ${mode.label}`;
  const effortLabel = value.effort ? effortLevelLabel(value.effort) : "None";
  const effortIcon = value.effort ? effortLevelIcon(value.effort) : undefined;
  const summaryParts = [family.label, mode.label];
  if (showModel) summaryParts.push(modelLabel);
  if (showEffort) summaryParts.push(`effort ${effortLabel}`);
  const summary = `${ariaLabel}: ${summaryParts.join(", ")}${locked ? ". Model and mode are locked for this conversation; fork it to change them" : ""}`;

  return (
    <DropdownMenu
      align="left"
      menuLabel={`${ariaLabel} controls`}
      {...(className ? { className } : {})}
      menuClassName="max-h-[70vh] w-80 max-w-[calc(100vw-24px)] overflow-y-auto"
      trigger={
        <Button
          type="button"
          variant="outline"
          size="sm"
          title={summary}
          aria-label={summary}
          className="max-w-full gap-1.5 px-density-2"
        >
          {brand.icon && (
            <Icon
              icon={brand.icon}
              className={cn("size-4 shrink-0", brand.color)}
            />
          )}
          {mode.icon && (
            <Icon
              icon={mode.icon}
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}
          <span className="min-w-0 truncate text-xs font-semibold text-foreground">
            {modelLabel}
          </span>
          {showEffort && effortIcon && (
            <Icon
              icon={effortIcon}
              className={cn(
                "size-4 shrink-0",
                value.effort ? effortLevelColor(value.effort) : undefined,
              )}
            />
          )}
          <Icon
            icon={UiChevronDown}
            className="size-3 shrink-0 text-muted-foreground/70"
          />
        </Button>
      }
    >
      {() => (
        <div className="p-1 text-xs">
          <div className="space-y-2 border-b border-border px-2 pb-3 pt-2">
            {locked && (
              <div className="rounded bg-muted px-2 py-1.5 text-[11px] text-muted-foreground">
                Model and mode are locked. Fork this conversation to change
                them.
              </div>
            )}
            <FamilySegments
              families={families}
              value={family.id}
              locked={locked}
              onChange={onFamilyChange}
            />
            <ModeSegments
              family={family}
              value={selectedMode}
              locked={locked}
              onChange={onModeChange}
            />
            {showEffort && (
              <EffortSlider
                value={value.effort}
                efforts={supportedEfforts}
                onChange={onEffortChange}
              />
            )}
          </div>
          {showModel && (
            <ModelChoices
              models={models}
              familyBrand={brand}
              selectedId={selectedModel?.id ?? value.model}
              locked={locked}
              onSelect={onModelSelect}
              onClear={onModelClear}
            />
          )}
        </div>
      )}
    </DropdownMenu>
  );
}

function FamilySegments({
  families,
  value,
  locked,
  onChange,
}: {
  families: SpecRuntimeFamily[];
  value: string;
  locked: boolean;
  onChange: (familyId: string) => void;
}) {
  return (
    <SegmentedControl
      aria-label="Family"
      size="sm"
      wrap
      value={value}
      onChange={onChange}
      className="w-full"
      options={families
        .filter((family) =>
          family.modes.some((mode) => !isUnavailable(mode.availability)),
        )
        .map((family) => {
          const brand = runtimeFamilyBrand(family);
          return {
            id: family.id,
            label: family.label,
            disabled: locked,
            ...(brand.icon ? { icon: brand.icon } : {}),
          };
        })}
    />
  );
}

function ModeSegments({
  family,
  value,
  locked,
  onChange,
}: {
  family: SpecRuntimeFamily;
  value: string;
  locked: boolean;
  onChange: (modeId: string) => void;
}) {
  return (
    <SegmentedControl
      aria-label="Runtime mode"
      size="sm"
      value={value}
      onChange={onChange}
      className="w-full"
      options={family.modes
        .filter((mode) => !isUnavailable(mode.availability))
        .map((mode) => ({
          id: mode.id,
          label: mode.label,
          disabled: locked,
          ...(mode.title ? { title: mode.title } : {}),
          ...(mode.icon ? { icon: mode.icon } : {}),
        }))}
    />
  );
}

function ModelChoices({
  models,
  familyBrand,
  selectedId,
  locked,
  onSelect,
  onClear,
}: {
  models: ChatModel[];
  familyBrand: ReturnType<typeof runtimeFamilyBrand>;
  selectedId?: string | undefined;
  locked: boolean;
  onSelect: (model: ChatModel) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-0.5 py-1">
      <ModelChoice
        label="Prompt default"
        selected={!selectedId}
        disabled={locked}
        onClick={onClear}
      />
      {models.map((model) => {
        const icon = providerIcon(model.provider) ?? familyBrand.icon;
        return (
          <ModelChoice
            key={model.id}
            label={model.label}
            title={model.id}
            selected={model.id === selectedId}
            disabled={locked}
            {...(icon
              ? {
                  icon,
                  iconColor:
                    providerIconColor(model.provider) ?? familyBrand.color,
                }
              : {})}
            onClick={() => onSelect(model)}
          />
        );
      })}
    </div>
  );
}

function ModelChoice({
  label,
  title,
  detail,
  selected,
  disabled,
  icon,
  iconColor,
  onClick,
}: {
  label: string;
  title?: string | undefined;
  detail?: string | undefined;
  selected: boolean;
  disabled: boolean;
  icon?: NonNullable<ReturnType<typeof providerIcon>>;
  iconColor?: string | undefined;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={detail ? `${label}. ${detail}` : label}
      {...(title ? { title } : {})}
      className="group flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
    >
      {icon ? (
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/70 ring-1 ring-border/60 group-hover:bg-background">
          <Icon icon={icon} className={cn("size-3.5", iconColor)} />
        </span>
      ) : (
        <span className="size-6 shrink-0" />
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn("block truncate text-sm", selected && "font-semibold")}
        >
          {label}
        </span>
        {detail && (
          <span className="block whitespace-normal text-[11px] leading-4 text-muted-foreground">
            {detail}
          </span>
        )}
      </span>
      <Icon
        icon={UiCheck}
        className={cn(
          "size-3.5 shrink-0 text-primary",
          !selected && "invisible",
        )}
      />
    </Button>
  );
}

function EffortSlider({
  value,
  efforts,
  onChange,
}: {
  value?: string | undefined;
  efforts: string[];
  onChange: (effort: string) => void;
}) {
  const supported = [
    ...new Set(efforts.map((effort) => effort.trim()).filter(Boolean)),
  ];
  if (supported.length === 0) {
    return (
      <div className="flex h-8 items-center justify-center text-[11px] text-muted-foreground">
        Fixed effort for this model
      </div>
    );
  }

  const options = ["", ...supported];
  const current = value?.trim() ?? "";
  const currentIndex = options.indexOf(current);
  const sliderIndex = currentIndex >= 0 ? currentIndex : 0;
  const label =
    currentIndex >= 0
      ? current
        ? effortLevelLabel(current)
        : "None"
      : `${effortLevelLabel(current)} unsupported`;
  const percent = (sliderIndex / (options.length - 1)) * 100;
  const firstIcon = effortLevelIcon(supported[0]!);
  const lastIcon = effortLevelIcon(supported[supported.length - 1]!);
  const selectedIcon = current ? effortLevelIcon(current) : undefined;

  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-1.5"
      aria-label="Model effort"
    >
      {firstIcon ? (
        <Icon
          icon={firstIcon}
          className={cn("mt-3 size-3.5", effortLevelColor(supported[0]!))}
        />
      ) : (
        <span className="size-3.5" />
      )}
      <div className="relative h-11 pt-1">
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={sliderIndex}
          aria-label="Reasoning effort"
          aria-valuetext={label}
          aria-invalid={currentIndex < 0}
          onChange={(event) => {
            const next = options[Number(event.target.value)];
            if (next === undefined) {
              throw new Error(
                `Invalid reasoning effort index: ${event.target.value}`,
              );
            }
            onChange(next);
          }}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-sm"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-7 -translate-x-1/2"
          style={{ left: `${percent}%` }}
        >
          <span
            className={cn(
              "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-1.5 text-[10px] font-semibold leading-none",
              currentIndex < 0
                ? "border-destructive/25 bg-destructive/10 text-destructive"
                : current
                  ? cn("border-current/25 bg-muted", effortLevelColor(current))
                  : "border-border bg-muted text-muted-foreground",
            )}
            title={`Effort: ${label}`}
          >
            {selectedIcon && <Icon icon={selectedIcon} className="size-3" />}
            {label}
          </span>
        </span>
      </div>
      {lastIcon ? (
        <Icon
          icon={lastIcon}
          className={cn(
            "mt-3 size-3.5",
            effortLevelColor(supported[supported.length - 1]!),
          )}
        />
      ) : (
        <span className="size-3.5" />
      )}
    </div>
  );
}
