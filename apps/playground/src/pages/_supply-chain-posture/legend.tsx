/**
 * The key to the report, written for the person reading the report — an auditor,
 * a reviewer, an engineer picking up someone else's repository — not for whoever
 * maintains this page. It ships inside the printed document, so it explains what
 * the marks mean rather than which token or palette produced them.
 *
 * It appears twice: at the top of the page and at the top of the printed report.
 * A legend at the bottom is a legend nobody reads — by the time a reader has
 * scrolled past thirty rows of chips they have already guessed, and a wrong guess
 * about grey is the expensive one, because grey means *nothing was observed* and
 * never means fine.
 *
 * The remediation SLA leads, because every other number on the page is measured
 * against it and it is the one thing a reader cannot infer from the marks.
 */

import { cn } from "@flanksource/clicky-ui";
import { CommitTrendMark, LanguageMark } from "./activity";
import {
  ACTIVITY_OBSERVED_AT,
  controlOf,
  FINDING_SEVERITIES,
  IMMEDIATE_TARGET_CONDITION,
  POSTURES,
  REMEDIATION_TARGET_DAYS,
  SECRET_SCANNING,
  type FindingSeverity,
} from "./fixture";
import { ScIcon } from "./icons";
import { ControlMark, NotAssessed, OpenFindingsMark, OutOfSlaMark, ScoreMark } from "./marks";
import { CONTROL_STRIP, stripIcon } from "./shared";
import { chipClass, severityChip } from "./tone";

const CHIP =
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset";

/**
 * A real row's figures rather than invented ones, so the key shows the badge
 * exactly as the table draws it — and so no number in this document is made up.
 */
const SAMPLE_ACTIVITY = POSTURES.find(({ activity }) => activity !== null)?.activity ?? null;

/** The zero states are drawn from the real components, not described in prose. */
const NO_FINDINGS: Record<FindingSeverity, number> = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

export function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <section
      // Deliberately breakable. Held together as one block it outgrew the space
      // left on the first sheet and jumped whole to the next, leaving a page
      // empty under the title; each row avoids breaking instead, so the key
      // fills the page it starts on and carries over intact.
      className={cn(
        "rounded-xl border border-border bg-card",
        compact ? "space-y-2 p-3" : "space-y-3 p-4",
      )}
      data-legend
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="m-0 text-sm font-bold tracking-tight">How to read this report</h2>
        <p className="m-0 text-[11px] leading-relaxed text-muted-foreground">
          One row per repository. Every mark records what was observed at the date on this
          report — a repository with no mark has not been assessed, which is not the same as
          having passed.
        </p>
      </header>

      <LegendRow
        note={
          <>
            Time to fix, counted from <strong>first detection</strong> — the day the scanner
            first reported the finding, not the day anyone triaged it. {capitalise(
              IMMEDIATE_TARGET_CONDITION,
            )}{" "}
            must be revoked immediately and is out of SLA the moment it is found.
          </>
        }
        title="Remediation SLA"
      >
        {FINDING_SEVERITIES.map((severity) => (
          <span className={cn(CHIP, severityChip(severity))} key={severity}>
            <ScIcon className="size-3.5" icon={`sc:${severity}`} />
            {severity}
            <span className="font-mono tabular-nums opacity-80">
              {REMEDIATION_TARGET_DAYS[severity]}d
            </span>
          </span>
        ))}
      </LegendRow>

      <LegendRow
        note={
          <>
            <strong>Open findings</strong> counts everything still open, at any age.{" "}
            <strong>Out of SLA</strong> counts only the ones past the target above, so any count
            there is a missed commitment. Cells carry marks rather than words: a green check means
            the repository was scanned and has nothing to report in that column, and the dashed
            grey outline means it was never assessed — an important difference, because only the
            first one is good news.
          </>
        }
        title="Findings"
      >
        <OpenFindingsMark open={NO_FINDINGS} total={0} />
        <OutOfSlaMark adherence={null} breached={NO_FINDINGS} oldestBreach={null} total={0} />
        <NotAssessed label="not assessed" />
      </LegendRow>

      <LegendRow
        note="The Controls column holds these nine, always in this order and always in the same position, so a gap can be found by scanning straight down. A control missing from a repository still occupies its slot — drawn as an outline, not left blank."
        stack
        title="Controls"
      >
        {CONTROL_STRIP.map((entry, index) => (
          <span
            className="grid grid-cols-[1rem_1.5rem_1fr] items-center gap-2 text-[11px]"
            key={entry.id}
          >
            <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
              {index + 1}
            </span>
            <span className={cn("grid size-6 place-items-center rounded", chipClass("neutral"))}>
              <ScIcon className="size-4" icon={stripIcon(entry)} />
            </span>
            <span className="text-muted-foreground">
              {controlOf(entry.id).title}
              {controlOf(entry.id).requirement !== "required" && (
                <span className="opacity-60"> ({controlOf(entry.id).requirement})</span>
              )}
            </span>
          </span>
        ))}
      </LegendRow>

      <LegendRow
        note="Green is a control observed on, red is one observed off, and a dashed grey chip is the absence of a record. Grey is never a pass — it marks work still to do, not a control found compliant."
        title="Control state"
      >
        <ControlMark controlId={SECRET_SCANNING} state="enabled" />
        <ControlMark controlId={SECRET_SCANNING} state="disabled" />
        <ControlMark controlId={SECRET_SCANNING} state="not_recorded" />
      </LegendRow>

      <LegendRow
        note={
          <>
            <strong>Code</strong> is the language mix as a share of the repository, with total
            lines beside it; <strong>Commits 30d</strong> is the count over the last thirty days
            as six five-day bars, with an arrow against the thirty days before. Both are drawn in
            grey on purpose — they describe a repository rather than judge it, and neither is a
            control result. They come from the repositories themselves rather than from the
            register, measured {ACTIVITY_OBSERVED_AT}; a repository that could not be measured is
            marked unassessed rather than shown as empty.
          </>
        }
        title="Code & activity"
      >
        {SAMPLE_ACTIVITY && (
          <>
            <LanguageMark activity={SAMPLE_ACTIVITY} />
            <CommitTrendMark commits={SAMPLE_ACTIVITY.commits} />
          </>
        )}
      </LegendRow>

      <LegendRow
        note="OpenSSF Scorecard rates each repository out of 10; individual checks carry their own score. A check the tool could not conclude on shows grey rather than zero, because an absent subject — no releases to sign, no dependencies to pin — is not a failure."
        title="OpenSSF score"
      >
        {[10, 7, 3, 0, null].map((score) => (
          <ScoreMark
            key={String(score)}
            maxScore={10}
            reason={score === null ? "inconclusive" : `${score}/10`}
            score={score}
          />
        ))}
      </LegendRow>
    </section>
  );
}

function capitalise(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * `stack` lists the entries one per line instead of flowing them across. The
 * control key uses it so the legend reads top-to-bottom in the same order the
 * strip reads left-to-right — a wrapped row broke that correspondence, because
 * where the wrap fell depended on the page width rather than on the controls.
 */
function LegendRow({
  title,
  note,
  children,
  stack = false,
}: {
  title: string;
  note: React.ReactNode;
  children: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3 border-t border-border pt-2.5 break-inside-avoid">
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </span>
      <div className="grid min-w-0 gap-1.5">
        <div className={cn(stack ? "grid gap-1" : "flex flex-wrap items-center gap-x-4 gap-y-2")}>
          {children}
        </div>
        <p className="m-0 text-[11px] leading-relaxed text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}
