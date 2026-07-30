import { createElement, type ReactNode } from "react";
import { Combobox } from "../../components/Combobox";
import type { FormSize } from "../../components/json-schema-form-size";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Icon, type StaticIconComponent } from "../Icon";
import { cn } from "../../lib/utils";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "./effort-icons";
import { providerIcon } from "./provider-icons";
import type { ChatBudgetConfig, ChatModel } from "./types";

export type ModelSelectorProps = {
  models: ChatModel[];
  /** Currently selected model id. */
  value?: string | undefined;
  onChange: (id: string) => void;
  className?: string;
  /** Control size. Defaults to `sm` (compact chat toolbar); pass `md` to match
   *  a standard-density form row. */
  size?: FormSize;
};

/** A searchable model picker driven by the backend model menu, showing each
 *  provider's brand icon. Models whose provider is not configured are disabled
 *  rather than hidden, so the menu communicates what would be available with the
 *  right API key. */
export function ModelSelector({ models, value, onChange, className, size = "sm" }: ModelSelectorProps) {
  if (models.length === 0) return null;
  const selected = models.find((m) => m.id === value);
  const SelectedGlyph = providerIcon(selected?.provider);
  return (
    <Combobox
      ariaLabel="Model"
      value={value ?? ""}
      onChange={onChange}
      allowCustomValue={false}
      required
      size={size}
      className={cn("w-48", className)}
      {...(SelectedGlyph ? { prefix: <SelectedGlyph className="size-4" /> } : {})}
      options={models.map((m) => {
        const Icon = providerIcon(m.provider);
        return {
          value: m.id,
          label: m.label,
          ...(Icon ? { icon: <Icon className="size-4" /> } : {}),
          disabled: m.configured === false,
        };
      })}
    />
  );
}

export type EffortSelectorProps = {
  efforts: string[];
  value?: string | undefined;
  onChange: (effort: string) => void;
  className?: string;
  /** Control size. Defaults to `sm`; pass `md` to match a standard form row. */
  size?: FormSize;
};

/** Reasoning-effort picker, shown only for reasoning-capable models. The empty
 *  value means "no extended thinking". Strict: only the listed options commit. */
export function EffortSelector({ efforts, value, onChange, className, size = "sm" }: EffortSelectorProps) {
  const selectedEffort = value?.trim() ?? "";
  const supportedEfforts = [...new Set(efforts.map((effort) => effort.trim()).filter(Boolean))];
  if (selectedEffort && !supportedEfforts.includes(selectedEffort)) {
    supportedEfforts.push(selectedEffort);
  }
  const selectedGlyph = selectedEffort ? effortLevelIcon(selectedEffort) : undefined;
  const selectedColor = selectedEffort ? effortLevelColor(selectedEffort) : undefined;
  const selectedIcon = selectedGlyph
    ? createElement(selectedGlyph, { className: cn("size-4", selectedColor) })
    : undefined;
  return (
    <Combobox
      ariaLabel="Reasoning effort"
      value={selectedEffort}
      onChange={onChange}
      allowCustomValue={false}
      required
      size={size}
      className={cn("w-36", className)}
      {...(selectedIcon ? { prefix: selectedIcon } : {})}
      options={[
        { value: "", label: "None" },
        ...supportedEfforts.map((effort) => ({
          value: effort,
          label: fullEffortLabel(effort),
          selectedLabel: shortEffortLabel(effort),
        })),
      ]}
    />
  );
}

function fullEffortLabel(value: string): string {
  switch (value.trim().toLowerCase()) {
    case "xhigh":
      return "Extra high";
    case "max":
      return "Maximum";
    default:
      return effortLevelLabel(value);
  }
}

function shortEffortLabel(value: string): string {
  switch (value.trim().toLowerCase()) {
    case "minimal":
      return "Min";
    case "medium":
      return "Med";
    case "xhigh":
      return "XHigh";
    case "adaptive":
      return "Auto";
    case "max":
      return "Max";
    default:
      return effortLevelLabel(value);
  }
}

export type ProviderSelectorOption<T extends string = string> = {
  id: T;
  label: ReactNode;
  /** Provider id used for the default brand glyph when `icon` is omitted. */
  provider?: string | undefined;
  icon?: string | StaticIconComponent | undefined;
  title?: string | undefined;
  disabled?: boolean | undefined;
};

export type ProviderSelectorProps<T extends string = string> = {
  providers: ProviderSelectorOption<T>[];
  value: T;
  onChange: (provider: T) => void;
  className?: string | undefined;
  ariaLabel?: string | undefined;
};

/** Segmented AI provider picker with the same provider glyphs used by the model
 * selector. Use when the backend needs the provider/agent axis separate from the
 * concrete model id. */
export function ProviderSelector<T extends string = string>({
  providers,
  value,
  onChange,
  className,
  ariaLabel = "AI provider",
}: ProviderSelectorProps<T>) {
  return (
    <SegmentedControl
      aria-label={ariaLabel}
      size="sm"
      value={value}
      onChange={onChange}
      className={cn("w-fit", className)}
      options={providers.map((provider) => {
        const icon = provider.icon ?? providerIcon(provider.provider);
        return {
          id: provider.id,
          label: provider.label,
          ...(provider.title ? { title: provider.title } : {}),
          ...(provider.disabled !== undefined ? { disabled: provider.disabled } : {}),
          ...(icon ? { icon } : {}),
        };
      })}
    />
  );
}

export type BudgetSelectorProps = {
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange: (budget: ChatBudgetConfig) => void;
  className?: string | undefined;
  disabled?: boolean | undefined;
  costLabel?: string | undefined;
  maxTokensLabel?: string | undefined;
  maxTokensStep?: number | undefined;
};

/** Compact budget fields matching the advanced chat settings surface. Callers may
 * relabel the token field when their payload contract uses a different budgeted
 * unit, such as conversation turns. */
export function BudgetSelector({
  budget,
  onBudgetChange,
  className,
  disabled = false,
  costLabel = "Max cost",
  maxTokensLabel = "Max tokens",
  maxTokensStep = 1,
}: BudgetSelectorProps) {
  const updateBudget = (key: keyof ChatBudgetConfig, raw: string, integer = false) => {
    const next: ChatBudgetConfig = { ...budget };
    const parsed = parseOptionalNumber(raw, integer);
    if (parsed === undefined) {
      delete next[key];
    } else {
      next[key] = parsed;
    }
    onBudgetChange(next);
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <label className="space-y-1 text-xs">
        <span className="text-muted-foreground">{costLabel}</span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={budget?.cost ?? ""}
          onChange={(event) => updateBudget("cost", event.target.value)}
          disabled={disabled}
          className="h-8 w-full rounded border border-border bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <label className="space-y-1 text-xs">
        <span className="text-muted-foreground">{maxTokensLabel}</span>
        <input
          type="number"
          min={0}
          step={maxTokensStep}
          value={budget?.maxTokens ?? ""}
          onChange={(event) => updateBudget("maxTokens", event.target.value, maxTokensStep >= 1)}
          disabled={disabled}
          className="h-8 w-full rounded border border-border bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
    </div>
  );
}

function parseOptionalNumber(raw: string, integer = false): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  return integer ? Math.max(0, Math.trunc(value)) : value;
}
