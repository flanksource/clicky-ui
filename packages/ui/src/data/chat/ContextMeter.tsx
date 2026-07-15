import { cn } from "../../lib/utils";
import { compactTokens, formatCost } from "../../lib/tokens";
import type { StaticIconComponent } from "../Icon";
import { HoverCard } from "../../overlay/HoverCard";

export type ContextMeterMode = "bar" | "gauge";

export type ContextMeterTokens = {
  input?: number | undefined;
  output?: number | undefined;
  reasoning?: number | undefined;
  cacheRead?: number | undefined;
  cacheWrite?: number | undefined;
  total?: number | undefined;
};

export type ContextMeterCost = {
  input?: number | undefined;
  output?: number | undefined;
  reasoning?: number | undefined;
  cacheRead?: number | undefined;
  cacheWrite?: number | undefined;
  total?: number | undefined;
};

export type ContextMeterBudget = {
  used?: number | undefined;
  total?: number | undefined;
  remaining?: number | undefined;
};

export type ContextMeterProps = {
  /** Trigger shape: a compact `bar` (session header) or a circular `gauge`
   *  (chat toolbar). Both open the same hover popover. */
  mode?: ContextMeterMode;
  /** Share of the context window used, 0–100 — drives the fill and tone. */
  usedPercent: number;
  /** Context-window tokens shown in the popover. */
  usedTokens?: number | undefined;
  windowTokens?: number | undefined;
  /** Message count shown in the popover (chat). */
  messageCount?: number | undefined;
  /** Model id/label and its brand glyph. */
  model?: string | undefined;
  modelIcon?: StaticIconComponent | undefined;
  /** Per-bucket token counts for the popover breakdown. */
  tokens?: ContextMeterTokens | undefined;
  /** Per-bucket costs (USD) for the popover breakdown. */
  cost?: ContextMeterCost | undefined;
  budget?: ContextMeterBudget | undefined;
  className?: string | undefined;
};

function barTone(pct: number): string {
  return pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
}

function ringTone(pct: number): string {
  return pct > 80 ? "text-red-500" : pct > 50 ? "text-amber-500" : "text-emerald-500";
}

function textTone(pct: number): string {
  return pct > 80
    ? "text-red-600 [[data-theme=dark]_&]:text-red-400"
    : pct > 50
      ? "text-amber-600 [[data-theme=dark]_&]:text-amber-400"
      : "text-emerald-600 [[data-theme=dark]_&]:text-emerald-400";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function anyPositive(...values: (number | undefined)[]): boolean {
  return values.some((v) => v != null && v > 0);
}

type BucketRow = { label: string; tokens?: number | undefined; cost?: number | undefined };

/** One row per token/cost bucket, kept only when it carries a token or cost
 *  value. Cache stays split into read and write on both axes. */
function bucketRows(tokens?: ContextMeterTokens, cost?: ContextMeterCost): BucketRow[] {
  const rows: BucketRow[] = [
    { label: "Input", tokens: tokens?.input, cost: cost?.input },
    { label: "Output", tokens: tokens?.output, cost: cost?.output },
    { label: "Reasoning", tokens: tokens?.reasoning, cost: cost?.reasoning },
    { label: "Cache read", tokens: tokens?.cacheRead, cost: cost?.cacheRead },
    { label: "Cache write", tokens: tokens?.cacheWrite, cost: cost?.cacheWrite },
  ];
  return rows.filter((row) => (row.tokens ?? 0) > 0 || (row.cost ?? 0) > 0);
}

function UsageTable({
  rows,
  totalTokens,
  totalCost,
  showTokens,
  showCost,
}: {
  rows: BucketRow[];
  totalTokens: number;
  totalCost: number;
  showTokens: boolean;
  showCost: boolean;
}) {
  const numCell = "px-1 py-0.5 text-right tabular-nums";
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
          <th className="px-1 py-0.5 text-left font-medium" />
          {showTokens && <th className="px-1 py-0.5 text-right font-medium">Tokens</th>}
          {showCost && <th className="px-1 py-0.5 text-right font-medium">Cost</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="px-1 py-0.5 text-left text-muted-foreground">{row.label}</td>
            {showTokens && (
              <td className={numCell}>
                {row.tokens ? compactTokens(row.tokens) : <span className="text-muted-foreground/50">—</span>}
              </td>
            )}
            {showCost && (
              <td className={numCell}>
                {row.cost ? formatCost(row.cost) : <span className="text-muted-foreground/50">—</span>}
              </td>
            )}
          </tr>
        ))}
        <tr className="border-t border-border font-medium">
          <td className="px-1 py-0.5 text-left">Total</td>
          {showTokens && <td className={numCell}>{compactTokens(totalTokens)}</td>}
          {showCost && <td className={numCell}>{formatCost(totalCost)}</td>}
        </tr>
      </tbody>
    </table>
  );
}

/** Unified context-window meter. Renders as a compact progress `bar` or a
 *  circular `gauge`; hovering or focusing it opens a popover with the model, the
 *  context-window breakdown, per-bucket token usage and the cost + budget
 *  detail. Domain-agnostic — callers feed plain numbers. */
export function ContextMeter({
  mode = "bar",
  usedPercent,
  usedTokens,
  windowTokens,
  messageCount,
  model,
  modelIcon: Glyph,
  tokens,
  cost,
  budget,
  className,
}: ContextMeterProps) {
  const pct = Math.min(100, Math.max(0, Math.round(usedPercent)));
  const totalTokens = tokens?.total ?? 0;
  const totalCost = cost?.total ?? 0;

  const trigger =
    mode === "gauge" ? (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          className,
        )}
        aria-label={`Context ${pct}% used`}
      >
        {Glyph && <Glyph className="size-3.5 shrink-0" />}
        <svg width="20" height="20" viewBox="0 0 20 20" className={cn("shrink-0", ringTone(pct))}>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={2 * Math.PI * 8}
            strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 8}
            strokeLinecap="round"
            transform="rotate(-90 10 10)"
          />
          <text x="10" y="10" textAnchor="middle" dominantBaseline="central" fontSize="6" fill="currentColor" fontWeight="600">
            {pct}
          </text>
        </svg>
      </span>
    ) : (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground",
          className,
        )}
        aria-label={`Context ${pct}% used`}
      >
        <span className="shrink-0">ctx</span>
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <span className={cn("block h-full rounded-full transition-all", barTone(pct))} style={{ width: `${pct}%` }} />
        </span>
        <span className={cn("shrink-0 font-medium tabular-nums", textTone(pct))}>{pct}%</span>
      </span>
    );

  return (
    <HoverCard trigger={trigger} placement="bottom" cardClassName="w-72 p-3">
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Context usage</span>
          <span className={cn("font-semibold tabular-nums", textTone(pct))}>{pct}%</span>
        </div>

        {model && (
          <div className="flex items-center gap-2 border-b border-border pb-2">
            {Glyph && <Glyph className="size-4 shrink-0" />}
            <span className="truncate font-medium" title={model}>
              {model}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", barTone(pct))} style={{ width: `${pct}%` }} />
          </div>
          {windowTokens ? (
            <>
              <Row label="Window" value={`${compactTokens(usedTokens ?? 0)} / ${compactTokens(windowTokens)}`} />
              <Row label="Free" value={`${100 - pct}%`} />
            </>
          ) : (
            <Row label="Used" value={`${pct}%`} />
          )}
          {messageCount != null ? <Row label="Messages" value={String(messageCount)} /> : null}
        </div>

        {(totalTokens > 0 || totalCost > 0 || budget) && (
          <div className="space-y-1.5 border-t border-border pt-2">
            {(totalTokens > 0 || totalCost > 0) && (
              <UsageTable
                rows={bucketRows(tokens, cost)}
                totalTokens={totalTokens}
                totalCost={totalCost}
                showTokens={totalTokens > 0}
                showCost={totalCost > 0}
              />
            )}
            {budget?.total != null && budget.total > 0 ? (
              <Row label="Budget" value={`${formatCost(budget.used ?? 0)} / ${formatCost(budget.total)}`} />
            ) : budget?.remaining != null ? (
              <Row label="Budget left" value={formatCost(budget.remaining)} />
            ) : anyPositive(budget?.used) ? (
              <Row label="Budget" value={formatCost(budget?.used ?? 0)} />
            ) : null}
          </div>
        )}
      </div>
    </HoverCard>
  );
}
