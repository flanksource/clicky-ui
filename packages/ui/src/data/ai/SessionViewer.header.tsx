import { ContextMeter, type ContextMeterMode } from "../chat/ContextMeter";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import { Icon } from "../Icon";
import { PERMISSION_MODE_ICONS } from "./agent-action-icons";
import { costTotal, tokenTotal } from "./session-cost";
import { sessionTone } from "./session-tones";
import type { SessionMetadataSummary } from "./SessionViewer.model";
import { SPEC_PERMISSION_MODES } from "./SpecRuntimeEditor.model";

function hasContextMeterMetadata(metadata: SessionMetadataSummary) {
  return Boolean(metadata.context || metadata.sessionId || metadata.model);
}

export function SessionContextMeter({
  metadata,
  mode,
}: {
  metadata: SessionMetadataSummary;
  mode: ContextMeterMode;
}) {
  if (!hasContextMeterMetadata(metadata)) return null;
  const context = metadata.context;
  const modelIcon = metadata.provider
    ? providerIcon(metadata.provider)
    : undefined;

  return (
    <ContextMeter
      mode={mode}
      usedPercent={context ? 100 - context.freePercent : 0}
      {...(context
        ? {
            usedTokens: context.usedTokens,
            windowTokens: context.windowTokens,
          }
        : {})}
      {...(metadata.sessionId ? { sessionId: metadata.sessionId } : {})}
      {...(metadata.executionMode
        ? { executionMode: metadata.executionMode }
        : {})}
      {...(metadata.model ? { model: metadata.model } : {})}
      {...(metadata.reasoningEffort
        ? { effort: metadata.reasoningEffort }
        : {})}
      {...(modelIcon ? { modelIcon } : {})}
      {...(metadata.provider
        ? {
            provider: metadata.provider,
            modelIconClassName: providerIconColor(metadata.provider),
          }
        : {})}
      {...(metadata.usage
        ? {
            tokens: {
              input: metadata.usage.inputTokens,
              output: metadata.usage.outputTokens,
              reasoning: metadata.usage.reasoningTokens,
              cacheRead: metadata.usage.cacheReadTokens,
              cacheWrite: metadata.usage.cacheWriteTokens,
              total: tokenTotal(metadata.usage),
            },
          }
        : {})}
      {...(metadata.cost
        ? {
            cost: {
              input: metadata.cost.inputCost,
              output: metadata.cost.outputCost,
              reasoning: metadata.cost.reasoningCost,
              cacheRead: metadata.cost.cacheReadCost,
              cacheWrite: metadata.cost.cacheWriteCost,
              total: costTotal(metadata.cost),
            },
          }
        : {})}
      {...(metadata.budget ? { budget: metadata.budget } : {})}
    />
  );
}

export function SessionMetadataBadges({
  metadata,
  showContextMeter,
}: {
  metadata: SessionMetadataSummary;
  showContextMeter: boolean;
}) {
  const capabilityBadges = [
    countBadge("tool", metadata.capabilities?.tools),
    countBadge("mcp", metadata.capabilities?.pendingMcpServers),
    countBadge("agent", metadata.capabilities?.agents),
    countBadge("skill", metadata.capabilities?.skills),
  ].filter(Boolean) as Array<{ key: string; label: string; title?: string }>;
  const badges: Array<{ key: string; label: string; title?: string }> = [
    ...(metadata.turns?.length
      ? [{ key: "turns", label: countLabel(metadata.turns.length, "turn") }]
      : []),
    ...capabilityBadges,
    ...(!metadata.context && metadata.budget
      ? [{ key: "budget", label: budgetLabel(metadata.budget) }]
      : []),
    ...(metadata.events?.length
      ? [{ key: "events", label: countLabel(metadata.events.length, "event") }]
      : []),
  ];
  const permissionMode = permissionModeBadge(metadata.permissionMode);
  const renderContextMeter =
    showContextMeter && hasContextMeterMetadata(metadata);
  if (badges.length === 0 && !permissionMode && !renderContextMeter) {
    return null;
  }

  return (
    <>
      {badges.map((badge) => (
        <span
          key={badge.key}
          title={badge.title}
          className="inline-flex max-w-40 items-center rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
        >
          <span className="truncate">{badge.label}</span>
        </span>
      ))}
      {permissionMode && (
        <span
          title={`Permission mode: ${permissionMode.label}`}
          className="inline-flex max-w-40 items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
        >
          {permissionMode.icon && (
            <Icon
              icon={permissionMode.icon}
              className={`size-3 shrink-0 ${sessionTone(permissionMode.tone).text}`}
            />
          )}
          <span className="truncate">{permissionMode.label}</span>
        </span>
      )}
      {renderContextMeter ? (
        <SessionContextMeter metadata={metadata} mode="bar" />
      ) : null}
    </>
  );
}

function permissionModeBadge(mode: string | undefined) {
  if (!mode) return undefined;
  const posture = SPEC_PERMISSION_MODES.find((candidate) => candidate === mode);
  const known = posture ? PERMISSION_MODE_ICONS[posture] : undefined;
  return {
    label: known?.label ?? mode,
    icon: known?.icon,
    tone: known?.tone ?? ("slate" as const),
  };
}

function countBadge(label: string, values: string[] | undefined) {
  const count = values?.length ?? 0;
  if (!count) return null;
  return {
    key: label,
    label: countLabel(count, label),
    title: values?.join(", "),
  };
}

function countLabel(count: number, label: string) {
  if (label === "mcp") return `${count} mcp`;
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function budgetLabel(budget: {
  used?: number;
  total?: number;
  remaining?: number;
}) {
  if (budget.total !== undefined && budget.total > 0) {
    return `budget ${formatUSD(budget.used ?? 0)}/${formatUSD(budget.total)}`;
  }
  if (budget.remaining !== undefined)
    return `budget ${formatUSD(budget.remaining)} left`;
  if (budget.used !== undefined) return `budget ${formatUSD(budget.used)} used`;
  return "budget";
}

function formatUSD(value: number) {
  if (value < 1 || !Number.isInteger(value)) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(0)}`;
}
