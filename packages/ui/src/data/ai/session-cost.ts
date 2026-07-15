import type { SessionCost, SessionUsage } from "./SessionViewer.unified";

// Pure token/cost math shared by the session surfaces (the context meter's
// hover popover and the SessionInspector Costs tab) so both read identically.
// The string formatters live in lib/tokens so the chat-layer meter can share
// them without importing this ai-layer module.
export { compactTokens, formatCost } from "../../lib/tokens";

/** Total tokens for a usage/cost record — the explicit total, else the sum of
 *  input + output + reasoning + cache read/write. */
export function tokenTotal(usage?: SessionUsage | SessionCost): number {
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

/** Total cost — the sum of the per-bucket costs (input/output/reasoning/cache). */
export function costTotal(cost?: SessionCost): number {
  if (!cost) return 0;
  return (
    (cost.inputCost ?? 0) +
    (cost.outputCost ?? 0) +
    (cost.reasoningCost ?? 0) +
    (cost.cacheReadCost ?? 0) +
    (cost.cacheWriteCost ?? 0)
  );
}

