import type { ReactNode } from "react";
import { Combobox, type ComboboxOption } from "../../components/Combobox";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import type { ChatModel } from "../chat/types";
import { runtimeFamilyBrand } from "./RuntimeBar.model";
import {
  RuntimeSegment,
  RuntimeSegmentCaption,
  SEGMENT_CAPTION_CLASS,
} from "./RuntimeBarSegment";
import { modelGroupsForMode } from "./RuntimeBar.selection";
import type { SpecRuntimeFamily, SpecRuntimeModeOption } from "./runtime-mode";
import { UNSPECIFIED_LABEL, unspecifiedHint } from "./unspecified";

export type RuntimeBarIdentityProps = {
  family: SpecRuntimeFamily;
  mode: SpecRuntimeModeOption;
  modes: SpecRuntimeModeOption[];
  groups: ReturnType<typeof modelGroupsForMode>;
  selectedModel: ChatModel | undefined;
  model: string | undefined;
  unavailable: boolean;
  inheritedModelLabel: string | undefined;
  locked: boolean;
  showModel: boolean;
  onModeChange: (mode: string) => void;
  onModelSelect: (model: ChatModel) => void;
  onModelClear: () => void;
  onCustomModel: (model: string) => void;
  onFamilySelect: (family: string) => void;
};

export function RuntimeBarIdentity({
  measure = false,
  ...props
}: RuntimeBarIdentityProps & { measure?: boolean }) {
  const modeCaption = (
    <>
      {props.mode.icon && (
        <Icon
          icon={props.mode.icon}
          className="size-4 shrink-0 text-muted-foreground"
        />
      )}
      <span className={SEGMENT_CAPTION_CLASS}>{props.mode.label}</span>
    </>
  );
  return (
    <div
      data-runtime-bar-section={measure ? undefined : "identity"}
      className="flex h-control-h min-w-0 items-stretch"
    >
      {measure ? (
        <IdentityMeasure>{modeCaption}</IdentityMeasure>
      ) : (
        <RuntimeSegment
          menuLabel="Runtime mode"
          title={`Runtime mode — ${props.mode.label}`}
          disabled={props.locked}
          className="shrink-0"
          items={props.modes.map((mode) => ({
            label: mode.label,
            ...(mode.icon ? { icon: mode.icon } : {}),
            onSelect: () => props.onModeChange(mode.id),
          }))}
        >
          {modeCaption}
        </RuntimeSegment>
      )}
      {measure ? (
        <IdentityMeasure model>
          <ModelCaption {...props} />
        </IdentityMeasure>
      ) : (
        <RuntimeModelPicker {...props} />
      )}
    </div>
  );
}

function IdentityMeasure({
  model = false,
  children,
}: {
  model?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-control-h items-center gap-1.5 border-l border-border px-density-2 first:border-l-0",
        model && "max-w-56 min-w-0",
      )}
    >
      <RuntimeSegmentCaption>{children}</RuntimeSegmentCaption>
    </div>
  );
}

function ModelCaption(props: RuntimeBarIdentityProps) {
  const brand = runtimeFamilyBrand(props.family);
  const label = props.showModel
    ? props.unavailable
      ? "Unavailable selection"
      : (props.selectedModel?.label ?? props.model ?? UNSPECIFIED_LABEL)
    : props.family.label;
  return (
    <>
      {props.showModel && (
        <span className="sr-only">{props.family.label} </span>
      )}
      {brand.icon && (
        <Icon
          icon={brand.icon}
          className={cn("size-4 shrink-0", brand.color)}
        />
      )}
      <span className="min-w-0 truncate font-mono text-xs font-semibold text-foreground">
        {label}
      </span>
    </>
  );
}

function RuntimeModelPicker(props: RuntimeBarIdentityProps) {
  const title = props.showModel
    ? `Model — ${props.unavailable ? "unavailable selection" : props.model || "unspecified"}`
    : `Family — ${props.family.label}`;
  if (!props.showModel)
    return (
      <RuntimeSegment
        menuLabel="Family"
        title={title}
        disabled={props.locked}
        className="min-w-0 max-w-56 flex-1"
        items={props.groups.map(({ family }) => {
          const brand = runtimeFamilyBrand(family);
          return {
            label: family.label,
            ...(brand.icon ? { icon: brand.icon } : {}),
            onSelect: () => props.onFamilySelect(family.id),
          };
        })}
      >
        <ModelCaption {...props} />
      </RuntimeSegment>
    );
  const options: ComboboxOption[] = [
    {
      value: "",
      label: UNSPECIFIED_LABEL,
      description: unspecifiedHint(props.inheritedModelLabel),
    },
    ...props.groups.flatMap(({ family, models }) => {
      const brand = runtimeFamilyBrand(family);
      const icon = brand.icon ? (
        <Icon icon={brand.icon} className={cn("size-4", brand.color)} />
      ) : undefined;
      return models.length
        ? models.map((model) => ({
            value: model.id,
            label: model.label.trim() || model.id,
            group: family.label,
            icon,
          }))
        : [
            {
              value: `family:${family.id}`,
              label: "Custom model…",
              group: family.label,
              icon,
            },
          ];
    }),
  ];
  return (
    <Combobox
      searchPlacement="menu"
      ariaLabel="Model"
      title={title}
      disabled={props.locked}
      value={
        props.unavailable ? "" : (props.selectedModel?.id ?? props.model ?? "")
      }
      options={options}
      className="h-control-h min-w-0 max-w-56 flex-1 border-l border-border first:border-l-0"
      triggerClassName="h-full rounded-none border-0 px-density-2 focus-visible:ring-inset aria-expanded:bg-muted"
      triggerContent={<ModelCaption {...props} />}
      onNew={(value) => ({ value, label: `Use custom: ${value}` })}
      onChange={(value) => {
        if (!value) return props.onModelClear();
        const family = props.groups.find(
          ({ family }) => value === `family:${family.id}`,
        )?.family;
        if (family) return props.onFamilySelect(family.id);
        const model = props.groups
          .flatMap(({ models }) => models)
          .find((model) => model.id === value);
        if (model) props.onModelSelect(model);
        else props.onCustomModel(value);
      }}
    />
  );
}
