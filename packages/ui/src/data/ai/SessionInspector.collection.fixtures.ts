import type { SessionCollectionInput } from "./SessionInspector.collection";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

/** A one-turn assistant session whose answer text and cost identify it. */
export function collectionSession(
  id: string,
  model: string,
  text: string,
  cost: number,
): UnifiedSessionInput {
  const turnId = `${id}-turn`;
  return {
    id,
    provider: "openai",
    model,
    messages: [
      {
        id: `${id}-message`,
        role: "assistant",
        turnId,
        parts: [{ type: "text", text }],
        provenance: {
          sessionId: id,
          agentId: id,
          timestamp: "2026-07-15T10:00:00Z",
        },
      },
    ],
    turns: [
      {
        id: turnId,
        index: 1,
        model,
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
        cost: { model, inputCost: cost },
      },
    ],
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    cost: { model, inputCost: cost },
    agents: [{ id, isRoot: true }],
  };
}

export const COLLECTION: SessionCollectionInput = {
  kind: "session-collection",
  id: "comparison",
  currentSessionId: "primary",
  sessions: [
    {
      id: "primary",
      label: "Primary run",
      mode: "headless",
      session: collectionSession("primary", "gpt-5", "primary answer", 0.01),
    },
    {
      id: "parallel",
      label: "Parallel run",
      mode: "api",
      session: collectionSession(
        "parallel",
        "gpt-5-mini",
        "parallel answer",
        0.02,
      ),
    },
  ],
};
