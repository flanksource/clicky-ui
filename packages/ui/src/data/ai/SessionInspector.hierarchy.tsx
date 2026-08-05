import { useEffect, useRef, useState, type ReactNode } from "react";
import { UiChevronDown, UiRepeat, UiRobotAi } from "../../icons";
import { cn } from "../../lib/utils";
import { formatDuration } from "../../lib/format";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { StatusDot } from "../cells/StatusDot";
import { formatRelativeTime } from "../cells/timestamp-format";
import { Tree } from "../Tree";
import { Icon } from "../Icon";
import { providerIcon, providerIconColor } from "../chat/provider-icons";
import { effortIcon, WORKFLOW_PHASES } from "./agent-action-icons";
import { SPEC_RUNTIME_FAMILIES } from "../runtime/runtime-mode";
import { formatCost } from "./session-cost";
import {
  hierarchyCheckState,
  selectedSessionCount,
  sessionKey,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionHierarchyNode,
} from "./SessionInspector.collection";
import type { SessionHierarchyState } from "./SessionInspector.hierarchy-state";

export function SessionHierarchyPicker({
  collection,
  state,
  renderSessionActions,
}: {
  collection: SessionCollectionInput;
  state: SessionHierarchyState;
  renderSessionActions?: (item: SessionCollectionItem) => ReactNode;
}) {
  const selected = selectedSessionCount(state.roots, state.checked);
  const total = collection.sessions.length;
  const label = `${selected} of ${total} session${total === 1 ? "" : "s"}`;
  return (
    <DropdownMenu
      className="shrink-0"
      align="left"
      menuLabel="Session content"
      menuClassName="h-[min(58vh,34rem)] w-[min(42rem,calc(100vw-2rem))] overflow-hidden p-2"
      trigger={
        <button
          type="button"
          aria-label={`Select session content: ${label}`}
          className="flex h-control-h max-w-56 items-center gap-density-2 rounded-md border border-border bg-background px-density-2 text-left text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/40"
        >
          <Icon
            icon={UiRobotAi}
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <Icon
            icon={UiChevronDown}
            className="size-3.5 shrink-0 text-muted-foreground"
          />
        </button>
      }
    >
      {() => (
        <Tree
          roots={state.roots}
          ariaLabel="Session content"
          className="h-full"
          showControls
          getKey={(node) => node.key}
          getChildren={(node) => node.children}
          getSearchText={(node) =>
            [node.label, node.model, node.effort, node.mode]
              .filter(Boolean)
              .join(" ")
          }
          defaultOpen={(node) =>
            node.key === sessionKey(collection.currentSessionId)
          }
          hasMoreChildren={(node) =>
            node.kind === "session" &&
            Boolean(
              node.item &&
              !state.loadedSessionIds.has(node.item.id) &&
              collection.loadSession,
            )
          }
          loadChildren={state.loadChildren}
          renderRow={({ node, loading, error }) => {
            const message = error
              ? String(error)
              : state.errors.get(node.itemId);
            const actions =
              node.kind === "session" && node.item
                ? renderSessionActions?.(node.item)
                : undefined;
            return (
              <HierarchyRow
                node={node}
                checkState={hierarchyCheckState(node, state.checked)}
                loading={loading || state.loading.has(node.itemId)}
                onChecked={(include) => {
                  void state
                    .setBranchChecked(node, include)
                    .catch(() => undefined);
                }}
                {...(message ? { error: message } : {})}
                {...(actions ? { actions } : {})}
              />
            );
          }}
        />
      )}
    </DropdownMenu>
  );
}

function HierarchyRow({
  node,
  checkState,
  loading,
  error,
  onChecked,
  actions,
}: {
  node: SessionHierarchyNode;
  checkState: "checked" | "indeterminate" | "unchecked";
  loading: boolean;
  error?: string;
  onChecked: (include: boolean) => void;
  actions?: ReactNode;
}) {
  const ProviderIcon =
    node.kind === "session" ? providerIcon(node.provider) : undefined;
  const EffortIcon = node.effort ? effortIcon(node.effort) : undefined;
  const ModeIcon = node.mode ? modeIcon(node.mode) : undefined;
  const NodeIcon = node.kind === "turn" ? UiRepeat : UiRobotAi;
  const age = useRelativeAge(node.updatedAt);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-density-2 py-1">
      <HierarchyCheckbox
        label={`Include ${node.label}`}
        state={checkState}
        onChange={onChecked}
      />
      <Icon
        icon={ProviderIcon ?? NodeIcon}
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          ProviderIcon && providerIconColor(node.provider),
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-density-2">
          <span className="truncate text-xs font-medium text-foreground">
            {node.label}
          </span>
          {node.status ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <StatusDot status={statusDotStatus(node.status)} size="xs" />
              {node.status}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-wrap gap-x-density-2 text-[10px] text-muted-foreground">
          {node.model ? <span>{node.model}</span> : null}
          {node.effort ? (
            <span className="inline-flex items-center gap-0.5">
              {EffortIcon ? (
                <Icon
                  icon={EffortIcon.icon}
                  title={`${EffortIcon.label} effort`}
                  className={cn("size-3", effortToneClass(EffortIcon.tone))}
                />
              ) : null}
              {node.effort} effort
            </span>
          ) : null}
          {ModeIcon?.icon ? (
            <Icon
              icon={ModeIcon.icon}
              title={`${ModeIcon.label} mode`}
              className="size-3 text-muted-foreground"
            />
          ) : null}
          {node.pid ? <span>pid {node.pid}</span> : null}
          {node.durationMs !== undefined ? (
            <span>{formatDuration(node.durationMs)}</span>
          ) : null}
          {age ? <span title={node.updatedAt}>{age}</span> : null}
          <span>{node.cost ? formatCost(node.cost) : "-"}</span>
          {loading ? <span>Loading…</span> : null}
          {error ? (
            <span role="alert" className="text-destructive">
              {error}
            </span>
          ) : null}
        </div>
      </div>
      {actions ? (
        <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
          {actions}
        </span>
      ) : null}
    </div>
  );
}

const EFFORT_TONE_CLASS = {
  sky: "text-sky-600",
  amber: "text-amber-600",
  violet: "text-violet-600",
  emerald: "text-emerald-600",
  teal: "text-teal-600",
  orange: "text-orange-600",
  rose: "text-rose-600",
  indigo: "text-indigo-600",
  fuchsia: "text-fuchsia-600",
  pink: "text-pink-600",
  slate: "text-slate-500",
} as const;

function effortToneClass(tone: keyof typeof EFFORT_TONE_CLASS) {
  return EFFORT_TONE_CLASS[tone];
}

function modeIcon(mode: string) {
  const key = mode.trim().toLowerCase();
  if (key in WORKFLOW_PHASES) {
    return WORKFLOW_PHASES[key as keyof typeof WORKFLOW_PHASES];
  }
  for (const family of SPEC_RUNTIME_FAMILIES) {
    const match = family.modes.find(
      (candidate) => candidate.id === key || candidate.backend === key,
    );
    if (match) return { icon: match.icon, label: match.label };
  }
  return undefined;
}

function statusDotStatus(status: string) {
  switch (status.trim().toLowerCase()) {
    case "completed":
    case "succeeded":
      return "success" as const;
    case "failed":
    case "cancelled":
    case "zombie":
      return "error" as const;
    case "planning":
    case "ask":
    case "stopping":
      return "warning" as const;
    default:
      return "info" as const;
  }
}

function useRelativeAge(updatedAt: string | undefined) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!updatedAt) return undefined;
    const timer = window.setInterval(
      () => setTick((value) => value + 1),
      30_000,
    );
    return () => window.clearInterval(timer);
  }, [updatedAt]);
  if (!updatedAt) return "";
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime()) ? "" : formatRelativeTime(date);
}

function HierarchyCheckbox({
  label,
  state,
  onChange,
}: {
  label: string;
  state: "checked" | "indeterminate" | "unchecked";
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "indeterminate";
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={state === "checked"}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.checked)}
      className="size-3.5 shrink-0 accent-primary"
    />
  );
}
