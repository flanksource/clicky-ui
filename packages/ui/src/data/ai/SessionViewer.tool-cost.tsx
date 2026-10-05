import type { SessionEvent } from "./SessionViewer.model";
import { compactTokens, costTotal, formatCost } from "./session-cost";
import type { SessionCost } from "./SessionViewer.unified";
import {
  UiArrowDown,
  UiArrowUp,
  UiBrain,
  UiCoins,
  UiDatabaseDown,
  UiDatabaseUp,
} from "../../icons";

const TOKEN_BUCKETS = [
  ["inputTokens", "In", "Input", UiArrowUp],
  ["outputTokens", "Out", "Output", UiArrowDown],
  ["reasoningTokens", "Reasoning", "Reasoning", UiBrain],
  ["cacheReadTokens", "Cache read", "Cache read", UiDatabaseDown],
  ["cacheWriteTokens", "Cache write", "Cache write", UiDatabaseUp],
] as const;

export function EstimatedToolCost({
  events,
  detailed = false,
}: {
  events: SessionEvent[];
  detailed?: boolean;
}) {
  const estimates = events.flatMap((event) =>
    event.estimatedCost ? [event.estimatedCost] : [],
  );
  if (!estimates.length) {
    return (
      <span
        aria-label={
          detailed ? "Estimated tool cost details" : "Estimate unavailable"
        }
        title="Estimate unavailable"
        className="shrink-0 text-[11px] text-muted-foreground"
      >
        {detailed ? "Estimate unavailable" : "—"}
      </span>
    );
  }
  const costs: SessionCost[] = estimates.map((estimate) => estimate.cost);
  const total = costs.reduce((sum, cost) => sum + costTotal(cost), 0);
  const sharedCalls = estimates[0]?.sharedCalls;
  const allocation =
    events.length === 1
      ? `Model request shared equally across ${sharedCalls} tool call${sharedCalls === 1 ? "" : "s"}.`
      : `Combined estimate for ${estimates.length} calls; each model request is shared equally across its tool calls.`;
  const description = `${allocation} Includes conversation context and generating the calls. Reading tool results is accounted for in subsequent model requests. Estimated cost in USD.`;
  if (!detailed) {
    const cacheReadTokens = costs.reduce((sum, cost) => sum + (cost.cacheReadTokens ?? 0), 0);
    const cacheReadDescription = `Cache read delta: ${cacheReadTokens.toLocaleString("en-US")} tokens`;
    return (
      <span
        role="group"
        aria-label="Estimated tool cost"
        title={description}
        className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground"
      >
        <UiCoins className="size-3 shrink-0" />
        <span>{total > 0 ? `~${formatCost(total)}` : "—"}</span>
        {cacheReadTokens > 0 && (
          <span
            role="group"
            aria-label={cacheReadDescription}
            title={cacheReadDescription}
            className="ml-1 inline-flex items-center gap-0.5"
          >
            <UiDatabaseDown className="size-3 shrink-0" />
            <span>+{compactTokens(cacheReadTokens)}</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <div
      role="group"
      aria-label="Estimated tool cost details"
      title={description}
      className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-1.5 text-[11px] tabular-nums text-muted-foreground"
    >
      <span
        role="group"
        aria-label={
          total > 0
            ? `Estimated cost: ${formatCost(total)} USD`
            : "Cost unavailable"
        }
        className="inline-flex items-center gap-1"
      >
        <UiCoins className="size-3.5 shrink-0" />
        <span>Est.</span>
        <span className="font-semibold text-foreground">
          {total > 0 ? `~${formatCost(total)}` : "Cost unavailable"}
        </span>
        {total > 0 && <span className="text-[9px] font-medium">USD</span>}
      </span>
      {TOKEN_BUCKETS.map(([key, label, name, BucketIcon]) => {
        const tokens = costs.reduce((sum, cost) => sum + (cost[key] ?? 0), 0);
        const description = `${name}: ${tokens.toLocaleString("en-US")} tokens`;
        return tokens > 0 ? (
          <span
            key={key}
            role="group"
            aria-label={description}
            title={description}
            className="inline-flex items-center gap-1 whitespace-nowrap"
          >
            <BucketIcon className="size-3.5 shrink-0" />
            <span>
              {label}{" "}
              <span className="font-medium text-foreground">
                {compactTokens(tokens)}
              </span>
            </span>
          </span>
        ) : null;
      })}
      {estimates.length < events.length && (
        <span>{events.length - estimates.length} unavailable</span>
      )}
    </div>
  );
}
