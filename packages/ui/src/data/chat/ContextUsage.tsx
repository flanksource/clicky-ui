import type { ComponentType } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";

export type ContextUsageProps = {
  usedTokens: number;
  maxTokens: number;
  messageCount?: number;
  modelLabel?: string;
  /** Optional model glyph rendered beside the label. */
  modelIcon?: ComponentType<{ className?: string }>;
  cost?: number;
  className?: string;
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function tone(pct: number): string {
  return pct > 80 ? "text-red-500" : pct > 50 ? "text-amber-500" : "text-emerald-500";
}

function barTone(pct: number): string {
  return pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
}

/** A compact token/cost gauge: a circular percentage indicator that opens a
 *  popover with the model, token usage and estimated cost. Display-only — the
 *  caller feeds the numbers (clicky's backend does not yet emit token usage, so
 *  wiring real values is a follow-on). */
export function ContextUsage({
  usedTokens,
  maxTokens,
  messageCount,
  modelLabel,
  modelIcon: Glyph,
  cost,
  className = "",
}: ContextUsageProps) {
  const pct = maxTokens > 0 ? Math.min(100, Math.round((usedTokens / maxTokens) * 100)) : 0;
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <DropdownMenu
      align="right"
      className={className}
      menuClassName="w-64 p-3"
      trigger={
        <button
          type="button"
          title="Context usage"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {Glyph && <Glyph className="size-3.5 shrink-0" />}
          <svg width="20" height="20" viewBox="0 0 20 20" className={cn("shrink-0", tone(pct))}>
            <circle cx="10" cy="10" r={radius} fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
            <circle
              cx="10"
              cy="10"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
            />
            <text x="10" y="10" textAnchor="middle" dominantBaseline="central" fontSize="6" fill="currentColor" fontWeight="600">
              {pct}
            </text>
          </svg>
        </button>
      }
    >
      {() => (
        <div className="space-y-2.5 text-xs">
          <div className="text-xs font-semibold">Context Usage</div>
          {modelLabel && (
            <div className="flex items-center gap-2">
              {Glyph && <Glyph className="size-4 shrink-0" />}
              <span className="font-medium">{modelLabel}</span>
            </div>
          )}
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-muted-foreground">Tokens</span>
              <span>
                {formatTokens(usedTokens)} / {formatTokens(maxTokens)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", barTone(pct))} style={{ width: `${pct}%` }} />
            </div>
          </div>
          {messageCount != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages</span>
              <span>{messageCount}</span>
            </div>
          )}
          {cost != null && cost > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. cost</span>
              <span>${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </DropdownMenu>
  );
}
