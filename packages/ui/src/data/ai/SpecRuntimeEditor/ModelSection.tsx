import { useState } from "react";
import {
  effortLevelColor,
  effortLevelIcon,
  effortLevelLabel,
} from "../../chat/effort-icons";
import type { ChatModel } from "../../chat/types";
import { providerIcon, providerIconColor } from "../../chat/provider-icons";
import { Icon } from "../../Icon";
import { IconButton } from "../../../components";
import { cn } from "../../../lib/utils";
import {
  UiAdd,
  UiCoins,
  UiCurrencyDollar,
  UiFingerprint,
  UiRepeat,
  UiSparkles,
  UiTimer,
  UiTrash,
} from "../../../icons";
import type {
  AISpecRuntimeModelFallback,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import { ProviderStatusPanel } from "../../runtime/ProviderStatusPanel";
import { RuntimeBar } from "../../runtime/RuntimeBar";
import {
  SPEC_RUNTIME_FAMILIES,
  firstMode,
  modeForBackend,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { CheckboxField, NumberField, SpecField, SpecInput } from "./fields";
import { withBudgetValue, withOptionalRoot, withRoot } from "./update";

type FallbackDraftPatch = {
  model?: string | undefined;
  id?: string | undefined;
  backend?: string | undefined;
  temperature?: number | undefined;
  effort?: string | undefined;
  noCache?: boolean | undefined;
};

export function ModelSection({
  value,
  onChange,
  models,
  families,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models: ChatModel[];
  families?: SpecRuntimeFamily[] | undefined;
}) {
  // The bar owns family, mode, model and effort — including the free-text model
  // entry for families the catalog does not describe.
  return (
    <div className="grid gap-density-2">
      <RuntimeBar
        value={value}
        onChange={onChange}
        models={models}
        {...(families ? { families } : {})}
      />
      <div className="grid grid-cols-2 gap-density-2 md:grid-cols-4">
        <NumberField
          label="Max cost (USD)"
          value={value.budget?.cost}
          onChange={(cost) => onChange(withBudgetValue(value, "cost", cost))}
          icon={UiCurrencyDollar}
          min={0}
          step={0.01}
        />
        <NumberField
          label="Max tokens"
          value={value.budget?.maxTokens}
          onChange={(maxTokens) =>
            onChange(withBudgetValue(value, "maxTokens", maxTokens))
          }
          icon={UiCoins}
          min={0}
          step={1}
          integer
        />
        <NumberField
          label="Max turns"
          value={value.budget?.maxTurns}
          onChange={(maxTurns) =>
            onChange(withBudgetValue(value, "maxTurns", maxTurns))
          }
          icon={UiRepeat}
          min={0}
          max={100}
          step={1}
          integer
        />
        <SpecField label="Timeout">
          <SpecInput
            value={value.budget?.timeout}
            onChange={(timeout) =>
              onChange(withBudgetValue(value, "timeout", timeout))
            }
            placeholder="30m"
            icon={UiTimer}
            mono
          />
        </SpecField>
      </div>
      <ProviderStatusPanel
        models={models}
        families={families ?? SPEC_RUNTIME_FAMILIES}
        defaultCollapsed
      />
    </div>
  );
}

export function ModelAdvanced({
  value,
  onChange,
  models = [],
  families,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
}) {
  return (
    <div className="grid gap-density-2">
      <FallbackModelsEditor
        value={value}
        onChange={onChange}
        models={models}
        {...(families ? { families } : {})}
      />
      <SpecField label="Session ID">
        <SpecInput
          value={value.sessionId}
          onChange={(sessionId) =>
            onChange(withOptionalRoot(value, "sessionId", sessionId))
          }
          placeholder="session UUID"
          icon={UiFingerprint}
          mono
        />
      </SpecField>
      <CheckboxField
        label="Disable prompt caching"
        checked={value.noCache}
        onChange={(noCache) => onChange(withRoot(value, { noCache }))}
      />
    </div>
  );
}

function FallbackModelsEditor({
  value,
  onChange,
  models,
  families = SPEC_RUNTIME_FAMILIES,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models: ChatModel[];
  families?: SpecRuntimeFamily[] | undefined;
}) {
  const fallbacks = value.fallbacks ?? [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const setFallbacks = (nextFallbacks: AISpecRuntimeModelFallback[]) => {
    onChange(withRoot(value, { fallbacks: nextFallbacks }));
  };

  const removeFallback = (index: number) => {
    setFallbacks(fallbacks.filter((_, rowIndex) => rowIndex !== index));
    setExpandedIndex((current) => {
      if (current == null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const addFallback = () => {
    const nextFallbacks = [...fallbacks, newFallbackDraft(value, families)];
    setFallbacks(nextFallbacks);
    setExpandedIndex(nextFallbacks.length - 1);
  };

  const updateFallback = (index: number, nextFallback: FallbackDraftPatch) => {
    setFallbacks(
      fallbacks.map((fallback, rowIndex) =>
        rowIndex === index ? compactEditableFallback(nextFallback) : fallback
      )
    );
  };

  const toggleFallback = (index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="space-y-density-2">
      <div className="flex items-center justify-between gap-density-2">
        <div className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon icon={UiRepeat} className="size-3.5 shrink-0" />
          <span>Fallback models</span>
        </div>
        <button
          type="button"
          onClick={addFallback}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-density-2 py-density-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon icon={UiAdd} className="size-3.5" />
          Add
        </button>
      </div>
      {fallbacks.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="divide-y divide-border">
            {fallbacks.map((fallback, index) => (
              <FallbackModelRow
                key={`${fallback.model ?? "fallback"}-${index}`}
                fallback={fallback}
                models={models}
                families={families}
                expanded={expandedIndex === index}
                editorId={`spec-runtime-fallback-${index}-picker`}
                onToggle={() => toggleFallback(index)}
                onChange={(nextFallback) => updateFallback(index, nextFallback)}
                onRemove={() => removeFallback(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FallbackModelRow({
  fallback,
  models,
  families,
  expanded,
  editorId,
  onToggle,
  onChange,
  onRemove,
}: {
  fallback: AISpecRuntimeModelFallback;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  expanded: boolean;
  editorId: string;
  onToggle: () => void;
  onChange: (value: AISpecRuntimeModelFallback) => void;
  onRemove: () => void;
}) {
  const meta = fallbackModelMeta(fallback, models);
  const Glyph = meta.provider ? providerIcon(meta.provider) : undefined;
  const label = meta.label || "Select model";
  // The collapsed row is the bar in miniature: brand mark, runtime mode, model,
  // effort — each carrying the same tone it has inside the expanded editor.
  const mode = modeForBackend(families, fallback.backend);
  const effortGlyph = fallback.effort
    ? effortLevelIcon(fallback.effort)
    : undefined;
  return (
    <div>
      <div className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-density-1 px-density-1 py-density-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={editorId}
          aria-label={`Edit fallback ${label}`}
          onClick={onToggle}
          className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-density-2 rounded-md px-density-1 py-density-1 text-left hover:bg-muted"
        >
          {Glyph ? (
            <Glyph
              className={cn(
                "size-4 shrink-0",
                meta.provider ? providerIconColor(meta.provider) : undefined
              )}
            />
          ) : (
            <Icon
              icon={UiSparkles}
              className="size-4 shrink-0 text-muted-foreground/70"
            />
          )}
          {mode?.icon ? (
            <Icon
              icon={mode.icon}
              className="size-4 shrink-0 text-muted-foreground"
              title={mode.title ?? mode.label}
            />
          ) : (
            // Held open so rows with and without a known mode still align.
            <span aria-hidden="true" className="size-4" />
          )}
          <span
            className="min-w-0 truncate font-mono text-xs text-foreground"
            title={label}
          >
            {label}
          </span>
          {fallback.effort ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase leading-none text-muted-foreground">
              {effortGlyph && (
                <Icon
                  icon={effortGlyph}
                  className={cn("size-3", effortLevelColor(fallback.effort))}
                />
              )}
              {effortLevelLabel(fallback.effort)}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
        </button>
        <IconButton
          icon={UiTrash}
          label={`Remove ${label}`}
          onClick={onRemove}
          className="size-6"
          iconClassName="size-4"
        />
      </div>
      {expanded && (
        <div className="border-t border-border p-density-2">
          <FallbackModelPicker
            id={editorId}
            value={fallback}
            onChange={onChange}
            models={models}
            families={families}
          />
        </div>
      )}
    </div>
  );
}

function FallbackModelPicker({
  id,
  value,
  onChange,
  models,
  families,
}: {
  id: string;
  value: AISpecRuntimeModelFallback;
  onChange: (value: AISpecRuntimeModelFallback) => void;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label="Fallback model picker"
      className="rounded-md border border-dashed border-border bg-muted/20 p-density-2"
    >
      <RuntimeBar
        value={value}
        onChange={(next) => onChange(compactEditableFallback(next))}
        models={models}
        families={families}
        ariaLabel="Fallback runtime"
      />
    </div>
  );
}

function newFallbackDraft(
  value: AISpecRuntimeValue,
  families: SpecRuntimeFamily[]
): AISpecRuntimeModelFallback {
  const fallback: AISpecRuntimeModelFallback = {};
  const backend = value.backend || defaultFallbackBackend(families);
  if (backend) fallback.backend = backend;
  if (value.effort) fallback.effort = value.effort;
  if (value.temperature != null && Number.isFinite(value.temperature)) {
    fallback.temperature = value.temperature;
  }
  return fallback;
}

function defaultFallbackBackend(families: SpecRuntimeFamily[]): string {
  const family = families[0] ?? SPEC_RUNTIME_FAMILIES[0];
  return family ? firstMode(family).backend : "";
}

function compactEditableFallback(
  value: FallbackDraftPatch
): AISpecRuntimeModelFallback {
  const next: AISpecRuntimeModelFallback = {};
  const model = cleanString(value.model);
  if (model) next.model = model;
  const id = cleanString(value.id);
  if (id) next.id = id;
  const backend = cleanString(value.backend);
  if (backend) next.backend = backend;
  if (value.temperature != null && Number.isFinite(value.temperature)) {
    next.temperature = value.temperature;
  }
  const effort = cleanString(value.effort);
  if (effort) next.effort = effort;
  if (value.noCache) next.noCache = true;
  return next;
}

function fallbackModelMeta(
  fallback: AISpecRuntimeModelFallback,
  models: ChatModel[]
): { label: string; provider?: string | undefined } {
  const modelId = fallback.model ?? "";
  const match = models.find(
    (model) => model.id === modelId || model.label === modelId
  );
  if (match) return { label: match.label, provider: match.provider };
  return {
    label: modelId || fallback.id || "",
    provider: inferProvider(fallback),
  };
}

function inferProvider(
  fallback: AISpecRuntimeModelFallback
): string | undefined {
  const text = `${fallback.backend ?? ""} ${
    fallback.model ?? ""
  }`.toLowerCase();
  if (text.includes("anthropic") || text.includes("claude")) return "anthropic";
  if (text.includes("google") || text.includes("gemini")) return "googleai";
  if (
    text.includes("openai") ||
    text.includes("gpt") ||
    text.includes("codex")
  ) {
    return "openai";
  }
  return undefined;
}

function cleanString(value: string | undefined): string {
  return value?.trim() ?? "";
}
