// The glyph vocabulary of a bulk test matrix (plans × environments): plan
// cells, sub-steps, the environment header's verdict row and the legend all
// read MATRIX_MARKS, in this order. The live web matrix and its printed report
// draw from this one table. MatrixMarks.tsx renders it; this file holds only
// the tokens and pure helpers (react/only-export-components).

import {
  UiCircleOutline,
  UiCircleX,
  UiHourglass,
  UiLoader,
  UiPass,
  UiProhibit,
  UiSkipForward,
  UiWarningCircle,
  UiWarningTriangleFilled,
  type IconComponent,
} from "../../icons";

export type MatrixMarkToken = {
  icon: IconComponent;
  tone: string;
  /** Progress-bar fill; absent for states a bar leaves as its track. */
  bar?: string;
  label: string;
  legend?: string;
  /** Whether a sub-step spells the outcome out beside its glyph. */
  attention: boolean;
  spin?: boolean;
};

export const MATRIX_MARKS = {
  passed: { icon: UiPass, tone: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", label: "passed", attention: false },
  warned: { icon: UiWarningCircle, tone: "text-amber-600 dark:text-amber-400", bar: "bg-amber-400", label: "warned", attention: true },
  skipped: { icon: UiSkipForward, tone: "text-slate-400 dark:text-slate-500", bar: "bg-slate-300 dark:bg-slate-600", label: "skipped", attention: false },
  running: { icon: UiLoader, tone: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500 animate-pulse", label: "running", attention: true, spin: true },
  aborted: { icon: UiProhibit, tone: "text-red-400 dark:text-red-300", bar: "bg-red-300 dark:bg-red-800", label: "aborted", attention: true },
  failed: { icon: UiCircleX, tone: "text-red-600 dark:text-red-400", bar: "bg-red-600", label: "failed", attention: true },
  error: { icon: UiWarningTriangleFilled, tone: "text-red-600 dark:text-red-400", bar: "bg-red-800", label: "error", legend: "error · never started", attention: true },
  pending: { icon: UiHourglass, tone: "text-muted-foreground", label: "pending", legend: "pending · queued", attention: false },
  absent: { icon: UiCircleOutline, tone: "text-muted-foreground/60", label: "not in this run", attention: false },
} satisfies Record<string, MatrixMarkToken>;

export type MatrixMarkKey = keyof typeof MATRIX_MARKS;
export type MatrixCounts = Partial<Record<MatrixMarkKey, number>>;

export const MATRIX_ORDER = Object.keys(MATRIX_MARKS) as readonly MatrixMarkKey[];

/** The plan outcomes an environment header's progress bar fills, left to right. */
export const MATRIX_PLAN_BAR = ["passed", "warned", "failed", "error", "running"] as const;

/** One environment's plan totals, as its matrix column header reads them. */
export type MatrixEnvCounts = {
  passed: number;
  warned: number;
  failed: number;
  error: number;
  running: number;
  queued: number;
  total: number;
};

export function matrixMarkKey(outcome: string): MatrixMarkKey {
  if (!(outcome in MATRIX_MARKS)) throw new Error(`matrix has no mark for outcome "${outcome}"`);
  return outcome as MatrixMarkKey;
}

/**
 * Whether a mix holds only the outcome a mark beside it already shows, so
 * drawing both would repeat the glyph.
 */
export function repeatsMark(counts: MatrixCounts, mark: MatrixMarkKey): boolean {
  const nonZero = MATRIX_ORDER.filter((key) => (counts[key] ?? 0) > 0);
  return nonZero.length === 1 && nonZero[0] === mark;
}

/** A mark's progress-bar fill; static (print) drops its animate-* classes. */
export function matrixBarClass(mark: (typeof MATRIX_PLAN_BAR)[number], isStatic: boolean): string {
  const bar: string = MATRIX_MARKS[mark].bar;
  return isStatic ? bar.split(" ").filter((c) => !c.startsWith("animate-")).join(" ") : bar;
}

/** The matrix's one duration format: 42s, 4m 12s, 1h 03m. */
export function formatMatrixDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}
