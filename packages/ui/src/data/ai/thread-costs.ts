// Types and pure grouping for the thread cost breakdown served by
// GET <costsApi>/{threadId}/costs. Kept free of React so the grouping rules can
// be unit-tested directly.

/** One (sub-session × model × backend × effort) row of spend. */
export interface ThreadCostModel {
  id: string;
  sessionId: string;
  model: string;
  backend: string;
  effort?: string;
  currency: string;
  modelCallCount: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  reasoningCost: number;
  cacheReadCost: number;
  cacheWriteCost: number;
  /** Resolved total: the provider's billed figure when it reported one, else
   *  the sum of the list-price buckets. */
  totalCost: number;
}

/** One session in the thread: the root, plus a row per subagent. */
export interface ThreadCostAgent {
  id: string;
  sessionId: string;
  parentSessionId?: string | null;
  isRoot: boolean;
  agentType?: string;
  description?: string;
  childCount?: number;
  totalTokens?: number;
  costUsd?: number;
}

export interface ThreadCosts {
  threadId: string;
  totalCostUsd: number;
  byModel: ThreadCostModel[];
  byAgent: ThreadCostAgent[];
}

export interface ThreadCostGroup {
  agent: ThreadCostAgent | undefined;
  rows: ThreadCostModel[];
}

/**
 * True when the thread actually has subagents. Chat threads are flat today, so
 * a single root row is the norm — grouping the table by it would present an
 * empty dimension as though it were data.
 */
export function hasAgentBreakdown(costs: ThreadCosts): boolean {
  return (costs.byAgent?.length ?? 0) > 1;
}

/**
 * Buckets model rows by their session. Falls back to one unlabelled group when
 * the thread has no subagent breakdown, so the panel renders a flat table.
 * Groups follow byAgent order (root first); any row whose session is missing
 * from byAgent still appears, under its own group, rather than vanishing.
 */
export function groupCostsByAgent(costs: ThreadCosts): ThreadCostGroup[] {
  const rows = costs.byModel ?? [];
  if (!hasAgentBreakdown(costs)) return [{ agent: undefined, rows }];

  const bySession = new Map<string, ThreadCostModel[]>();
  for (const row of rows) {
    const bucket = bySession.get(row.sessionId);
    if (bucket) bucket.push(row);
    else bySession.set(row.sessionId, [row]);
  }

  const groups: ThreadCostGroup[] = [];
  for (const agent of costs.byAgent) {
    const sessionRows = bySession.get(agent.sessionId);
    if (!sessionRows?.length) continue;
    bySession.delete(agent.sessionId);
    groups.push({ agent, rows: sessionRows });
  }
  for (const [sessionId, sessionRows] of bySession) {
    groups.push({
      agent: { id: sessionId, sessionId, isRoot: false },
      rows: sessionRows,
    });
  }
  return groups;
}

/** Display name for a session: its task description, then agent type, then id. */
export function agentLabel(agent: ThreadCostAgent): string {
  if (agent.isRoot) return "Main conversation";
  return (
    agent.description?.trim() ||
    agent.agentType?.trim() ||
    `Subagent ${agent.sessionId.slice(0, 8)}`
  );
}
