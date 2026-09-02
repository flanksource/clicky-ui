/**
 * The three per-repository treatments — a card, a severity-ranked row, and a
 * one-line signal — ordered here from most to least vertical cost.
 *
 * All three share `marks.tsx` with the estate-wide designs, so what is under
 * comparison is density alone.
 */

import { cn } from "@flanksource/clicky-ui";
import { CommitTrendMark, LanguageMark } from "./activity";
import { type FindingSeverity, type SupplyChainPosture } from "./fixture";
import { ScIcon } from "./icons";
import {
  CheckMark,
  NotAssessed,
  OpenFindingsMark,
  OutOfSlaMark,
  RepositoryMark,
  ScoreMark,
} from "./marks";
import { ControlStrip, type DesignProps } from "./shared";
import { chipClass, SEVERITY_CATEGORY } from "./tone";

/* ── C · Posture card ──────────────────────────────────────────────────────── */

export function PostureCards({ postures }: DesignProps) {
  return (
    <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
      {postures.map((posture) => (
        <PostureCard key={posture.repository} posture={posture} />
      ))}
    </div>
  );
}

export function PostureCard({ posture }: { posture: SupplyChainPosture }) {
  return (
    <article
      className="grid gap-2.5 rounded-lg border border-border bg-card p-4"
      data-posture-card={posture.repository}
    >
      <header className="flex items-start justify-between gap-3">
        <RepositoryMark
          observedAt={posture.observedAt}
          repository={posture.repository}
          visibility={posture.visibility}
        />
        <ScoreMark
          maxScore={posture.scorecard?.maxScore ?? 10}
          reason={posture.scorecard?.reason}
          score={posture.scorecard?.score ?? null}
        />
      </header>

      <CardRow label="Open findings">
        {posture.vulnerabilities ? (
          <OpenFindingsMark
            open={posture.vulnerabilities.open}
            total={posture.vulnerabilities.openTotal}
          />
        ) : (
          <NotAssessed label="no vulnerability posture recorded" />
        )}
      </CardRow>

      <CardRow label="Out of SLA">
        {posture.vulnerabilities ? (
          <OutOfSlaMark
            adherence={posture.vulnerabilities.adherence}
            breached={posture.vulnerabilities.breached}
            oldestBreach={posture.vulnerabilities.oldestBreach}
            total={posture.vulnerabilities.breachedTotal}
          />
        ) : (
          <NotAssessed label="no vulnerability posture recorded" />
        )}
      </CardRow>

      <CardRow label="Controls">
        <ControlStrip posture={posture} />
      </CardRow>

      <CardRow label="Code · commits">
        {posture.activity ? (
          <span className="flex flex-wrap items-center gap-4">
            <LanguageMark activity={posture.activity} />
            <CommitTrendMark commits={posture.activity.commits} />
          </span>
        ) : (
          <NotAssessed label="no checkout measured" />
        )}
      </CardRow>

      {posture.checks.length > 0 && (
        <CardRow label="Checks">
          <span className="flex flex-wrap items-center gap-1">
            {posture.checks.map((check) => (
              <CheckMark check={check} key={check.controlId} />
            ))}
          </span>
        </CardRow>
      )}
    </article>
  );
}

function CardRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3 border-t border-border pt-2.5">
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/* ── D · Severity rail row ─────────────────────────────────────────────────── */

/**
 * A list row with the worst open severity as a colour rail down the left edge.
 * Severity leads at a glance; everything else stays on one quiet line.
 */
export function SeverityRailRows({ postures }: DesignProps) {
  return (
    <div className="grid gap-1.5">
      {postures.map((posture) => {
        const worst = worstSeverity(posture);

        return (
          <article
            className="flex items-center gap-3 rounded-lg border border-border bg-card py-2 pr-3 pl-0"
            data-rail-row={posture.repository}
            key={posture.repository}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-9 w-1 shrink-0 rounded-r",
                chipClass(worst ? SEVERITY_CATEGORY[worst] : "neutral"),
              )}
              data-rail={worst ?? "none"}
            />
            <span className="min-w-64 flex-1">
              <RepositoryMark
                repository={posture.repository}
                visibility={posture.visibility}
              />
            </span>
            {posture.vulnerabilities ? (
              <OpenFindingsMark
                open={posture.vulnerabilities.open}
                total={posture.vulnerabilities.openTotal}
              />
            ) : (
              <NotAssessed label="no posture" />
            )}
            {posture.vulnerabilities && (
              <OutOfSlaMark
                adherence={posture.vulnerabilities.adherence}
                breached={posture.vulnerabilities.breached}
                oldestBreach={posture.vulnerabilities.oldestBreach}
                total={posture.vulnerabilities.breachedTotal}
              />
            )}
            <ScoreMark
              maxScore={posture.scorecard?.maxScore ?? 10}
              reason={posture.scorecard?.reason}
              score={posture.scorecard?.score ?? null}
            />
          </article>
        );
      })}
    </div>
  );
}

/* ── E · Compact signal line ───────────────────────────────────────────────── */

/**
 * One line per repository, marks only. The densest way to sweep the estate for a
 * grey pip — a control nobody has assessed — which the table hides behind a
 * column the reader has to think to sort by.
 */
export function CompactSignalRows({ postures }: DesignProps) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
      {postures.map((posture) => (
        <div
          className="flex items-center gap-3 bg-card px-3 py-1.5"
          data-signal-row={posture.repository}
          key={posture.repository}
        >
          <ScIcon className="size-3.5 shrink-0 text-muted-foreground" icon="sc:source" />
          <a
            className="w-56 shrink-0 truncate font-mono text-[11px] font-medium text-foreground hover:underline"
            href={`https://github.com/${posture.repository}`}
            rel="noreferrer"
            target="_blank"
          >
            {posture.repository.replace("flanksource/", "")}
          </a>
          <ScoreMark
            maxScore={posture.scorecard?.maxScore ?? 10}
            reason={posture.scorecard?.reason}
            score={posture.scorecard?.score ?? null}
          />
          <ControlStrip posture={posture} />
          <span className="ml-auto flex items-center gap-1">
            {posture.vulnerabilities ? (
              <OpenFindingsMark
                open={posture.vulnerabilities.open}
                total={posture.vulnerabilities.openTotal}
              />
            ) : (
              <NotAssessed label="no posture" />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The most severe open finding, which is what the rail colours by. */
function worstSeverity(posture: SupplyChainPosture): FindingSeverity | null {
  const open = posture.vulnerabilities?.open;
  if (!open) return null;
  return (
    (["critical", "high", "medium", "low"] as const).find((severity) => open[severity] > 0) ?? null
  );
}
