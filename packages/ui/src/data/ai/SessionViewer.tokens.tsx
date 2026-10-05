import { useContext } from "react";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { UiDotsVertical } from "../../icons";
import type { SessionEvent } from "./SessionViewer.model";
import { SessionTokenContext } from "./use-session-token-sizing";
import { compactTokens, formatCost } from "./session-cost";

export function SessionRowTokens({ event }: { event: SessionEvent }) {
  const sizing = useContext(SessionTokenContext);
  if (!sizing || event.pending) return null;
  const row = sizing.state(event);
  const size = row?.size;
  const title = size ? `${size.source} · ${size.model}. Input ${size.usage.inputTokens ?? 0}, output ${size.usage.outputTokens ?? 0}, reasoning ${size.usage.reasoningTokens ?? 0}. ${size.coverage.framingIncluded ? "Provider framing included. " : ""}Excluded: ${size.coverage.excluded?.join("; ") || "none"}. Content footprint; not historical billed usage.` : undefined;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground" data-row-tokens={event.id}>
      {size && <span aria-label="Calculated row footprint" title={title}>Footprint {size.source === "local-estimate" || size.source === "provider-estimate" ? "~" : ""}{compactTokens(size.totalTokens)} tokens · {size.costUSD !== undefined ? `~${formatCost(size.costUSD)}` : "price unavailable"}{size.coverage.partial ? " · partial" : ""}</span>}
      {row?.pending && <span role="status">Calculating tokens/cost…</span>}
      {row?.error && <span role="alert" className="text-destructive">{row.error}</span>}
      {!event.estimatedCost && (
        <DropdownMenu icon={UiDotsVertical} hideChevron variant="ghost" size="icon" title={`Row options ${event.id}`} menuLabel={`Row options ${event.id}`} items={[{
          label: "Calculate tokens/cost", disabled: Boolean(row?.pending),
          onSelect: () => sizing.calculate([event.id], "provider"),
        }]} />
      )}
    </div>
  );
}
