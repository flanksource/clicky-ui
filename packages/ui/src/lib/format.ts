// Value formatters and a Grafana-style unit registry, shared by TimeseriesPanel
// (and any other metric display). Pure — no React — so it is trivially testable.
//
// `formatUnit(value, unit)` dispatches on a Grafana unit identifier (e.g.
// "bytes", "Bps", "percent", "ms", "short"). Unknown unit strings are treated as
// a raw suffix appended to the formatted number, preserving callers that pass a
// literal like "%" or "req".

const LOCALE = "en-US";

function intl(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxFractionDigits }).format(
    Number.isFinite(value) ? value : 0,
  );
}

/** Drops a trailing ".0" so whole values read "1 KB" rather than "1.0 KB". */
function trimZero(s: string): string {
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export interface FormatBytesOptions {
  /** 1024 (IEC, the default) or 1000 (SI/decimal). */
  base?: 1000 | 1024;
  /** Appended after the unit label, e.g. "/s" for a rate. */
  suffix?: string;
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * Human-readable byte size. 1024-based by default with B/KB/MB/GB/TB/PB labels,
 * matching the prior diagnostics formatter. Whole numbers and values >= 10 drop
 * the fraction; smaller fractional values keep one decimal.
 */
export function formatBytes(bytes?: number, opts?: FormatBytesOptions): string {
  const suffix = opts?.suffix ?? "";
  if (bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) return `0 B${suffix}`;
  const base = opts?.base ?? 1024;
  let size = bytes;
  let unit = 0;
  while (size >= base && unit < BYTE_UNITS.length - 1) {
    size /= base;
    unit++;
  }
  const rendered = size >= 10 || unit === 0 ? size.toFixed(0) : trimZero(size.toFixed(1));
  return `${rendered} ${BYTE_UNITS[unit]}${suffix}`;
}

/** Byte rate, e.g. "1.5 MB/s". 1024-based. */
export function formatBytesPerSecond(bytes?: number): string {
  return formatBytes(bytes, { suffix: "/s" });
}

const SHORT_UNITS = ["", "K", "M", "B", "T"] as const;

/** SI abbreviation: 999 -> "999", 1200 -> "1.2K", 3_400_000 -> "3.4M". */
export function formatShort(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "0";
  const sign = value < 0 ? "-" : "";
  let n = Math.abs(value);
  if (n < 1000) return `${sign}${intl(n)}`;
  let unit = 0;
  while (n >= 1000 && unit < SHORT_UNITS.length - 1) {
    n /= 1000;
    unit++;
  }
  const rendered = n >= 10 ? n.toFixed(0) : trimZero(n.toFixed(1));
  return `${sign}${rendered}${SHORT_UNITS[unit]}`;
}

/**
 * Duration rendered from a millisecond (default) or second input. Picks ms / s /
 * min / h by magnitude: 850 -> "850 ms", 1500 -> "1.5 s", 90_000 -> "1.5 min".
 */
export function formatDuration(value?: number, opts?: { from?: "ms" | "s" }): string {
  if (value === undefined || !Number.isFinite(value)) return "0 ms";
  const ms = opts?.from === "s" ? value * 1000 : value;
  const abs = Math.abs(ms);
  if (abs < 1000) return `${intl(ms, 0)} ms`;
  if (abs < 60_000) return `${intl(ms / 1000)} s`;
  if (abs < 3_600_000) return `${intl(ms / 60_000)} min`;
  return `${intl(ms / 3_600_000)} h`;
}

// formatters keyed by Grafana unit identifier. Keys not present here fall through
// to the raw-suffix path in formatUnit.
const UNIT_FORMATTERS: Record<string, (v: number) => string> = {
  none: (v) => formatShort(v),
  short: (v) => formatShort(v),
  percent: (v) => `${intl(v)}%`,
  percentunit: (v) => `${intl(v * 100)}%`,
  "%": (v) => `${intl(v)}%`,
  bytes: (v) => formatBytes(v, { base: 1024 }),
  decbytes: (v) => formatBytes(v, { base: 1000 }),
  Bps: (v) => formatBytesPerSecond(v),
  binBps: (v) => formatBytesPerSecond(v),
  ms: (v) => formatDuration(v, { from: "ms" }),
  s: (v) => formatDuration(v, { from: "s" }),
};

/**
 * Formats a value for display per a Grafana-style unit key. Unknown units are
 * appended as a literal suffix (back-compat for callers passing "%", "req",
 * etc.); an absent unit yields the plain localized number.
 */
export function formatUnit(value: number, unit?: string): string {
  const v = Number.isFinite(value) ? value : 0;
  if (!unit) return intl(v);
  const fmt = UNIT_FORMATTERS[unit];
  if (fmt) return fmt(v);
  return `${intl(v)}${unit}`;
}
