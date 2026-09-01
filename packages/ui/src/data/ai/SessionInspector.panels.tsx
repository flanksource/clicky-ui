import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { CodeBlock } from "../CodeBlock";
import { KeyValueList, type KeyValueListItem } from "../KeyValueList";
import {
  compactTokens,
  costTotal,
  formatCost,
  tokenTotal,
} from "./session-cost";
import { durationLabel, formatDate } from "./SessionInspector.model";
import { SessionFilesPanel } from "./SessionInspector.files";
import { SessionPlanPanel } from "./SessionInspector.plan";
import type { SessionInput } from "./SessionViewer.model";
import type {
  SessionApprovalStats,
  SessionCost,
  SessionHealth,
  SessionLiveProcess,
  SessionUsage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";
import type { SessionInspectorTab } from "./SessionInspector";

export function SessionInspectorPanel({
  tab,
  detail,
  session,
  onPlanChange,
}: {
  tab: SessionInspectorTab;
  detail: UnifiedSessionInput | undefined;
  session: SessionInput;
  onPlanChange?: (content: string) => void;
}) {
  switch (tab) {
    case "files":
      return <SessionFilesPanel files={detail?.files} />;
    case "plan":
      return (
        <SessionPlanPanel
          plan={detail?.plan}
          {...(onPlanChange ? { onChange: onPlanChange } : {})}
        />
      );
    case "approvals":
      return <ApprovalsPanel approvals={detail?.approvals} />;
    case "costs":
      return (
        <CostsPanel
          usage={detail?.usage}
          cost={detail?.cost}
          toolCosts={detail?.toolCosts}
        />
      );
    case "metadata":
      return <MetadataPanel session={detail} />;
    case "raw":
      return <RawPanel value={detail ?? session} />;
    default:
      return null;
  }
}

function ApprovalsPanel({
  approvals,
}: {
  approvals: SessionApprovalStats | undefined;
}) {
  if (
    !approvals ||
    (!approvals.approved && !approvals.denied && !approvals.denials?.length)
  ) {
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
  if (!usage && !cost && !toolCosts?.length)
    return <EmptyState>No cost metadata.</EmptyState>;
  return (
    <div className="space-y-density-4">
      <KeyValueList
        items={[
          kv("Tokens", usageLabel(usage ?? cost)),
          kv("Cost", costLabel(cost)),
          kv("Input", compactTokens((usage ?? cost)?.inputTokens)),
          kv("Output", compactTokens((usage ?? cost)?.outputTokens)),
          kv("Reasoning", compactTokens((usage ?? cost)?.reasoningTokens)),
          kv("Cache Read", compactTokens((usage ?? cost)?.cacheReadTokens)),
          kv("Cache Write", compactTokens((usage ?? cost)?.cacheWriteTokens)),
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
              <Td>{compactTokens(tokenTotal(entry))}</Td>
              <Td>{compactTokens(entry.inputTokens)}</Td>
              <Td>{compactTokens(entry.outputTokens)}</Td>
              <Td>
                {compactTokens(
                  (entry.cacheReadTokens ?? 0) + (entry.cacheWriteTokens ?? 0)
                )}
              </Td>
              <Td>{costLabel(entry)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetadataPanel({
  session,
}: {
  session: UnifiedSessionInput | undefined;
}) {
  if (!session) return <EmptyState>No unified session metadata.</EmptyState>;
  const identity: KeyValueListItem[] = [
    kv("ID", session.id),
    kv("Source", session.source),
    kv("Project", session.project),
    kv("CWD", session.cwd),
    kv("History", session.historyFile),
    kv("Model", session.model),
    kv("Provider", session.provider),
    kv("Mode", session.modelMode),
    kv("Effort", session.reasoningEffort),
    kv("Version", session.version),
    kv("Git", gitLabel(session.git)),
    kv("Started", formatDate(session.startedAt)),
    kv("Ended", formatDate(session.endedAt)),
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
  return (
    <CodeBlock
      language="json"
      source={jsonSource(value)}
      copyable
      jsonDefaultOpenDepth={1}
    />
  );
}

function JsonSection({ title, value }: { title: string; value: unknown }) {
  if (
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  )
    return null;
  return (
    <section>
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      <CodeBlock
        language="json"
        source={jsonSource(value)}
        jsonDefaultOpenDepth={1}
      />
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
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      <ul className="divide-y divide-border rounded-md border border-border">
        {rows.map((row) => (
          <li key={row.key} className="px-density-3 py-density-2">
            <div className="text-sm font-medium">{row.title || row.key}</div>
            {row.detail ? (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {row.detail}
              </div>
            ) : null}
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

function EmptyState({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border text-sm text-muted-foreground",
        compact ? "p-density-3" : "p-density-6 text-center"
      )}
    >
      {children}
    </div>
  );
}

function kv(
  label: ReactNode,
  value: ReactNode | undefined | null
): KeyValueListItem {
  return {
    key: String(label),
    label,
    value:
      value === undefined || value === null || value === ""
        ? muted("-")
        : value,
    hidden: value === undefined || value === null || value === "",
  };
}

function muted(value: ReactNode) {
  return <span className="text-muted-foreground">{value}</span>;
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

function usageLabel(usage?: SessionUsage | SessionCost) {
  const total = tokenTotal(usage);
  return total ? `${compactTokens(total)} tokens` : muted("-");
}

function costLabel(cost?: SessionCost) {
  const total = costTotal(cost);
  return total ? formatCost(total) : muted("-");
}

function gitLabel(git?: {
  branch?: string;
  commit?: string;
  worktree?: string;
  diff?: string;
}) {
  if (!git) return "";
  return [git.branch, git.commit, git.worktree, git.diff ? "diff" : ""]
    .filter(Boolean)
    .join(" ");
}

function liveLabel(live?: SessionLiveProcess) {
  if (!live) return "";
  return [
    live.status || (live.active ? "active" : "inactive"),
    live.pid ? `pid ${live.pid}` : "",
    live.command,
  ]
    .filter(Boolean)
    .join(" - ");
}

function healthLabel(health?: SessionHealth[]) {
  return (
    health?.map((item) => `${item.severity}:${item.kind}`).join(", ") ?? ""
  );
}
