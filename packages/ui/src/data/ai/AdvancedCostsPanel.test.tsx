import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdvancedCostsPanel } from "./AdvancedCostsPanel";
import type { ThreadCosts } from "./thread-costs";

const ROOT = "6f58a8f6-40ef-46b2-938b-78427f25eaba";

// Thread 6f58a8f6 as the server reports it: one conversation billed across two
// backends, $7.36 total — the number the panel exists to show, against the
// $0.73 single turn the old UI displayed.
const payload: ThreadCosts = {
  threadId: ROOT,
  totalCostUsd: 7.358646,
  byModel: [
    {
      id: "a",
      sessionId: ROOT,
      model: "claude-opus-5",
      backend: "anthropic",
      effort: "medium",
      currency: "USD",
      modelCallCount: 4,
      inputTokens: 566582,
      outputTokens: 9227,
      reasoningTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 575809,
      inputCost: 0,
      outputCost: 3.063585,
      reasoningCost: 0,
      cacheReadCost: 0,
      cacheWriteCost: 0,
      totalCost: 3.063585,
    },
    {
      id: "b",
      sessionId: ROOT,
      model: "claude-opus-5",
      backend: "claude-agent",
      effort: "medium",
      currency: "USD",
      modelCallCount: 5,
      inputTokens: 74,
      outputTokens: 31502,
      reasoningTokens: 0,
      cacheReadTokens: 3108284,
      cacheWriteTokens: 185751,
      totalTokens: 3325611,
      inputCost: 0,
      outputCost: 4.295061,
      reasoningCost: 0,
      cacheReadCost: 0,
      cacheWriteCost: 0,
      totalCost: 4.295061,
    },
  ],
  byAgent: [{ id: ROOT, sessionId: ROOT, isRoot: true, costUsd: 7.358646 }],
};

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AdvancedCostsPanel", () => {
  it("shows the conversation total and a row per model/backend", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => payload });

    render(<AdvancedCostsPanel costsApi="/api/chat/sessions" threadId={ROOT} />);

    expect(await screen.findByText("$7.36")).toBeInTheDocument();
    expect(screen.getByText("anthropic")).toBeInTheDocument();
    expect(screen.getByText("claude-agent")).toBeInTheDocument();
    expect(screen.getByText("$3.06")).toBeInTheDocument();
    expect(screen.getByText("$4.30")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/chat/sessions/${ROOT}/costs`,
      expect.anything(),
    );
  });

  it("does not render a per-agent header for a flat thread", async () => {
    stubFetch({ ok: true, json: async () => payload });

    render(<AdvancedCostsPanel costsApi="/api/chat/sessions" threadId={ROOT} />);

    await screen.findByText("$7.36");
    expect(screen.queryByText("Main conversation")).not.toBeInTheDocument();
  });

  it("groups by sub-session once the thread has subagents", async () => {
    stubFetch({
      ok: true,
      json: async () => ({
        ...payload,
        byAgent: [
          { id: ROOT, sessionId: ROOT, isRoot: true, costUsd: 3.063585 },
          {
            id: "sub-1",
            sessionId: "sub-1",
            isRoot: false,
            description: "Audit the cost surfaces",
            costUsd: 4.295061,
          },
        ],
        byModel: [
          payload.byModel[0],
          { ...payload.byModel[1], sessionId: "sub-1" },
        ],
      }),
    });

    render(<AdvancedCostsPanel costsApi="/api/chat/sessions" threadId={ROOT} />);

    expect(await screen.findByText("Main conversation")).toBeInTheDocument();
    expect(screen.getByText("Audit the cost surfaces")).toBeInTheDocument();
  });

  it("reports a server error instead of implying the conversation was free", async () => {
    stubFetch({
      ok: false,
      status: 501,
      text: async () => "thread cost breakdown requires a database-backed thread store",
    });

    render(<AdvancedCostsPanel costsApi="/api/chat/sessions" threadId={ROOT} />);

    await waitFor(() =>
      expect(
        screen.getByText(
          "thread cost breakdown requires a database-backed thread store",
        ),
      ).toBeInTheDocument(),
    );
  });

  it("says so when there is no conversation yet rather than fetching", () => {
    const fetchMock = stubFetch({ ok: true, json: async () => payload });

    render(<AdvancedCostsPanel costsApi="/api/chat/sessions" />);

    expect(screen.getByText("No conversation yet.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
