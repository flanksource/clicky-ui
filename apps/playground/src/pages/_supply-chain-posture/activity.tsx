/**
 * Code volume and commit activity — the two badges that describe the repository
 * rather than judge it.
 *
 * **Both are monochrome, and that is the point.** Every other mark on this page
 * spends colour on control state, where a hue is a claim: green is a control
 * observed working, red one observed failing, grey the absence of a record. A
 * repository being large, or quiet, is neither good nor bad — colouring it would
 * assert a verdict the register never made, and would spend the reader's
 * attention on the one column that does not carry a finding. Shades of the
 * current text colour keep them legible, dark-mode correct and print-safe while
 * staying visibly outside the state vocabulary.
 *
 * They are context for reading the control columns: an unmaintained repository
 * with no scanning is a different problem from a repository shipping daily with
 * no scanning, and the control columns alone cannot tell the two apart.
 */

import { cn } from "@flanksource/clicky-ui";
import type { CommitActivity, RepositoryActivity } from "./fixture";
import { ScIcon } from "./icons";

/** `194959` → `195K`. Exact counts stay on the tooltip. */
function compact(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

const exact = (count: number) => count.toLocaleString("en-US");

/**
 * A two-part badge — `[ Go | 200K ]` — with a rule between the halves.
 *
 * Used by the language mark alone. The split earns its border there because the
 * two halves are different kinds of thing: a name and a quantity. The commit
 * mark is already a sparkline followed by its own count, and boxing that added a
 * second border around a shape that reads perfectly well without one.
 */
function SplitBadge({
  label,
  value,
  title,
  ...rest
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  title: string;
} & Record<`data-${string}`, string | number>) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] leading-none"
      title={title}
      {...rest}
    >
      <span className="flex items-center">{label}</span>
      <span aria-hidden="true" className="h-3 w-px shrink-0 bg-border" />
      <span className="font-mono tabular-nums">{value}</span>
    </span>
  );
}

/**
 * The dominant language as `[ Go | 200K ]`, with a count of the rest beside it.
 *
 * Only the leading language gets a badge. Every repository here has one language
 * that dominates, the column shares a sheet with nine control marks, and a row of
 * four badges would push the controls off the page — which it did. The full
 * per-language breakdown is on the tooltip, and `+2` says how much is not shown
 * so the badge is never mistaken for the whole story.
 */
export function LanguageMark({ activity }: { activity: RepositoryActivity }) {
  const { languages, otherCode, totalCode } = activity;
  const [dominant, ...rest] = languages;
  const remainder = rest.length + (otherCode > 0 ? 1 : 0);

  const breakdown = [
    ...languages.map(({ name, code }) => `${name} ${exact(code)}`),
    ...(otherCode > 0 ? [`other ${exact(otherCode)}`] : []),
  ].join(" · ");

  const title = `${breakdown} lines of code, ${exact(totalCode)} in total — measured from the ${activity.source} at ${activity.revision} on ${activity.observedAt}`;

  return (
    <span className="flex items-center gap-1.5" data-code-total={totalCode}>
      <SplitBadge
        data-language={dominant?.name ?? "none"}
        label={dominant?.name ?? "none"}
        title={title}
        value={compact(totalCode)}
      />
      {remainder > 0 && (
        <span className="font-mono text-[10px] text-muted-foreground" title={breakdown}>
          +{remainder}
        </span>
      )}
    </span>
  );
}

/**
 * Commits over the window as a sparkline, with the total and which way it moved.
 *
 * The bars matter as much as the total: thirty commits in one afternoon and one a
 * day for a month are the same number and a different repository.
 */
export function CommitTrendMark({ commits }: { commits: CommitActivity }) {
  const peak = Math.max(...commits.buckets, 1);
  const direction =
    commits.total === commits.previousTotal
      ? "level"
      : commits.total > commits.previousTotal
        ? "up"
        : "down";

  return (
    <span
      className="flex items-center gap-2"
      data-commit-trend={direction}
      data-commits={commits.total}
      title={`${commits.total} commits in the last ${commits.windowDays} days, against ${commits.previousTotal} in the ${commits.windowDays} before — bars are ${commits.windowDays / commits.buckets.length}-day periods, oldest first`}
    >
      <span className="flex h-4 w-12 shrink-0 items-end gap-px">
        {commits.buckets.map((count, index) => (
          <span
            className={cn(
              "flex-1 rounded-t-[1px] bg-current",
              count === 0 ? "opacity-20" : "opacity-70",
            )}
            // Bucket position is the identity here; there is nothing else to key on.
            key={index}
            // A non-empty bucket keeps a visible floor, so one commit never
            // renders as none.
            style={{ height: count === 0 ? "2px" : `${Math.max(20, (count / peak) * 100)}%` }}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] tabular-nums">{commits.total}</span>
      {direction !== "level" && (
        <ScIcon className="size-3.5 opacity-70" icon={`sc:trend-${direction}`} />
      )}
    </span>
  );
}
