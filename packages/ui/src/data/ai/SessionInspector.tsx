import { useMemo, useState, type ReactNode } from "react";
import { SegmentedControl, type SegmentedOption } from "../../components/SegmentedControl";
import { cn } from "../../lib/utils";
import { CodeBlock } from "../CodeBlock";
import { KeyValueList, type KeyValueListItem } from "../KeyValueList";
import { SessionViewer, type SessionViewerProps } from "./SessionViewer";
import type { SessionInput } from "./SessionViewer.model";
import type {
  SessionAgent,
  SessionApprovalStats,
  SessionChangedFiles,
  SessionContext,
  SessionCost,
  SessionHealth,
  SessionLiveProcess,
  SessionPlan,
  SessionTurn,
  SessionUsage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";

export type SessionInspectorTab =
  | "transcript"
  | "turns"
  | "agents"
  | "files"
  | "plan"
  | "approvals"
  | "costs"
  | "metadata"
  | "raw";

export interface SessionInspectorProps {
  session: SessionInput;
  className?: string;
  defaultTab?: SessionInspectorTab;
  transcriptProps?: Omit<SessionViewerProps, "session">;
}

const TAB_OPTIONS: SegmentedOption<SessionInspectorTab>[] = [
  { id: "transcript", label: "Transcript" },
  { id: "turns", label: "Turns" },
  { id: "agents", label: "Agents" },
  { id: "files", label: "Files" },
  { id: "plan", label: "Plan" },
  { id: "approvals", label: "Approvals" },
  { id: "costs", label: "Costs" },
  { id: "metadata", label: "Metadata" },
  { id: "raw", label: "Raw" },
];

export function SessionInspector({
  session,
  className,
  defaultTab = "transcript",
  transcriptProps,
}: SessionInspectorProps) {
  const detail = useMemo(() => asUnifiedSession(session), [session]);
  const [tab, setTab] = useState<SessionInspectorTab>(defaultTab);
  const transcriptClassName = cn("h-full", transcriptProps?.className);

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background text-sm", className)}>
      <div className="shrink-0 border-b border-border p-density-3">
        <SegmentedControl
          value={tab}
          options={TAB_OPTIONS}
          onChange={setTab}
          size="sm"
          wrap
          aria-label="Session detail view"
        />
      </div>
      <div
        className={cn(
          "min-h-0 flex-1",
          tab === "transcript" ? "overflow-hidden" : "overflow-auto p-density-4",
        )}
      >
        {tab === "transcript" ? (
          <SessionViewer
            session={session}
            scrollable
            showRowMetadata
            {...transcriptProps}
            className={transcriptClassName}
          />
        ) : (
          <InspectorTab tab={tab} detail={detail} session={session} />
        )}
      </div>
    </div>
  );
}

function InspectorTab({
  tab,
  detail,
  session,
}: {
  tab: SessionInspectorTab;
  detail: UnifiedSessionInput | undefined;
  session: SessionInput;
}) {
  switch (tab) {
    case "turns":
      return <TurnsPanel turns={detail?.turns} />;
    case "agents":
      return <AgentsPanel root={detail?.root} agents={detail?.agents} />;
    case "files":
      return <FilesPanel files={detail?.files} />;
    case "plan":
      return <PlanPanel plan={detail?.plan} />;
    case "approvals":
      return <ApprovalsPanel approvals={detail?.approvals} />;
    case "costs":
      return <CostsPanel usage={detail?.usage} cost={detail?.cost} toolCosts={detail?.toolCosts} />;
    case "metadata":
      return <MetadataPanel session={detail} />;
    case "raw":
      return <RawPanel value={detail ?? session} />;
    default:
      return null;
  }
}

function TurnsPanel({ turns }: { turns: SessionTurn[] | undefined }) {
  if (!turns?.length) return <EmptyState>No turn metadata.</EmptyState>;
  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <Th>Turn</Th>
            <Th>Time</Th>
            <Th>Model</Th>
            <Th>Stop</Th>
            <Th>Usage</Th>
            <Th>Cost</Th>
            <Th>Context</Th>
            <Th>Messages</Th>
            <Th>Events</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {turns.map((turn) => (
            <tr key={turn.id} className="align-top">
              <Td>
                <div className="font-medium text-foreground">{turn.index || turn.id}</div>
                <div className="text-xs text-muted-foreground">{turn.id}</div>
              </Td>
              <Td>{timeRange(turn.startedAt, turn.endedAt)}</Td>
              <Td>{turn.model || muted("-")}</Td>
              <Td>{turn.stopReason || muted("-")}</Td>
              <Td>{usageLabel(turn.usage)}</Td>
              <Td>{costLabel(turn.cost)}</Td>
              <Td>{contextLabel(turn.context)}</Td>
              <Td>{countLabel(turn.messageIds?.length, "message")}</Td>
              <Td>{countLabel(turn.events?.length, "event")}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgentsPanel({
  root,
  agents,
}: {
  root: SessionAgent | undefined;
  agents: SessionAgent[] | undefined;
}) {
  const nodes = root ? [root] : agents ?? [];
  if (!nodes.length) return <EmptyState>No agent hierarchy.</EmptyState>;
  return (
    <div className="space-y-density-2">
      {nodes.map((agent, index) => (
        <AgentNode key={agent.id || index} agent={agent} />
      ))}
    </div>
  );
}

function AgentNode({ agent, depth = 0 }: { agent: SessionAgent; depth?: number }) {
  return (
    <div className={cn(depth > 0 && "ml-density-5 border-l border-border pl-density-3")}>
      <div className="rounded-md border border-border p-density-3">
        <div className="flex min-w-0 flex-wrap items-center gap-density-2">
          <span className="font-medium">{agent.isRoot ? "Root" : agent.type || "Agent"}</span>
          {agent.id && <span className="truncate text-xs text-muted-foreground">{agent.id}</span>}
        </div>
        {agent.desc && <div className="mt-1 text-sm text-muted-foreground">{agent.desc}</div>}
        <div className="mt-2 grid gap-density-2 text-xs text-muted-foreground md:grid-cols-3">
          {agent.historyFile && <div className="truncate">History: {agent.historyFile}</div>}
          <div>{usageLabel(agent.usage)}</div>
          <div>{costLabel(agent.cost)}</div>
        </div>
      </div>
      {agent.children?.length ? (
        <div className="mt-density-2 space-y-density-2">
          {agent.children.map((child, index) => (
            <AgentNode key={child.id || index} agent={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilesPanel({ files }: { files: SessionChangedFiles | undefined }) {
  const read = files?.read ?? [];
  const written = files?.written ?? [];
  if (read.length === 0 && written.length === 0) return <EmptyState>No changed-file summary.</EmptyState>;
  return (
    <div className="grid gap-density-4 md:grid-cols-2">
      <PathList title={`Read (${read.length})`} paths={read} />
      <PathList title={`Written (${written.length})`} paths={written} />
    </div>
  );
}

function PathList({ title, paths }: { title: string; paths: string[] }) {
  return (
    <section className="min-w-0">
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      {paths.length ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {paths.map((path) => (
            <li key={path} className="truncate px-density-3 py-density-2 font-mono text-xs">
              {path}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState compact>None.</EmptyState>
      )}
    </section>
  );
}

function PlanPanel({ plan }: { plan: SessionPlan | undefined }) {
  if (!plan) return <EmptyState>No plan metadata.</EmptyState>;
  return (
    <div className="space-y-density-4">
      <KeyValueList
        items={[
          kv("Path", plan.path),
          kv("Slug", plan.slug),
          kv("Explicit", plan.explicit === undefined ? undefined : String(plan.explicit)),
          kv("Events", countLabel(plan.events?.length, "event")),
        ]}
      />
      {plan.content && <CodeBlock language="markdown" source={plan.content} copyable />}
      {plan.events?.length ? (
        <SimpleList
          title="Plan Events"
          rows={plan.events.map((event, index) => ({
            key: `${event.kind}-${index}`,
            title: event.kind,
            detail: [formatTime(event.timestamp), event.reason].filter(Boolean).join(" - "),
          }))}
        />
      ) : null}
    </div>
  );
}

function ApprovalsPanel({ approvals }: { approvals: SessionApprovalStats | undefined }) {
  if (!approvals || (!approvals.approved && !approvals.denied && !approvals.denials?.length)) {
    return <EmptyState>No approval metadata.</EmptyState>;
  }
  return (
    <div className="space-y-density-4">
      <KeyValueList
        items={[
          kv("Approved", approvals.approved ?? 0),
          kv("Denied", approvals.denied ?? 0),
        ]}
      />
      {approvals.denials?.length ? (
        <SimpleList
          title="Denials"
          rows={approvals.denials.map((denial, index) => ({
            key: denial.toolUseId || `${denial.tool}-${index}`,
            title: [denial.tool, denial.toolUseId].filter(Boolean).join(" "),
            detail: denial.reason,
          }))}
        />
      ) : null}
    </div>
  );
}

function CostsPanel({
  usage,
  cost,
  toolCosts,
}: {
  usage: SessionUsage | undefined;
  cost: SessionCost | undefined;
  toolCosts: SessionCost[] | undefined;
}) {
  if (!usage && !cost && !toolCosts?.length) return <EmptyState>No cost metadata.</EmptyState>;
  return (
    <div className="space-y-density-4">
      <KeyValueList
        items={[
          kv("Tokens", usageLabel(usage ?? cost)),
          kv("Cost", costLabel(cost)),
          kv("Input", compactNumber((usage ?? cost)?.inputTokens)),
          kv("Output", compactNumber((usage ?? cost)?.outputTokens)),
          kv("Reasoning", compactNumber((usage ?? cost)?.reasoningTokens)),
          kv("Cache Read", compactNumber((usage ?? cost)?.cacheReadTokens)),
          kv("Cache Write", compactNumber((usage ?? cost)?.cacheWriteTokens)),
        ]}
      />
      {toolCosts?.length ? <CostBreakdown costs={toolCosts} /> : null}
    </div>
  );
}

function CostBreakdown({ costs }: { costs: SessionCost[] }) {
  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <Th>Model</Th>
            <Th>Tokens</Th>
            <Th>Input</Th>
            <Th>Output</Th>
            <Th>Cache</Th>
            <Th>Cost</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {costs.map((entry, index) => (
            <tr key={`${entry.model || "model"}-${index}`}>
              <Td>{entry.model || muted("unknown")}</Td>
              <Td>{compactNumber(totalTokens(entry))}</Td>
              <Td>{compactNumber(entry.inputTokens)}</Td>
              <Td>{compactNumber(entry.outputTokens)}</Td>
              <Td>{compactNumber((entry.cacheReadTokens ?? 0) + (entry.cacheWriteTokens ?? 0))}</Td>
              <Td>{costLabel(entry)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetadataPanel({ session }: { session: UnifiedSessionInput | undefined }) {
  if (!session) return <EmptyState>No unified session metadata.</EmptyState>;
  const identity: KeyValueListItem[] = [
    kv("ID", session.id),
    kv("Source", session.source),
    kv("Project", session.project),
    kv("CWD", session.cwd),
    kv("History", session.historyFile),
    kv("Model", session.model),
    kv("Provider", session.provider),
    kv("Version", session.version),
    kv("Git", gitLabel(session.git)),
    kv("Started", formatTime(session.startedAt)),
    kv("Ended", formatTime(session.endedAt)),
    kv("Duration", durationLabel(session.startedAt, session.endedAt)),
    kv("Live", liveLabel(session.live)),
    kv("Health", healthLabel(session.health)),
  ];
  return (
    <div className="space-y-density-4">
      <KeyValueList items={identity} />
      <JsonSection title="Capabilities" value={session.capabilities} />
      <JsonSection title="Context" value={session.context} />
      <JsonSection title="Budget" value={session.budget} />
      <JsonSection title="Events" value={session.events} />
      <JsonSection title="Prompt" value={session.prompt} />
    </div>
  );
}

function RawPanel({ value }: { value: unknown }) {
  return <CodeBlock language="json" source={jsonSource(value)} copyable jsonDefaultOpenDepth={1} />;
}

function JsonSection({ title, value }: { title: string; value: unknown }) {
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <section>
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <CodeBlock language="json" source={jsonSource(value)} jsonDefaultOpenDepth={1} />
    </section>
  );
}

function SimpleList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; title?: ReactNode; detail?: ReactNode }>;
}) {
  return (
    <section>
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <ul className="divide-y divide-border rounded-md border border-border">
        {rows.map((row) => (
          <li key={row.key} className="px-density-3 py-density-2">
            <div className="text-sm font-medium">{row.title || row.key}</div>
            {row.detail ? <div className="mt-0.5 text-xs text-muted-foreground">{row.detail}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-density-3 py-density-2 font-medium">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-density-3 py-density-2">{children}</td>;
}

function EmptyState({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border text-sm text-muted-foreground",
        compact ? "p-density-3" : "p-density-6 text-center",
      )}
    >
      {children}
    </div>
  );
}

function kv(label: ReactNode, value: ReactNode | undefined | null): KeyValueListItem {
  return {
    key: String(label),
    label,
    value: value === undefined || value === null || value === "" ? muted("-") : value,
    hidden: value === undefined || value === null || value === "",
  };
}

function muted(value: ReactNode) {
  return <span className="text-muted-foreground">{value}</span>;
}

function asUnifiedSession(session: SessionInput): UnifiedSessionInput | undefined {
  if (typeof session !== "object" || session === null || Array.isArray(session)) return undefined;
  return session as UnifiedSessionInput;
}

function jsonSource(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function timeRange(start?: string, end?: string) {
  const parts = [formatTime(start), formatTime(end)].filter(Boolean);
  return parts.length ? parts.join(" - ") : muted("-");
}

function durationLabel(start?: string, end?: string) {
  if (!start || !end) return "";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return "";
  const seconds = Math.round((e - s) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  if (minutes < 60) return rem ? `${minutes}m ${rem}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const min = minutes % 60;
  return min ? `${hours}h ${min}m` : `${hours}h`;
}

function compactNumber(value?: number) {
  if (!value) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

function totalTokens(usage?: SessionUsage | SessionCost) {
  if (!usage) return 0;
  return (
    usage.totalTokens ??
    (usage.inputTokens ?? 0) +
      (usage.outputTokens ?? 0) +
      (usage.reasoningTokens ?? 0) +
      (usage.cacheReadTokens ?? 0) +
      (usage.cacheWriteTokens ?? 0)
  );
}

function usageLabel(usage?: SessionUsage | SessionCost | Record<string, unknown>) {
  const u = usage as SessionUsage | undefined;
  const total = totalTokens(u);
  if (!total) return muted("-");
  return `${compactNumber(total)} tokens`;
}

function costTotal(cost?: SessionCost | Record<string, unknown>) {
  const c = cost as SessionCost | undefined;
  if (!c) return 0;
  return (
    (c.inputCost ?? 0) +
    (c.outputCost ?? 0) +
    (c.reasoningCost ?? 0) +
    (c.cacheReadCost ?? 0) +
    (c.cacheWriteCost ?? 0)
  );
}

function costLabel(cost?: SessionCost | Record<string, unknown>) {
  const total = costTotal(cost);
  if (!total) return muted("-");
  return total < 0.01 ? `$${total.toFixed(4)}` : `$${total.toFixed(2)}`;
}

function countLabel(count: number | undefined, label: string) {
  if (!count) return muted("-");
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function contextLabel(context?: SessionContext) {
  if (!context) return muted("-");
  const used = compactNumber(context.usedTokens);
  const total = compactNumber(context.windowTokens);
  return total ? `${context.freePercent}% free (${used}/${total})` : `${context.freePercent}% free`;
}

function gitLabel(git?: { branch?: string; commit?: string; worktree?: string; diff?: string }) {
  if (!git) return "";
  return [git.branch, git.commit, git.worktree, git.diff ? "diff" : ""].filter(Boolean).join(" ");
}

function liveLabel(live?: SessionLiveProcess) {
  if (!live) return "";
  return [live.status || (live.active ? "active" : "inactive"), live.pid ? `pid ${live.pid}` : "", live.command]
    .filter(Boolean)
    .join(" - ");
}

function healthLabel(health?: SessionHealth[]) {
  if (!health?.length) return "";
  return health.map((item) => `${item.severity}:${item.kind}`).join(", ");
}
