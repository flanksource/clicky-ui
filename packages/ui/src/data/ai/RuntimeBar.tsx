import type { ReactNode } from "react";
import { UiCheck, UiChevronDown } from "../../icons";
import { cn } from "../../lib/utils";
import { DropdownMenu, type DropdownMenuItem } from "../../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  DEFAULT_REASONING_EFFORTS,
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "../chat/effort-icons";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { SpecInput } from "./SpecRuntimeEditor/fields";
import { withOptionalRoot, withRoot } from "./SpecRuntimeEditor/update";
import { effortOptionsForModel, reconcileModelCapabilities } from "./model-capabilities";
import {
  SPEC_RUNTIME_FAMILIES,
  backendForFamilyMode,
  familyById,
  firstMode,
  modelBelongsToFamily,
  modelsForFamily,
  runtimeModeOptions,
  selectionForBackend,
  type SpecRuntimeFamily,
} from "./runtime-mode";

export type RuntimeBarProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  /** Model catalog. Only the selected family's models are listed; a family the
   *  catalog does not describe is served by the segment's free-text entry. */
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  /** Effort tiers offered when the catalog does not describe the model. */
  reasoningEfforts?: string[] | undefined;
  ariaLabel?: string | undefined;
  className?: string | undefined;
};

/**
 * The runtime as one self-describing row: family, mode, model and reasoning
 * effort as four menu segments in a single bordered bar. Each segment carries
 * its own value, so the bar needs no field labels above it and its width tracks
 * the content instead of the form grid. Unsupported combinations (a mode the
 * family lacks, an effort the model rejects) stay in place and disabled, so the
 * constraint reads before it is hit. The Model segment is always present — a
 * family with no catalog models is typed into the menu's free-text entry rather
 * than pushed out into a separate field.
 */
export function RuntimeBar({
  value,
  onChange,
  models = [],
  families = SPEC_RUNTIME_FAMILIES,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  ariaLabel = "Runtime",
  className,
}: RuntimeBarProps) {
  const selection = selectionForBackend(families, value.backend);
  const family = familyById(families, selection.family);
  const mode =
    family.modes.find((entry) => entry.id === selection.mode) ?? firstMode(family);
  const modelOptions = modelsForFamily(models, family, value.backend);
  const selectedModel = models.find((entry) => entry.id === value.model);
  const supportedEfforts = effortOptionsForModel(selectedModel, reasoningEfforts);

  const applyBackend = (familyId: string, modeId: string) => {
    const backend = backendForFamilyMode(families, familyId, modeId);
    if (backend === (value.backend ?? "")) return;
    // A backend switch invalidates the previous backend's cmux CLI-arg values.
    let next = withOptionalRoot(withRoot(value, { backend }), "cliArgs", undefined);
    if (!modelBelongsToFamily(value.model, models, familyById(families, familyId), backend)) {
      next = withOptionalRoot(next, "model", undefined);
    }
    onChange(next);
  };

  const brand = familyBrand(family);
  const modelLabel = selectedModel?.label ?? value.model ?? "Default";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        // `w-fit` so the bar hugs its segments instead of being stretched by a
        // grid/flex parent — the row is content-sized, not a form field.
        // The outer edge is a control border (`--input`); the segment dividers
        // inside it are the subtler `--border`, so the bar reads as one object.
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
          onSelect: (familyId) => applyBackend(familyId, selection.mode),
        })}
      >
        {brand.icon && (
          <Icon icon={brand.icon} className={cn("size-4 shrink-0", brand.color)} />
        )}
        <span className={CAPTION_CLASS}>{family.label}</span>
      </RuntimeSegment>
      <RuntimeSegment
        menuLabel="Runtime mode"
        title={mode.title ?? "Runtime mode"}
        items={modeItems({
          families,
          family,
          selectedId: selection.mode,
          onSelect: (modeId) => applyBackend(family.id, modeId),
        })}
      >
        {mode.icon && (
          <Icon icon={mode.icon} className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className={CAPTION_CLASS}>{mode.label}</span>
      </RuntimeSegment>
      <RuntimeSegment
        menuLabel="Model"
        title={value.model ? `Model — ${value.model}` : "Model — prompt default"}
        className="min-w-0 max-w-56"
        header={
          <div className="grid gap-1">
            <span className={KEY_CLASS}>Model id</span>
            <SpecInput
              value={value.model}
              onChange={(model) => onChange(withOptionalRoot(value, "model", model))}
              ariaLabel="Model id"
              mono
            />
          </div>
        }
        items={modelItems({
          models: modelOptions,
          group: `${family.label} models`,
          selectedId: value.model,
          onSelect: (model) =>
            onChange(
              reconcileModelCapabilities(
                value,
                models.find((entry) => entry.id === model),
                reasoningEfforts,
              ),
            ),
          onClear: () => onChange(withOptionalRoot(value, "model", undefined)),
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
            offered: effortUniverse(reasoningEfforts, supportedEfforts, value.effort),
            supported: supportedEfforts,
            selected: value.effort,
            onSelect: (effort) => onChange(withOptionalRoot(value, "effort", effort)),
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
      className={cn("size-4 shrink-0", effort ? effortLevelColor(effort) : undefined)}
    />
  );
}

// Menu rows share one grid: label, hint, and a check that stays in the layout
// when unselected so the rows do not shift. Short hints ("3 models", "not on
// Claude") sit inline on the right; a `stacked` hint — a model id, which is as
// long as the label and would truncate both — gets its own line underneath.
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
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {hint && !stacked && (
        <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
      )}
      <Icon
        icon={UiCheck}
        className={cn("size-3.5 shrink-0 text-primary", !selected && "invisible")}
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
  return families.map((family) => {
    const brand = familyBrand(family);
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

// Families key their brand mark off the family id ("claude"), falling back to
// the catalog provider ("googleai"); the raw backend provider ("claude-agent")
// is not a brand.
function familyBrand(family: SpecRuntimeFamily): {
  icon: StaticIconComponent | undefined;
  color: string | undefined;
} {
  const key = providerIcon(family.id) ? family.id : family.provider;
  return { icon: providerIcon(key), color: providerIconColor(key) };
}

function modeItems({
  families,
  family,
  selectedId,
  onSelect,
}: {
  families: SpecRuntimeFamily[];
  family: SpecRuntimeFamily;
  selectedId: string;
  onSelect: (modeId: string) => void;
}): DropdownMenuItem[] {
  return runtimeModeOptions(families).map((mode) => {
    const supported = family.modes.find((entry) => entry.id === mode.id);
    const hint = supported?.title ?? `not on ${family.label}`;
    return {
      group: "Mode · runtime",
      label: itemLabel({
        text: supported?.label ?? mode.label,
        hint,
        selected: mode.id === selectedId,
      }),
      ...(mode.icon ? { icon: mode.icon } : {}),
      title: hint,
      disabled: !supported,
      onSelect: () => onSelect(mode.id),
    };
  });
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
  onSelect: (modelId: string) => void;
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
      const glyph: StaticIconComponent | undefined = providerIcon(model.provider);
      return {
        group,
        label: itemLabel({
          text: model.label,
          ...(model.id === model.label ? {} : { hint: model.id }),
          selected: model.id === selectedId,
          stacked: true,
        }),
        ...(glyph ? { icon: glyph } : {}),
        disabled: model.configured === false,
        onSelect: () => onSelect(model.id),
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
    label: itemLabel({ text: "None", hint: "single pass", selected: current === "" }),
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

// The tiers the menu shows: everything offered by the catalog default, plus any
// model-specific tier and the current selection, so a value set elsewhere is
// never silently absent from its own menu.
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
