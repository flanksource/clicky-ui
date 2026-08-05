import { useId, useState } from "react";
import { UiChevronDown, UiChevronRight } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import type { ChatModel } from "../chat/types";
import {
  availabilityStateLabel,
  providerStatusGroups,
  type ProviderReadiness,
  type ProviderStatusGroup,
  type ProviderStatusIssue,
} from "./provider-status";
import type { SpecRuntimeFamily } from "./runtime-mode";

export type ProviderStatusPanelProps = {
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  defaultCollapsed?: boolean | undefined;
  className?: string | undefined;
};

export function ProviderStatusPanel({
  models,
  families,
  defaultCollapsed = false,
  className,
}: ProviderStatusPanelProps) {
  const groups = providerStatusGroups(models, families);
  const issueCount = groups.reduce(
    (total, group) => total + group.issues.length,
    0
  );
  const firstIssueProvider =
    groups.find((group) => group.issues.length > 0)?.id ?? null;
  const inventoryId = useId();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(
    firstIssueProvider
  );
  const summary =
    issueCount === 0 ? "all providers ready" : issueLabel(issueCount);

  return (
    <section
      aria-label="Provider status"
      className={cn(
        "overflow-hidden rounded-md border border-border",
        className
      )}
    >
      <button
        type="button"
        aria-label={`Provider status, ${summary}`}
        aria-expanded={!collapsed}
        aria-controls={inventoryId}
        onClick={() => {
          const expandedGroup = groups.find(
            (group) => group.id === expandedProvider
          );
          if (
            collapsed &&
            (!expandedGroup || expandedGroup.issues.length === 0)
          ) {
            setExpandedProvider(firstIssueProvider);
          }
          setCollapsed((current) => !current);
        }}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-density-2 bg-background px-density-3 py-density-2 text-left hover:bg-muted/60"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-foreground">
            Provider status
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Availability by provider, model, and mode
          </span>
        </span>
        <span className="inline-flex items-center gap-density-2">
          <StatusBadge readiness={issueCount === 0 ? "ready" : "attention"}>
            {issueCount === 0 ? "Ready" : issueLabel(issueCount)}
          </StatusBadge>
          <Icon
            icon={collapsed ? UiChevronRight : UiChevronDown}
            className="size-3.5 text-muted-foreground"
          />
        </span>
      </button>
      {!collapsed && (
        <div
          id={inventoryId}
          className="divide-y divide-border border-t border-border"
        >
          {groups.map((group) => (
            <ProviderRow
              key={group.id}
              group={group}
              expanded={expandedProvider === group.id}
              onToggle={() =>
                setExpandedProvider((current) =>
                  current === group.id ? null : group.id
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProviderRow({
  group,
  expanded,
  onToggle,
}: {
  group: ProviderStatusGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailsId = useId();
  const ProviderIcon =
    providerIcon(group.iconProvider) ?? providerIcon(group.id);
  const iconColor =
    providerIconColor(group.iconProvider) ?? providerIconColor(group.id);
  return (
    <div>
      <button
        type="button"
        aria-label={`${group.label}, ${readinessLabel(group.readiness)}`}
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-density-2 px-density-3 py-density-2 text-left hover:bg-muted/50"
      >
        <Icon
          icon={expanded ? UiChevronDown : UiChevronRight}
          className="size-3 text-muted-foreground"
        />
        <span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-density-2">
          {ProviderIcon && (
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted/70 ring-1 ring-border/60">
              <Icon icon={ProviderIcon} className={cn("size-3.5", iconColor)} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-foreground">
              {group.label}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {providerSummary(group)}
            </span>
          </span>
        </span>
        <StatusBadge readiness={group.readiness}>
          {readinessLabel(group.readiness)}
        </StatusBadge>
      </button>
      {expanded && (
        <div
          id={detailsId}
          role="region"
          aria-label={`${group.label} provider details`}
          className="space-y-density-2 border-t border-border bg-muted/20 px-density-4 py-density-3"
        >
          {group.issues.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              All configured models and modes are available.
            </p>
          ) : (
            group.issues.map((issue) => (
              <ProviderIssue key={issue.id} issue={issue} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProviderIssue({ issue }: { issue: ProviderStatusIssue }) {
  return (
    <div className="grid gap-1 rounded-md border border-border bg-background px-density-3 py-density-2">
      <div className="flex items-start justify-between gap-density-2">
        <span className="text-xs font-medium text-foreground">
          {issue.label}
        </span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
          {availabilityStateLabel(issue.availability.state)}
        </span>
      </div>
      {issue.availability.reason && (
        <p className="text-xs text-foreground">{issue.availability.reason}</p>
      )}
      {issue.availability.remediation && (
        <p className="text-[11px] text-muted-foreground">
          {issue.availability.remediation}
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  readiness,
  children,
}: {
  readiness: ProviderReadiness;
  children: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
        readiness === "ready" && "bg-emerald-500/10 text-emerald-700",
        readiness === "attention" && "bg-amber-500/10 text-amber-700",
        readiness === "disabled" && "bg-muted text-muted-foreground",
        readiness === "unavailable" && "bg-destructive/10 text-destructive"
      )}
    >
      {children}
    </span>
  );
}

function readinessLabel(readiness: ProviderReadiness): string {
  if (readiness === "attention") return "needs attention";
  return readiness;
}

function providerSummary(group: ProviderStatusGroup): string {
  const modes = `${group.availableModes} of ${group.totalModes} modes available`;
  const unavailableModels = group.totalModels - group.availableModels;
  if (unavailableModels === 0) return modes;
  return `${modes} · ${unavailableModels} unavailable ${
    unavailableModels === 1 ? "model" : "models"
  }`;
}

function issueLabel(count: number): string {
  return `${count} ${count === 1 ? "issue" : "issues"}`;
}
