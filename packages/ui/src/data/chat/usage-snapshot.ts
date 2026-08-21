import type { ChatMessageMetadata, ChatUsageSummary } from "./types";

/**
 * Builds the usage snapshot a chat surfaces (gauge, hover card, config panel)
 * from the last settled assistant turn's metadata.
 *
 * The cost precedence matters: `threadCostUsd` is the conversation's running
 * total, while `cost` is only the turn that just finished. Preferring the
 * cumulative figure is what makes the meter report what the conversation has
 * actually spent — on a multi-turn thread the two differ by roughly the number
 * of turns taken. Backends that do not report a thread total still degrade to
 * the per-turn value rather than showing nothing.
 *
 * Token fields stay per-turn; the whole-conversation breakdown is served
 * separately by the thread costs endpoint.
 */
export function usageSnapshotFromMetadata(
  metadata: ChatMessageMetadata,
  options: {
    contextWindow?: number | undefined;
    modelLabel?: string | undefined;
    messageCount: number;
  },
): ChatUsageSummary {
  const cost =
    metadata.threadCostUsd ?? metadata.costBreakdown?.totalUsd ?? metadata.cost;
  return {
    usedTokens: metadata.contextTokens ?? metadata.usage?.totalTokens ?? 0,
    maxTokens: options.contextWindow ?? 0,
    messageCount: options.messageCount,
    ...(cost != null ? { cost } : {}),
    ...(metadata.usage ? { usage: metadata.usage } : {}),
    ...(metadata.costBreakdown ? { costBreakdown: metadata.costBreakdown } : {}),
    ...(metadata.backend !== undefined ? { backend: metadata.backend } : {}),
    ...(metadata.executionMode !== undefined
      ? { executionMode: metadata.executionMode }
      : {}),
    ...(metadata.model !== undefined ? { model: metadata.model } : {}),
    ...(metadata.model !== undefined && options.modelLabel
      ? { modelLabel: options.modelLabel }
      : {}),
    ...(metadata.captainSessionId !== undefined
      ? { captainSessionId: metadata.captainSessionId }
      : {}),
    ...(metadata.providerSessionId !== undefined
      ? { providerSessionId: metadata.providerSessionId }
      : {}),
    ...(metadata.threadId !== undefined ? { threadId: metadata.threadId } : {}),
    ...(metadata.turnId !== undefined ? { turnId: metadata.turnId } : {}),
    ...(metadata.success !== undefined ? { success: metadata.success } : {}),
    ...(metadata.interrupted !== undefined
      ? { interrupted: metadata.interrupted }
      : {}),
  };
}
