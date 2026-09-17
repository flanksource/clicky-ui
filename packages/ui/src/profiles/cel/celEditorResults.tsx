import { Badge } from "../../data/Badge";
import { Button } from "../../components/button";
import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { UiArrowRight, UiSparkles, UiWarningTriangle } from "../../icons";
import { explainCelError, type CelCoverage, type CelResult } from "./celExpression";

/**
 * What the expression made of the rows, in badges.
 *
 * A predicate's true and false are both values, so the coverage count would
 * call every row "evaluated" — which says nothing about which rows it selects.
 */
export function Tally({
  found,
  results,
  predicate,
}: {
  found: CelCoverage;
  results: CelResult[];
  predicate?: boolean | undefined;
}) {
  const matched = results.filter((result) => result.value === true).length;
  const missed = results.filter((result) => result.value === false).length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {predicate ? (
        <>
          <Badge tone="success" variant="soft" size="md">
            {matched} true
          </Badge>
          <Badge tone="neutral" variant="soft" size="md">
            {missed} false
          </Badge>
        </>
      ) : (
        <Badge tone="success" variant="soft" size="md">
          {found.ok} evaluated
        </Badge>
      )}
      {found.empty > 0 && (
        <Badge tone="warning" variant="soft" size="md">
          {found.empty} empty
        </Badge>
      )}
      {found.failed > 0 && (
        <Badge tone="danger" variant="soft" size="md" icon={UiWarningTriangle}>
          {found.failed} failed
        </Badge>
      )}
    </div>
  );
}

/**
 * One row's result, in one line.
 *
 * `String()` on a list of objects is a row of `[object Object]`, which is the
 * same non-answer the scope panel used to give — an expression that returns
 * structure has to show its structure to be judged at all.
 */
function preview(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ResultStrip({
  result,
  label,
  pending,
  draft,
  onFix,
}: {
  result: { value?: unknown; type?: string; error?: string } | undefined;
  label: string;
  pending: boolean;
  draft: string;
  onFix: (next: string) => void;
}) {
  if (result?.error) {
    // The engine reports in the vocabulary of the Go library underneath it and
    // interpolates the whole offending value, so what it says is translated
    // and what it quotes is trimmed.
    const failure = explainCelError(result.error, draft);
    return (
      <div className="space-y-1 rounded border border-destructive/40 bg-destructive/[0.06] p-2">
        <div className="text-[11px] font-medium text-destructive">{label} — evaluation failed</div>
        <p className="text-[11px] text-destructive">{failure.message}</p>
        {failure.fix && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onFix(failure.fix!)}>
            <Icon icon={UiSparkles} className="text-[12px]" />
            Fix it
          </Button>
        )}
        <code
          className="block break-all font-mono text-[10px] text-muted-foreground"
          title={result.error}
        >
          {failure.raw}
        </code>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-2 rounded border border-border bg-muted/40 p-2">
      <span className="text-[11px] font-medium">{label}</span>
      <Icon icon={UiArrowRight} className="text-[11px] text-muted-foreground" />
      <code
        className={cn(
          "min-w-0 flex-1 truncate font-mono text-[11px]",
          result?.value === null || result?.value === undefined ? "text-muted-foreground" : "",
        )}
      >
        {pending ? "…" : preview(result?.value)}
      </code>
      {result?.type && <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">{result.type}</span>}
    </div>
  );
}

/**
 * Every row as one cell, coloured by what the expression made of it. A
 * predicate's `false` is drawn apart from `true`: both evaluated, but only one
 * selected the row.
 */
export function Coverage({
  results,
  rowCount,
  focused,
  onFocus,
  rowLabel,
  predicate,
}: {
  results: CelResult[];
  rowCount: number;
  focused: number;
  onFocus: (index: number) => void;
  rowLabel?: ((index: number) => string) | undefined;
  predicate?: boolean | undefined;
}) {
  if (rowCount === 0) return null;
  const byIndex = new Map(results.map((result) => [result.index, result]));

  return (
    <div className="space-y-1">
      <span className="text-[11px] text-muted-foreground">{predicate ? "Matches" : "Sample coverage"}</span>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: rowCount }, (_, index) => {
          const result = byIndex.get(index);
          const failed = Boolean(result?.error);
          const empty = !failed && (result?.value === null || result?.value === undefined);
          const unselected = predicate && result?.value === false;
          const label = rowLabel?.(index);
          return (
            <button
              key={index}
              type="button"
              aria-label={label ?? `Row ${index + 1}`}
              title={label}
              onClick={() => onFocus(index)}
              className={cn(
                "h-5 w-5 rounded-sm border text-[9px] tabular-nums",
                failed
                  ? "border-destructive/50 bg-destructive/20 text-destructive"
                  : empty
                    ? "border-border bg-muted text-muted-foreground"
                    : unselected
                      ? "border-border bg-background text-muted-foreground"
                      : "border-green-600/40 bg-green-500/20 text-green-800 [[data-theme=dark]_&]:text-green-300",
                index === focused && "ring-2 ring-primary ring-offset-1",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
