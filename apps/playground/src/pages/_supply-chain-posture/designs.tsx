/**
 * The two estate-wide treatments — a plain row list and a repositories × checks
 * matrix. Both answer "which repository, and which control?" across all 32 rows;
 * the per-repository shapes live in `design-rows.tsx`.
 *
 * `PostureRows` is a bare `<table>`, not clicky-ui's `DataTable`. The rows were
 * the part worth keeping; the table around them brought a filter bar, a column
 * menu and a scroll container this artifact never needed, and none of that
 * survives being printed. A `<thead>` also repeats itself across printed pages,
 * which is the whole reason the markup is a table rather than a grid of divs.
 *
 * The cost is real and deliberate: sorting and filtering went with the DataTable.
 * Rows are ordered by repository, which is stable and is what a printed report
 * wants; the page's Scope control still narrows which rows appear.
 */

import { cn } from "@flanksource/clicky-ui";
import { CommitTrendMark, LanguageMark } from "./activity";
import { controlOf, type SupplyChainPosture } from "./fixture";
import {
  NotAssessed,
  OpenFindingsMark,
  OutOfSlaMark,
  RepositoryMark,
  ScoreMark,
} from "./marks";
import { ControlStrip, type DesignProps } from "./shared";
import { chipClass, scoreCategory } from "./tone";

const COLUMNS = [
  "Repository",
  "Code",
  "Commits 30d",
  "OpenSSF",
  "Open findings",
  "Out of SLA",
  "Controls",
];

/* ── A · Posture rows ──────────────────────────────────────────────────────── */

export function PostureRows({ postures }: DesignProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[68rem] border-collapse text-left align-middle">
        <thead>
          <tr className="border-b border-border">
            {COLUMNS.map((column) => (
              <th
                className="px-1.5 pb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {postures.map((posture) => (
            <PostureRow key={posture.repository} posture={posture} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PostureRow({ posture }: { posture: SupplyChainPosture }) {
  return (
    <tr
      className="border-b border-border/60 align-middle break-inside-avoid last:border-0"
      data-posture-row={posture.repository}
    >
      <td className="px-1.5 py-1.5">
        <RepositoryMark
          repository={posture.repository}
          visibility={posture.visibility}
        />
      </td>
      <td className="px-1.5 py-1.5">
        {posture.activity ? (
          <LanguageMark activity={posture.activity} />
        ) : (
          <NotAssessed label="no checkout measured" />
        )}
      </td>
      <td className="px-1.5 py-1.5">
        {posture.activity ? (
          <CommitTrendMark commits={posture.activity.commits} />
        ) : (
          <NotAssessed label="no checkout measured" />
        )}
      </td>
      <td className="px-1.5 py-1.5">
        <ScoreMark
          maxScore={posture.scorecard?.maxScore ?? 10}
          reason={posture.scorecard?.reason}
          score={posture.scorecard?.score ?? null}
        />
      </td>
      <td className="px-1.5 py-1.5">
        {posture.vulnerabilities ? (
          <OpenFindingsMark
            open={posture.vulnerabilities.open}
            total={posture.vulnerabilities.openTotal}
          />
        ) : (
          <NotAssessed label="no posture recorded" />
        )}
      </td>
      <td className="px-1.5 py-1.5">
        {posture.vulnerabilities ? (
          <OutOfSlaMark
            adherence={posture.vulnerabilities.adherence}
            breached={posture.vulnerabilities.breached}
            oldestBreach={posture.vulnerabilities.oldestBreach}
            total={posture.vulnerabilities.breachedTotal}
          />
        ) : (
          <NotAssessed label="no posture recorded" />
        )}
      </td>
      <td className="px-1.5 py-1.5">
        <ControlStrip posture={posture} />
      </td>
    </tr>
  );
}

/* ── B · Control matrix ────────────────────────────────────────────────────── */

/** `OpenSSF:Branch-Protection` → `Branch-Protection` — the catalog title is the tooltip. */
function shortCheckName(controlId: string): string {
  return controlId.slice(controlId.indexOf(":") + 1);
}

/**
 * Repositories down, checks across. A row list shows one repository at a time;
 * only a matrix shows that a required check is failing across the whole estate —
 * which is the finding, not any individual repository's score.
 */
export function ControlMatrix({ postures }: DesignProps) {
  const assessed = postures.filter(({ checks }) => checks.length > 0);
  const controlIds = [
    ...new Set(assessed.flatMap(({ checks }) => checks.map(({ controlId }) => controlId))),
  ].sort();

  if (assessed.length === 0) return <NotAssessed label="no repository is assessed" />;

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-[11px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-2 text-left font-medium text-muted-foreground">
              Repository
            </th>
            {controlIds.map((controlId) => (
              // Fixed height with the overflow clipped: the check's short name fits,
              // and the full catalog title stays on the tooltip rather than spilling
              // into the first data row.
              <th className="h-36 w-7 overflow-hidden align-bottom" key={controlId}>
                <span
                  className="flex h-36 items-center justify-end whitespace-nowrap text-muted-foreground"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  title={controlOf(controlId).title}
                >
                  {shortCheckName(controlId)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assessed.map((posture) => (
            <tr key={posture.repository}>
              <th className="sticky left-0 z-10 bg-card px-2 text-left font-mono text-[11px] font-medium whitespace-nowrap">
                {posture.repository.replace("flanksource/", "")}
              </th>
              {controlIds.map((controlId) => {
                const check = posture.checks.find((entry) => entry.controlId === controlId);
                if (!check) return <td className="size-7" key={controlId} />;

                return (
                  <td key={controlId}>
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded font-mono tabular-nums ring-1 ring-inset",
                        chipClass(scoreCategory(check.score, check.maxScore)),
                      )}
                      data-matrix-cell={`${posture.repository}|${controlId}`}
                      title={`${posture.repository} · ${controlOf(controlId).title} — ${check.reason}`}
                    >
                      {check.score === null ? "–" : check.score}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
