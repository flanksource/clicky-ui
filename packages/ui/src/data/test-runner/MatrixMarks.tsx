// Renders the matrix-marks.ts vocabulary: one outcome's glyph, outcome mixes,
// durations, empty cells, the legend, environment chips and the environment
// column header. Props-only, so a live web matrix and a static print template
// draw the same marks; `static` drops animation and links for print.

import type { ReactNode } from "react";
import { UiClock, UiServer } from "../../icons";
import { cn } from "../../lib/utils";
import { ProgressBar } from "../ProgressBar";
import {
  MATRIX_MARKS,
  MATRIX_ORDER,
  MATRIX_PLAN_BAR,
  formatMatrixDuration,
  matrixBarClass,
  type MatrixCounts,
  type MatrixEnvCounts,
  type MatrixMarkKey,
  type MatrixMarkToken,
} from "./matrix-marks";

export type MatrixMarkProps = {
  mark: MatrixMarkKey;
  /** Hover title; "" leaves the glyph untitled where the surrounding element already names it. */
  label?: string;
  className?: string;
  /** Print: never spins. */
  static?: boolean;
};

export function MatrixMark({ mark, label, className, static: isStatic = false }: MatrixMarkProps) {
  const token: MatrixMarkToken = MATRIX_MARKS[mark];
  const Glyph = token.icon;
  return (
    <Glyph
      {...(label === "" ? {} : { title: label ?? token.label })}
      className={cn("size-3.5 shrink-0", token.tone, token.spin && !isStatic && "animate-spin", className)}
      data-mark={mark}
    />
  );
}

export type MatrixMixProps = {
  counts: MatrixCounts;
  unit: "steps" | "plans";
  /** Outcomes drawn even at zero; every other zero count is dropped. */
  always?: readonly MatrixMarkKey[];
  static?: boolean;
};

/** Outcome counts as glyph + number, in matrix order. */
export function MatrixMix({ counts, unit, always = [], static: isStatic = false }: MatrixMixProps) {
  return (
    <span role="group" aria-label={`${unit} by outcome`} className="flex shrink-0 items-center gap-2 text-xs tabular-nums" data-mix={unit}>
      {MATRIX_ORDER.filter((key) => (counts[key] ?? 0) > 0 || always.includes(key)).map((key) => {
        const text = `${counts[key] ?? 0} ${MATRIX_MARKS[key].label} ${unit}`;
        return (
          <span key={key} role="img" aria-label={text} title={text} className={cn("inline-flex items-center gap-0.5", MATRIX_MARKS[key].tone)} data-mix-outcome={key}>
            <MatrixMark mark={key} label="" static={isStatic} />
            {counts[key] ?? 0}
          </span>
        );
      })}
    </span>
  );
}

export type MatrixElapsedProps = {
  ms: number;
  /** Still counting: drawn blue and titled "elapsed so far". */
  running: boolean;
  /** Prefix a clock glyph. */
  clock?: boolean;
};

export function MatrixElapsed({ ms, running, clock = false }: MatrixElapsedProps) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] tabular-nums", running ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground")}
      title={running ? "elapsed so far" : "total duration"}
      data-duration=""
    >
      {clock && <UiClock className="size-3" aria-hidden="true" />}
      {formatMatrixDuration(ms)}
    </span>
  );
}

export type EmptyMatrixCellProps = {
  /** The cell outcome: "queued", "absent", or "error" with detail "never started". Anything else throws. */
  outcome: string;
  /** Why a cell has no run: "never started". */
  detail?: string;
  /** Hover title of the cell. */
  title: string;
  /** The glyph alone (sub-step rows), its meaning on hover. */
  bare?: boolean;
};

/**
 * A plan with no run in an environment: pending while queued, error when it
 * never started, hollow when not part of that run.
 */
export function EmptyMatrixCell({ outcome, detail, title, bare = false }: EmptyMatrixCellProps) {
  const neverStarted = detail === "never started";
  if (!neverStarted && outcome !== "queued" && outcome !== "absent") throw new Error(`unexpected empty matrix cell ${outcome}: ${title}`);
  const mark: MatrixMarkKey = neverStarted ? "error" : outcome === "queued" ? "pending" : "absent";
  const label = neverStarted ? "never started" : MATRIX_MARKS[mark].label;
  return (
    <span title={title} className="flex h-5 min-w-0 items-center gap-1.5 text-xs" data-empty-cell={mark}>
      <MatrixMark mark={mark} label={label} />
      {!bare && <span className={MATRIX_MARKS[mark].tone}>{label}</span>}
    </span>
  );
}

export type MatrixLegendProps = { static?: boolean };

export function MatrixLegend({ static: isStatic = false }: MatrixLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" data-batch-legend="">
      {MATRIX_ORDER.map((key) => {
        const token: MatrixMarkToken = MATRIX_MARKS[key];
        return (
          <span key={key} className="inline-flex items-center gap-1" data-legend-mark={key}>
            <MatrixMark mark={key} label="" static={isStatic} />
            {token.legend ?? token.label}
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1">
        <UiClock className="size-3" aria-hidden="true" />
        elapsed · total duration
      </span>
    </div>
  );
}

export type EnvChipProps = { context: string; className?: string };

/** A context name, always in the same chip, so an environment never reads as a plan or a status. */
export function EnvChip({ context, className }: EnvChipProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[11px] text-foreground", className)}
      data-env-chip={context}
    >
      <UiServer className="size-3 text-muted-foreground" aria-hidden="true" />
      {context}
    </span>
  );
}

const HEADER_GRID = "grid min-w-48 grid-rows-[auto_auto_auto] gap-1.5";
const HEADER_ROW = "flex h-5 min-w-0 items-center gap-2";

export type MatrixEnvHeaderProps = {
  context: string;
  counts: MatrixEnvCounts;
  durationMs: number;
  /** The environment's run is still running: its elapsed time is still counting. */
  running: boolean;
  /** Wraps the chip, e.g. in the host router's link to the member run. Never called when static. */
  renderChip?: (chip: ReactNode) => ReactNode;
  /** Drawn beside the chip, e.g. how often the member was retried. */
  aside?: ReactNode;
  static?: boolean;
};

/**
 * One environment's column head in three fixed rows: its chip, the plans'
 * progress with the elapsed time, and the plan verdict naming its units.
 */
export function MatrixEnvHeader({ context, counts, durationMs, running, renderChip, aside, static: isStatic = false }: MatrixEnvHeaderProps) {
  const done = counts.passed + counts.warned + counts.failed + counts.error;
  const chip = <EnvChip context={context} />;
  return (
    <div className={HEADER_GRID} data-env-header={context}>
      <div className={HEADER_ROW}>
        {renderChip && !isStatic ? renderChip(chip) : chip}
        {aside}
      </div>
      <div className={HEADER_ROW} title={`${done} of ${counts.total} plans finished`} data-env-progress="">
        <span className="min-w-0 flex-1">
          <ProgressBar
            total={counts.total}
            height="h-1.5"
            segments={MATRIX_PLAN_BAR.map((key) => ({ count: counts[key], color: matrixBarClass(key, isStatic), label: `${MATRIX_MARKS[key].label} plans` }))}
          />
        </span>
        <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-foreground">
          {done}/{counts.total} plans
        </span>
        <MatrixElapsed ms={durationMs} running={running} clock />
      </div>
      <div className={HEADER_ROW} data-env-verdict="">
        <MatrixMix
          counts={{ passed: counts.passed, warned: counts.warned, running: counts.running, pending: counts.queued, failed: counts.failed, error: counts.error }}
          unit="plans"
          always={["failed"]}
          static={isStatic}
        />
      </div>
    </div>
  );
}

export type MatrixUnavailableEnvHeaderProps = { context: string };

/** An environment whose member run did not load, in the same three rows as MatrixEnvHeader. */
export function MatrixUnavailableEnvHeader({ context }: MatrixUnavailableEnvHeaderProps) {
  return (
    <div className={HEADER_GRID} data-env-header={context}>
      <div className={HEADER_ROW}>
        <EnvChip context={context} />
      </div>
      <div className={`${HEADER_ROW} text-[11px] font-medium ${MATRIX_MARKS.error.tone}`}>
        <MatrixMark mark="error" label="" />
        did not load
      </div>
      <div className={HEADER_ROW} aria-hidden="true" />
    </div>
  );
}
