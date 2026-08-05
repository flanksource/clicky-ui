import { describe, expect, it } from "vitest";
import {
  agentLabel,
  groupCostsByAgent,
  hasAgentBreakdown,
  type ThreadCostModel,
  type ThreadCosts,
} from "./thread-costs";

const ROOT = "6f58a8f6-40ef-46b2-938b-78427f25eaba";

function modelRow(
  overrides: Partial<ThreadCostModel> & Pick<ThreadCostModel, "id" | "sessionId">,
): ThreadCostModel {
  return {
    model: "claude-opus-5",
    backend: "anthropic",
    currency: "USD",
    modelCallCount: 1,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    inputCost: 0,
    outputCost: 0,
    reasoningCost: 0,
    cacheReadCost: 0,
    cacheWriteCost: 0,
    totalCost: 0,
    ...overrides,
  };
}

// The real shape of thread 6f58a8f6: one conversation billed across two
// backends at very different rates, which is exactly what the per-model split
// exists to surface.
const twoBackendThread: ThreadCosts = {
  threadId: ROOT,
  totalCostUsd: 7.358646,
  byModel: [
    modelRow({
      id: `${ROOT}:claude-opus-5:anthropic:medium:USD`,
      sessionId: ROOT,
      backend: "anthropic",
      modelCallCount: 4,
      totalTokens: 575809,
      totalCost: 3.063585,
    }),
    modelRow({
      id: `${ROOT}:claude-opus-5:claude-agent:medium:USD`,
      sessionId: ROOT,
      backend: "claude-agent",
      modelCallCount: 5,
      totalTokens: 3325611,
      cacheReadTokens: 3108284,
      totalCost: 4.295061,
    }),
  ],
  byAgent: [{ id: ROOT, sessionId: ROOT, isRoot: true, costUsd: 7.358646 }],
};

describe("hasAgentBreakdown", () => {
  it("is false for a flat thread, so the panel does not render an empty dimension", () => {
    expect(hasAgentBreakdown(twoBackendThread)).toBe(false);
  });

  it("is true once the thread has a subagent", () => {
    expect(
      hasAgentBreakdown({
        ...twoBackendThread,
        byAgent: [
          ...twoBackendThread.byAgent,
          { id: "sub", sessionId: "sub", isRoot: false },
        ],
      }),
    ).toBe(true);
  });
});

describe("groupCostsByAgent", () => {
  it("returns one unlabelled group for a flat thread", () => {
    const groups = groupCostsByAgent(twoBackendThread);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.agent).toBeUndefined();
    expect(groups[0]?.rows.map((r) => r.backend)).toEqual([
      "anthropic",
      "claude-agent",
    ]);
  });

  it("splits rows per sub-session, root first", () => {
    const withSubagent: ThreadCosts = {
      ...twoBackendThread,
      byAgent: [
        { id: ROOT, sessionId: ROOT, isRoot: true, costUsd: 3.06 },
        {
          id: "sub-1",
          sessionId: "sub-1",
          isRoot: false,
          agentType: "Explore",
          costUsd: 4.29,
        },
      ],
      byModel: [
        modelRow({ id: "r", sessionId: ROOT, totalCost: 3.06 }),
        modelRow({ id: "s", sessionId: "sub-1", totalCost: 4.29 }),
      ],
    };

    const groups = groupCostsByAgent(withSubagent);

    expect(groups.map((g) => g.agent?.sessionId)).toEqual([ROOT, "sub-1"]);
    expect(groups.map((g) => g.rows.length)).toEqual([1, 1]);
  });

  it("keeps rows whose session is absent from byAgent rather than dropping spend", () => {
    const orphaned: ThreadCosts = {
      ...twoBackendThread,
      byAgent: [
        { id: ROOT, sessionId: ROOT, isRoot: true },
        { id: "sub-1", sessionId: "sub-1", isRoot: false },
      ],
      byModel: [
        modelRow({ id: "r", sessionId: ROOT }),
        modelRow({ id: "ghost", sessionId: "unlisted", totalCost: 1.5 }),
      ],
    };

    const groups = groupCostsByAgent(orphaned);

    expect(groups.flatMap((g) => g.rows.map((r) => r.id))).toContain("ghost");
  });
});

describe("agentLabel", () => {
  it("names the root conversation", () => {
    expect(agentLabel({ id: ROOT, sessionId: ROOT, isRoot: true })).toBe(
      "Main conversation",
    );
  });

  it("prefers a subagent's task description over its type", () => {
    expect(
      agentLabel({
        id: "s",
        sessionId: "s",
        isRoot: false,
        agentType: "Explore",
        description: "Map the cost surfaces",
      }),
    ).toBe("Map the cost surfaces");
  });

  it("falls back to a short session id when a subagent has neither", () => {
    expect(
      agentLabel({ id: "s", sessionId: "abcdef1234567890", isRoot: false }),
    ).toBe("Subagent abcdef12");
  });
});
