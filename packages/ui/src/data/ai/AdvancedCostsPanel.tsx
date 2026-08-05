import { useEffect, useState } from "react";
import { compactTokens, formatCost } from "../../lib/tokens";
import type { ThreadCostAgent, ThreadCostModel, ThreadCosts } from "./thread-costs";
import { agentLabel, groupCostsByAgent, hasAgentBreakdown } from "./thread-costs";

export type AdvancedCostsPanelProps = {
  /** Endpoint serving the thread's cost breakdown, e.g. `/api/chat/sessions`. */
  costsApi?: string | undefined;
  /** Thread whose costs to show. No thread means nothing has been spent yet. */
  threadId?: string | undefined;
};

/**
 * Thread cost breakdown: what each model/backend actually cost across the whole
 * conversation, grouped by sub-session when the thread has any.
 *
 * This is deliberately server-fed rather than accumulated from stream metadata.
 * A chat thread can switch backends mid-conversation — an API turn and an agent
 * turn bill at very different rates — and only the server sees every turn.
 */
export function AdvancedCostsPanel({
  costsApi,
  threadId,
}: AdvancedCostsPanelProps) {
  const [costs, setCosts] = useState<ThreadCosts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!costsApi || !threadId) {
      setCosts(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`${costsApi}/${threadId}/costs`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await costsErrorText(response));
        return (await response.json()) as ThreadCosts;
      })
      .then((payload) => setCosts(payload))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [costsApi, threadId]);

  if (!threadId) return <CostsMessage>No conversation yet.</CostsMessage>;
  if (loading && !costs) return <CostsMessage>Loading costs…</CostsMessage>;
  if (error) return <CostsMessage tone="error">{error}</CostsMessage>;
  if (!costs?.byModel?.length)
    return <CostsMessage>No model calls recorded for this conversation.</CostsMessage>;

  const groups = groupCostsByAgent(costs);
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversation total
        </div>
        <div className="font-mono text-sm font-semibold">
          {formatCost(costs.totalCostUsd ?? 0)}
        </div>
      </div>
      {groups.map((group) => (
        <CostGroup
          key={group.agent?.id ?? "all"}
          agent={group.agent}
          rows={group.rows}
          showHeader={hasAgentBreakdown(costs)}
        />
      ))}
    </div>
  );
}

function CostGroup({
  agent,
  rows,
  showHeader,
}: {
  agent: ThreadCostAgent | undefined;
  rows: ThreadCostModel[];
  showHeader: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {showHeader && agent ? (
        <div className="flex items-baseline justify-between gap-3 px-0.5">
          <span className="truncate text-xs font-medium">{agentLabel(agent)}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatCost(agent.costUsd ?? 0)}
          </span>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full min-w-[520px] border-collapse text-left text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <Th>Model</Th>
              <Th>Backend</Th>
              <Th>Calls</Th>
              <Th>Tokens</Th>
              <Th>Cache</Th>
              <Th>Cost</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.model || <span className="text-muted-foreground">unknown</span>}</Td>
                <Td>
                  <span className="text-muted-foreground">{row.backend}</span>
                  {row.effort ? (
                    <span className="text-muted-foreground"> · {row.effort}</span>
                  ) : null}
                </Td>
                <Td>{row.modelCallCount}</Td>
                <Td>{compactTokens(row.totalTokens)}</Td>
                <Td>
                  {compactTokens(
                    (row.cacheReadTokens ?? 0) + (row.cacheWriteTokens ?? 0),
                  )}
                </Td>
                <Td>{formatCost(row.totalCost ?? 0)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CostsMessage({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "error";
}) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
          : "p-3 text-xs text-muted-foreground"
      }
    >
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1.5 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-2 py-1.5 font-mono">{children}</td>;
}

async function costsErrorText(response: Response): Promise<string> {
  const body = (await response.text()).trim();
  return body || `Cost breakdown unavailable (${response.status})`;
}
