import type { ReactNode } from "react";
import { InputField } from "../../components/InputField";
import { UiCheck, UiChevronDown } from "../../icons";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "../../overlay/DropdownMenu";
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
import { isUnavailable } from "./availability";
import {
  modelsForFamily,
  type SpecRuntimeFamily,
  type SpecRuntimeModeOption,
} from "./runtime-mode";

export type RuntimeBarSegmentsProps = {
  value: RuntimeBarValue;
  models: ChatModel[];
  modelOptions: ChatModel[];
  resolvedModel: ChatModel | undefined;
  selectedModelUnavailable: boolean;
  families: SpecRuntimeFamily[];
  family: SpecRuntimeFamily;
  mode: SpecRuntimeModeOption;
  selectedMode: string;
  reasoningEfforts: string[];
  supportedEfforts: string[];
  ariaLabel: string;
  className?: string | undefined;
  onBackendChange: (familyId: string, modeId: string) => void;
  onCustomModel: (model: string) => void;
  onModelSelect: (model: ChatModel) => void;
  onModelClear: () => void;
  onEffortChange: (effort: string) => void;
};

export function RuntimeBarSegments({
  value,
  models,
  modelOptions,
  resolvedModel,
  selectedModelUnavailable,
  families,
  family,
  mode,
  selectedMode,
  reasoningEfforts,
  supportedEfforts,
  ariaLabel,
  className,
  onBackendChange,
  onCustomModel,
  onModelSelect,
  onModelClear,
  onEffortChange,
}: RuntimeBarSegmentsProps) {
  const brand = runtimeFamilyBrand(family);
  const modelLabel = selectedModelUnavailable
    ? "Unavailable selection"
    : (resolvedModel?.label ?? value.model ?? "Default");

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-control-h w-fit max-w-full items-stretch overflow-hidden rounded-md border border-input bg-background",
        className,
      )}
    >
      <RuntimeSegment
        menuLabel="Family"
        title={`Family — ${family.label}`}
        items={familyItems({
          families,
          models,
          selectedId: family.id,
          onSelect: (familyId) => onBackendChange(familyId, selectedMode),
        })}
      >
        {brand.icon && (
          <Icon
            icon={brand.icon}
            className={cn("size-4 shrink-0", brand.color)}
          />
        )}
        <span className={CAPTION_CLASS}>{family.label}</span>
      </RuntimeSegment>
      <RuntimeSegment
        menuLabel="Runtime mode"
        title={mode.title ?? "Runtime mode"}
        items={modeItems({
          family,
          selectedId: selectedMode,
          onSelect: (modeId) => onBackendChange(family.id, modeId),
        })}
      >
        {mode.icon && (
          <Icon
            icon={mode.icon}
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
        <span className={CAPTION_CLASS}>{mode.label}</span>
      </RuntimeSegment>
      <RuntimeSegment
        menuLabel="Model"
        title={
          selectedModelUnavailable
            ? "Model — unavailable selection"
            : value.model
              ? `Model — ${value.model}`
              : "Model — prompt default"
        }
        className="min-w-0 max-w-56 flex-1 [&>span]:min-w-0 [&>span]:w-full [&>span>button]:w-full"
        header={
          <div className="grid gap-1">
            <span className={KEY_CLASS}>Model id</span>
            <InputField
              value={selectedModelUnavailable ? "" : (value.model ?? "")}
              onChange={onCustomModel}
              {...(selectedModelUnavailable
                ? { placeholder: "Unavailable selection" }
                : {})}
              aria-label="Model id"
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
          onSelect: onModelSelect,
          onClear: onModelClear,
        })}
      >
        <span className="min-w-0 truncate font-mono text-xs text-foreground">
          {modelLabel}
        </span>
      </RuntimeSegment>
      {supportedEfforts.length > 0 && (
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
          <span className={KEY_CLASS}>Effort</span>
          <EffortGlyph effort={value.effort} />
          <span className={CAPTION_CLASS}>
            {value.effort ? effortLevelLabel(value.effort) : "None"}
          </span>
        </RuntimeSegment>
      )}
    </div>
  );
}

const CAPTION_CLASS = "truncate text-xs font-semibold text-foreground";
const KEY_CLASS =
  "text-[11px] font-semibold uppercase leading-none tracking-wide text-muted-foreground";

function RuntimeSegment({
  items,
  menuLabel,
  title,
  header,
  className,
  children,
}: {
  items: DropdownMenuItem[];
  menuLabel: string;
  title: string;
  header?: ReactNode;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <DropdownMenu
      align="left"
      menuLabel={menuLabel}
      items={items}
      {...(header ? { header } : {})}
      menuClassName="min-w-56 max-w-80"
      className={cn("border-l border-border first:border-l-0", className)}
      trigger={
        <button
          type="button"
          title={title}
          className="inline-flex h-full min-w-0 items-center gap-1.5 px-density-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [[aria-expanded=true]_&]:bg-muted"
        >
          {children}
          <Icon
            icon={UiChevronDown}
            className="size-3 shrink-0 text-muted-foreground/70"
          />
        </button>
      }
    />
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

function itemLabel({
  text,
  hint,
  selected,
  stacked = false,
}: {
  text: string;
  hint?: string | undefined;
  selected: boolean;
  stacked?: boolean | undefined;
}): ReactNode {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate", selected && "font-semibold")}>
          {text}
        </span>
        {hint && stacked && (
          <span className="block whitespace-normal text-[11px] leading-4 text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {hint && !stacked && (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
      <Icon
        icon={UiCheck}
        className={cn(
          "size-3.5 shrink-0 text-primary",
          !selected && "invisible",
        )}
      />
    </>
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
        label: itemLabel({
          text: family.label,
          ...(count > 0 ? { hint: `${count} models` } : {}),
          selected: family.id === selectedId,
        }),
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
      label: itemLabel({
        text: mode.label,
        ...(mode.title ? { hint: mode.title } : {}),
        selected: mode.id === selectedId,
      }),
      ...(mode.icon ? { icon: mode.icon } : {}),
      ...(mode.title ? { title: mode.title } : {}),
      onSelect: () => onSelect(mode.id),
    }));
}

function modelItems({
  models,
  group,
  selectedId,
  onSelect,
  onClear,
}: {
  models: ChatModel[];
  group: string;
  selectedId?: string | undefined;
  onSelect: (model: ChatModel) => void;
  onClear: () => void;
}): DropdownMenuItem[] {
  const clear: DropdownMenuItem = {
    group: "Model",
    label: itemLabel({
      text: "Prompt default",
      hint: "no override",
      selected: !selectedId,
    }),
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
        label: itemLabel({
          text: model.label,
          ...(model.id === model.label ? {} : { hint: model.id }),
          selected: model.id === selectedId,
          stacked: true,
        }),
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
    label: itemLabel({
      text: "None",
      hint: "single pass",
      selected: current === "",
    }),
    onSelect: () => onSelect(""),
  };
  return [
    none,
    ...offered.map((effort) => {
      const glyph = effortLevelIcon(effort);
      const usable = supported.includes(effort);
      return {
        group: "Reasoning effort",
        label: itemLabel({
          text: effortLevelLabel(effort),
          ...(usable ? {} : { hint: "unsupported" }),
          selected: effort === current,
        }),
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
