import { Button } from "../../components/button";
import { cn } from "../../lib/utils";
import { ProviderStatusPanel } from "../runtime/ProviderStatusPanel";
import { RuntimeBar } from "../runtime/RuntimeBar";
import {
  SPEC_RUNTIME_FAMILIES,
  type SpecRuntimeFamily,
} from "../runtime/runtime-mode";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatModelRuntime,
  ChatUsageSummary,
  ClaudePermissionMode,
} from "../chat/types";
import { CLAUDE_PERMISSION_MODE_OPTIONS } from "../chat/types";

export type AdvancedChatConfigProps = {
  models: ChatModel[];
  runtime: ChatModelRuntime;
  onRuntimeChange?: ((runtime: ChatModelRuntime) => void) | undefined;
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  reasoningEfforts: string[];
  runtimeLocked?: boolean | undefined;
  permissionMode: ClaudePermissionMode;
  onPermissionModeChange?: ((mode: ClaudePermissionMode) => void) | undefined;
  temperature?: number | undefined;
  onTemperatureChange?: ((temperature: number | undefined) => void) | undefined;
  budget?: ChatBudgetConfig | undefined;
  onBudgetChange?: ((budget: ChatBudgetConfig) => void) | undefined;
  usage?: ChatUsageSummary | null | undefined;
  catalogLoading?: boolean | undefined;
  catalogError?: string | null | undefined;
  onCatalogRetry?: (() => void) | undefined;
};

export function AdvancedChatConfig({
  models,
  runtime,
  onRuntimeChange,
  runtimeFamilies,
  reasoningEfforts,
  runtimeLocked = false,
  permissionMode,
  onPermissionModeChange,
  temperature,
  onTemperatureChange,
  budget,
  onBudgetChange,
  usage,
  catalogLoading = false,
  catalogError = null,
  onCatalogRetry,
}: AdvancedChatConfigProps) {
  const updateBudget = (key: keyof ChatBudgetConfig, raw: string) => {
    const next: ChatBudgetConfig = { ...budget };
    const parsed = parseOptionalNumber(raw, key === "maxTokens");
    if (parsed === undefined) delete next[key];
    else next[key] = parsed;
    onBudgetChange?.(next);
  };

  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <div className="space-y-4">
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Runtime
          </div>
          {runtimeLocked && (
            <div className="rounded border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Model and backend are locked after the first message. Fork this
              conversation to change them; effort and generation settings remain
              adjustable.
            </div>
          )}
          {catalogLoading && (
            <div className="text-xs text-muted-foreground">
              Checking model and runtime availability…
            </div>
          )}
          {catalogError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              <span>{catalogError}</span>
              {onCatalogRetry && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onCatalogRetry}
                >
                  Retry
                </Button>
              )}
            </div>
          )}
          <RuntimeBar
            variant="segmented"
            ariaLabel="Advanced runtime"
            value={runtime}
            onChange={(next) => onRuntimeChange?.(next)}
            models={models}
            reasoningEfforts={reasoningEfforts}
            locked={runtimeLocked}
            {...(runtimeFamilies ? { families: runtimeFamilies } : {})}
            className="max-w-full"
          />
          <label className="grid max-w-md grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 text-xs">
            <span className="text-muted-foreground">Permission mode</span>
            <select
              aria-label="Permission mode"
              value={permissionMode}
              onChange={(event) =>
                onPermissionModeChange?.(
                  event.target.value as ClaudePermissionMode,
                )
              }
              className="h-8 rounded border border-border bg-background px-2 text-xs"
            >
              {CLAUDE_PERMISSION_MODE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  title={option.description}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Generation
          </div>
          <label className="grid grid-cols-[8rem_minmax(0,1fr)_4rem] items-center gap-3 text-xs">
            <span className="text-muted-foreground">Temperature</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature ?? 0}
              onChange={(event) =>
                onTemperatureChange?.(Number(event.target.value))
              }
            />
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={temperature ?? ""}
              onChange={(event) =>
                onTemperatureChange?.(parseOptionalNumber(event.target.value))
              }
              className="h-8 rounded border border-border bg-background px-2 text-xs"
            />
          </label>
        </section>
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Budget
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Max cost</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={budget?.cost ?? ""}
                onChange={(event) => updateBudget("cost", event.target.value)}
                className="h-8 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Max tokens</span>
              <input
                type="number"
                min={0}
                step={1}
                value={budget?.maxTokens ?? ""}
                onChange={(event) =>
                  updateBudget("maxTokens", event.target.value)
                }
                className="h-8 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </label>
          </div>
        </section>
      </div>
      <UsageCostPanel
        usage={usage}
        models={models}
        families={runtimeFamilies ?? SPEC_RUNTIME_FAMILIES}
        showProviderStatus={!catalogLoading}
      />
    </div>
  );
}

function UsageCostPanel({
  usage,
  models,
  families,
  showProviderStatus,
}: {
  usage?: ChatUsageSummary | null | undefined;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  showProviderStatus: boolean;
}) {
  const tokens = usage?.usage;
  const costs = usage?.costBreakdown;
  return (
    <aside className="space-y-3 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
      {/* Both tables describe the last completed turn; only the bold total is
          cumulative. Labelled explicitly because the rows will not sum to it,
          and the full conversation breakdown lives in the Costs tab. */}
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Usage (last turn)
      </div>
      <div className="overflow-hidden rounded border border-border">
        <MetricRow
          label="Context"
          value={`${formatNumber(usage?.usedTokens)} / ${formatNumber(
            usage?.maxTokens,
          )}`}
        />
        <MetricRow
          label="Input tokens"
          value={formatNumber(tokens?.inputTokens)}
        />
        <MetricRow
          label="Output tokens"
          value={formatNumber(tokens?.outputTokens)}
        />
        <MetricRow
          label="Reasoning tokens"
          value={formatNumber(tokens?.reasoningTokens)}
        />
        <MetricRow
          label="Cache read tokens"
          value={formatNumber(tokens?.cacheReadTokens)}
        />
        <MetricRow
          label="Cache write tokens"
          value={formatNumber(tokens?.cacheWriteTokens)}
        />
        <MetricRow
          label="Total tokens"
          value={formatNumber(tokens?.totalTokens)}
        />
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Cost (last turn)
      </div>
      <div className="overflow-hidden rounded border border-border">
        <MetricRow label="Input" value={formatUSD(costs?.inputUsd)} />
        <MetricRow label="Output" value={formatUSD(costs?.outputUsd)} />
        <MetricRow label="Reasoning" value={formatUSD(costs?.reasoningUsd)} />
        <MetricRow label="Cache read" value={formatUSD(costs?.cacheReadUsd)} />
        <MetricRow
          label="Cache write"
          value={formatUSD(costs?.cacheWriteUsd)}
        />
        <MetricRow
          label="Conversation total"
          value={formatUSD(usage?.cost ?? costs?.totalUsd)}
          strong
        />
      </div>
      {showProviderStatus && (
        <ProviderStatusPanel models={models} families={families} />
      )}
    </aside>
  );
}

function MetricRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border px-2 py-1.5 text-xs last:border-b-0">
      <span className="truncate text-muted-foreground">{label}</span>
      <span
        className={cn("font-mono", strong && "font-semibold text-foreground")}
      >
        {value}
      </span>
    </div>
  );
}

function parseOptionalNumber(raw: string, integer = false): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  return integer ? Math.max(0, Math.trunc(value)) : value;
}

function formatNumber(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat().format(value);
}

function formatUSD(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `$${value.toFixed(value >= 1 ? 4 : 6)}`;
}
