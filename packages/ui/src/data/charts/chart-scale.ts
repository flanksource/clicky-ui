import { CHART_FONT_SIZE } from "./chart-palette";

/**
 * Average glyph advance at the chart font size. There is no layout engine in a
 * static render, so text is measured by estimate; 0.6em over-estimates typical
 * sans-serif digits and letters, which errs toward thinning rather than overlap.
 */
export const CHAR_WIDTH = CHART_FONT_SIZE * 0.6;
const LABEL_GAP = 6;

export function textWidth(text: string): number {
  return text.length * CHAR_WIDTH;
}

/** Rounds geometry to 2dp so the emitted markup is short and deterministic. */
export function px(value: number): number {
  return Math.round(value * 100) / 100;
}

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let nice: number;
  if (round) nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  else nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

/** Heckbert's nice axis ticks covering [min, max], about five of them. */
export function niceTicks(min: number, max: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new Error(`niceTicks: invalid range ${min}..${max}`);
  }
  const top = max === min ? min + 1 : max;
  const step = niceNumber(niceNumber(top - min, false) / 4, true);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const first = Math.floor(min / step) * step;
  const last = Math.ceil(top / step) * step;
  const ticks: number[] = [];
  for (let i = 0; first + i * step <= last + step / 2; i++) {
    ticks.push(Number((first + i * step).toFixed(decimals)) + 0);
  }
  return ticks;
}

export type FoldedRow<T> = T | { label: string; value: number; folded: number };

/** Keeps the first `maxBars - 1` rows and sums the tail into one "Other" row. */
export function foldTail<T extends { label: string; value: number }>(
  rows: readonly T[],
  maxBars: number | undefined,
): FoldedRow<T>[] {
  if (maxBars === undefined) return [...rows];
  if (!Number.isInteger(maxBars) || maxBars < 2) {
    throw new Error(`maxBars must be an integer ≥ 2, got ${maxBars}`);
  }
  if (rows.length <= maxBars) return [...rows];
  const tail = rows.slice(maxBars - 1);
  return [
    ...rows.slice(0, maxBars - 1),
    { label: "Other", value: tail.reduce((sum, row) => sum + row.value, 0), folded: tail.length },
  ];
}

/** Every how many slots a label can be drawn without colliding with the next shown one. */
export function labelStep(labels: readonly string[], slotWidth: number): number {
  const widest = Math.max(0, ...labels.map(textWidth)) + LABEL_GAP;
  return Math.max(1, Math.ceil(widest / slotWidth));
}

/** Height below the plot reserved for x labels, so they clear the 0 tick label. */
export const X_AXIS_BAND = 22;
/** Distance from the chart's bottom edge to the x label baseline. */
export const X_LABEL_INSET = 6;

/** The x for a middle-anchored label that keeps the whole label inside [0, width]. */
export function clampLabelX(center: number, label: string, width: number): number {
  const half = textWidth(label) / 2;
  return px(Math.min(Math.max(center, half), width - half));
}

export function truncateLabel(label: string, maxWidth: number): string {
  if (textWidth(label) <= maxWidth) return label;
  const keep = Math.max(1, Math.floor(maxWidth / CHAR_WIDTH) - 1);
  return `${label.slice(0, keep)}…`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

/**
 * Default x label: an ISO date becomes "Aug 16" (read from the string, not via
 * Date, so the output does not depend on the render's timezone); anything else
 * is shown as given.
 */
export function formatChartX(x: string): string {
  const match = ISO_DATE.exec(x);
  if (!match) return x;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) throw new Error(`formatChartX: invalid month in ${x}`);
  return `${month} ${Number(match[3])}`;
}

const VALUE_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Default value label: grouped, up to 2 decimals, locale-independent. */
export function formatChartValue(value: number): string {
  return VALUE_FORMAT.format(value);
}

export function assertChartSize(component: string, width: number, height?: number): void {
  if (!Number.isFinite(width) || width <= 0) throw new Error(`${component}: width must be a positive number, got ${width}`);
  if (height !== undefined && (!Number.isFinite(height) || height <= 0)) {
    throw new Error(`${component}: height must be a positive number, got ${height}`);
  }
}

export function assertFinite(component: string, label: string, value: number): void {
  if (!Number.isFinite(value)) throw new Error(`${component}: value for "${label}" must be finite, got ${value}`);
}
