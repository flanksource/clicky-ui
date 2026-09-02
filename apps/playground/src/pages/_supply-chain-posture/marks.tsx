/**
 * The marks every design on this page draws with.
 *
 * Each glyph is the `sc:` token the trust control catalog assigns to that control,
 * carried in the snapshot — never chosen at the call site — and each hue is a
 * `CATEGORY_STYLES` entry. Two designs can therefore disagree about layout but not
 * about what a control is or how it is doing.
 *
 * Icons inherit `currentColor` from the chip around them, which is what makes the
 * whole vocabulary dark-mode correct without a second palette.
 */

import { cn } from "@flanksource/clicky-ui";
import {
  controlOf,
  FINDING_SEVERITIES,
  REMEDIATION_TARGET_DAYS,
  type CatalogControl,
  type ControlState,
  type FindingSeverity,
  type ScorecardCheck,
} from "./fixture";
import { ScIcon } from "./icons";
import { chipClass, scoreCategory, severityChip, STATE_CATEGORY, STATE_LABEL } from "./tone";

const CHIP = "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset";

/**
 * A mark that is only its glyph.
 *
 * Cells carry no prose: a table where every quiet row spells out "none open",
 * "within SLA", "not assessed" is mostly words, and the words are the same on
 * every row that has nothing to report — which buries the rows that do. The
 * wording lives once in the legend, and on the tooltip for anyone hovering.
 */
const MARK = "inline-grid size-6 shrink-0 place-items-center rounded ring-1 ring-inset";

/** One control's observed state — the catalog glyph, coloured by what was seen. */
export function ControlMark({
  controlId,
  state,
  showLabel = true,
}: {
  controlId: string;
  state: ControlState;
  showLabel?: boolean;
}) {
  const control = controlOf(controlId);

  return (
    <span
      className={cn(
        CHIP,
        chipClass(STATE_CATEGORY[state]),
        // A dashed edge says "nothing recorded" even to a reader who cannot tell
        // the grey from the green.
        state === "not_recorded" && "border border-dashed border-current/40",
      )}
      data-control={controlId}
      data-state={state}
      title={`${control.title} — ${STATE_LABEL[state]}`}
    >
      <ScIcon className="size-3.5 shrink-0" icon={control.icon} />
      {showLabel && STATE_LABEL[state]}
    </span>
  );
}

/**
 * One control in the fixed control strip, whatever kind of evidence answers it.
 *
 * A recorded state and a Scorecard result are different kinds of answer, but the
 * strip holds one column position per control across every row, so they have to
 * draw at the same size. Everything else — the control's name, its requirement,
 * the score, the reason — is on the tooltip, and in the legend for print.
 */
export type ControlOutcome = { state: ControlState } | { check: ScorecardCheck | null };

export function ControlPip({
  controlId,
  outcome,
  icon,
}: {
  controlId: string;
  outcome: ControlOutcome;
  /** The strip's glyph for this position, which may override the catalog's. */
  icon?: string | undefined;
}) {
  const control = controlOf(controlId);
  const state = "state" in outcome ? outcome.state : null;
  const check = "state" in outcome ? null : outcome.check;
  const unrecorded = state === "not_recorded" || (state === null && check === null);

  const category =
    state !== null
      ? STATE_CATEGORY[state]
      : check === null
        ? "neutral"
        : scoreCategory(check.score, check.maxScore);

  return (
    <span
      className={cn(
        MARK,
        chipClass(category),
        // The absence of a record reads as an outline, never as a filled state.
        unrecorded && "border border-dashed border-current/50",
      )}
      data-control={controlId}
      data-state={state ?? (check === null ? "not_recorded" : "scored")}
      title={describeOutcome(control, state, check)}
    >
      <ScIcon className="size-4" icon={icon ?? control.icon} />
    </span>
  );
}

function describeOutcome(
  control: CatalogControl,
  state: ControlState | null,
  check: ScorecardCheck | null,
): string {
  if (state !== null) return `${control.title} — ${STATE_LABEL[state]}`;
  if (check === null) return `${control.title} (${control.requirement}) — not assessed`;
  const score = check.score === null ? "inconclusive" : `${check.score}/${check.maxScore}`;
  return `${control.title} (${control.requirement}) — ${score}: ${check.reason}`;
}

/** A scored check as its catalog glyph plus the score out of its maximum. */
export function CheckMark({
  check,
  showTitle = false,
}: {
  check: ScorecardCheck;
  showTitle?: boolean;
}) {
  const control = controlOf(check.controlId);

  return (
    <span
      className={cn(CHIP, chipClass(scoreCategory(check.score, check.maxScore)))}
      data-check={check.controlId}
      data-score={check.score ?? "inconclusive"}
      title={`${control.title} (${control.requirement}) — ${check.reason}`}
    >
      <ScIcon className="size-3.5 shrink-0" icon={control.icon} />
      {showTitle && <span className="truncate">{control.title}</span>}
      <span className="font-mono tabular-nums">
        {check.score === null ? "n/a" : check.score}
      </span>
    </span>
  );
}

/** The aggregate Scorecard result, or the absence of one stated as an absence. */
export function ScoreMark({
  score,
  maxScore,
  reason,
}: {
  score: number | null;
  maxScore: number;
  // Explicitly `| undefined`: the repo runs `exactOptionalPropertyTypes`, and every
  // caller reads this off an optional `scorecard`.
  reason?: string | undefined;
}) {
  if (score === null) return <NotAssessed label="not assessed" />;

  return (
    <span
      className={cn(CHIP, "gap-1.5 px-2", chipClass(scoreCategory(score, maxScore)))}
      data-aggregate={score}
      title={reason}
    >
      <ScIcon className="size-3.5 shrink-0" icon="sc:risk-score" />
      <span className="font-mono text-xs font-semibold tabular-nums">
        {score.toFixed(1)}
      </span>
      <span className="font-mono text-[10px] opacity-60">/{maxScore}</span>
    </span>
  );
}

/**
 * Counts by severity, one chip each, shared by the open-findings and out-of-SLA
 * columns so the two read on the same scale.
 *
 * There is no proportion bar. A bar encodes share-of-total, but the question a
 * reader brings to these columns is "how many criticals?", not "what fraction of
 * this repository's findings are critical" — and every bar being full width made
 * a two-finding repository look like a thirty-finding one.
 */
function SeverityChips({
  counts,
  describe,
}: {
  counts: Record<FindingSeverity, number>;
  describe: (severity: FindingSeverity, count: number) => string;
}) {
  return (
    <>
      {FINDING_SEVERITIES.filter((severity) => counts[severity] > 0).map((severity) => (
        <span
          className={cn(CHIP, "font-mono tabular-nums", severityChip(severity))}
          key={severity}
          title={describe(severity, counts[severity])}
        >
          <ScIcon className="size-3.5" icon={`sc:${severity}`} />
          {counts[severity]}
        </span>
      ))}
    </>
  );
}

/**
 * Everything currently open, whatever its age. A repository with nothing open says
 * so, rather than rendering an empty cell that reads as missing data.
 */
export function OpenFindingsMark({
  open,
  total,
}: {
  open: Record<FindingSeverity, number>;
  total: number;
}) {
  if (total === 0) {
    return (
      <span
        className={cn(MARK, chipClass("control"))}
        data-open-total={0}
        title="Scanned, with nothing currently open"
      >
        <ScIcon className="size-3.5" icon="sc:verified" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1" data-open-total={total}>
      <SeverityChips
        counts={open}
        describe={(severity, count) => `${count} open ${severity}`}
      />
    </span>
  );
}

/**
 * The subset of open findings past their remediation target — the SLA breach.
 *
 * This is the count, not a percentage. An adherence figure flattered a repository
 * with many findings and few breaches, and "87%" reads as a grade when a single
 * overdue critical is a control failure regardless of what share of the backlog it
 * represents. The share is kept on the tooltip for anyone who wants it.
 */
export function OutOfSlaMark({
  breached,
  total,
  adherence,
  oldestBreach,
}: {
  breached: Record<FindingSeverity, number>;
  total: number;
  adherence: number | null;
  oldestBreach: string | null;
}) {
  // Just the check, with no label. Nothing being late is the expected state, and
  // spelling it out on every row gave the quiet answer the same visual weight as a
  // missed target — the one thing this column exists to make obvious.
  if (total === 0) {
    return (
      <span
        className={cn(MARK, chipClass("control"))}
        data-out-of-sla={0}
        title="Every open finding is still inside its remediation target"
      >
        <ScIcon className="size-3.5" icon="sc:verified" />
      </span>
    );
  }

  const share = adherence === null ? null : `${Math.round(adherence * 100)}% of open findings are still within target. `;

  return (
    <span
      className="flex items-center gap-1"
      data-out-of-sla={total}
      title={`${share ?? ""}Oldest breach first detected ${oldestBreach}.`}
    >
      <SeverityChips
        counts={breached}
        describe={(severity, count) =>
          `${count} ${severity} past the ${REMEDIATION_TARGET_DAYS[severity]}-day target`
        }
      />
    </span>
  );
}

/**
 * The register's silence, drawn as silence — never as a passing or failing state.
 *
 * The dashed edge is what carries the meaning once the words are gone: a solid
 * chip is something that was observed, an outline is the absence of a record. The
 * specific `label` stays on the tooltip, because "no SAST assessment" and "no
 * posture recorded" are different silences even though they look alike.
 */
export function NotAssessed({ label }: { label: string }) {
  return (
    <span
      className={cn(MARK, "border border-dashed border-current/50", chipClass("neutral"))}
      data-not-assessed={label}
      title={label}
    >
      <ScIcon className="size-3.5" icon="sc:unverified" />
    </span>
  );
}

/**
 * Repository identity — name and visibility.
 *
 * Languages used to sit on the sub-line and no longer do: the Code badge names
 * the dominant one and counts the rest, so repeating them here spent width on a
 * duplicate and pushed the control strip off the printed page.
 */
export function RepositoryMark({
  repository,
  visibility,
  observedAt,
}: {
  repository: string;
  visibility: string;
  observedAt?: string | null;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md ring-1 ring-inset", chipClass("stage"))}>
        <ScIcon className="size-4" icon="sc:source" />
      </span>
      <span className="min-w-0">
        <a
          className="block truncate font-mono text-xs font-semibold text-foreground hover:underline"
          href={`https://github.com/${repository}`}
          rel="noreferrer"
          target="_blank"
        >
          {repository}
        </a>
        <span className="block truncate text-[10px] text-muted-foreground">
          {visibility}
          {observedAt && ` · observed ${observedAt}`}
        </span>
      </span>
    </span>
  );
}
