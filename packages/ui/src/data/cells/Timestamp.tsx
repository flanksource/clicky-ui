import { cn } from "../../lib/utils";

export type TimestampMode = "auto" | "absolute" | "relative" | "time";

export type TimestampFormat = "relative" | "time" | "short" | "iso";

export type TimestampOptions = {
  mode?: TimestampMode;
  alwaysShowFullOnHover?: boolean;
  /**
   * When the column is on a DataTable with `autoFilter`, DataTable mounts a
   * "Time range" picker (matching the trace UI) and filters rows whose
   * timestamp falls outside the selected range. Set `false` to suppress.
   */
  autoRangeFilter?: boolean;
  /** Override the trace-style preset list ("Last 15 minutes", etc.). */
  rangePresets?: Array<{ label: string; from: string; to: string }>;
  /**
   * Default range applied on first render. Either side may use date-math
   * (`now-24h`, `now`) or any value parseable by `parseTimestamp`.
   */
  defaultRange?: { from?: string; to?: string };
};

export function parseTimestamp(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

const RELATIVE_PATTERN = /^now\s*([+-])\s*(\d+)\s*([smhdw])$/i;

/**
 * Resolves date-math strings to an absolute Date. Recognised forms:
 *   - "now"
 *   - "now-15m", "now-1h", "now+30s", "now-7d", "now-2w" (units: s/m/h/d/w)
 *   - any value parseable by `parseTimestamp` (ISO, epoch ms/s, Date)
 * Returns null for unparseable input.
 */
export function resolveDateMath(value: unknown, now: Date = new Date()): Date | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.toLowerCase() === "now") return new Date(now.getTime());

    const match = trimmed.match(RELATIVE_PATTERN);
    if (match) {
      const [, sign, amount, unit] = match;
      const unitMs = UNIT_MS[unit!.toLowerCase()];
      if (!unitMs) return null;
      const delta = Number(amount) * unitMs * (sign === "-" ? -1 : 1);
      return new Date(now.getTime() + delta);
    }
  }

  return parseTimestamp(value);
}

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export function chooseTimestampFormat(values: Date[]): TimestampFormat {
  if (values.length === 0) return "iso";

  let min = Infinity;
  let max = -Infinity;
  for (const d of values) {
    const t = d.getTime();
    if (t < min) min = t;
    if (t > max) max = t;
  }
  const span = max - min;

  if (span <= MS_PER_MINUTE) return "relative";

  const minDate = new Date(min);
  const maxDate = new Date(max);

  if (
    minDate.getFullYear() === maxDate.getFullYear() &&
    minDate.getMonth() === maxDate.getMonth() &&
    minDate.getDate() === maxDate.getDate()
  ) {
    return "time";
  }

  if (minDate.getFullYear() === maxDate.getFullYear() && span <= MS_PER_DAY * 365) {
    return "short";
  }

  return "iso";
}

export function formatTimestamp(
  date: Date,
  format: TimestampFormat,
  now: Date = new Date(),
): string {
  switch (format) {
    case "relative":
      return formatRelative(date, now);
    case "time":
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    case "short":
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "iso":
    default:
      return formatIso(date);
  }
}

function formatIso(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatRelative(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);

  let value: string;
  if (sec < 1) value = "just now";
  else if (sec < 60) value = `${sec}s`;
  else if (sec < 3600) value = `${Math.round(sec / 60)}m`;
  else if (sec < 86400) value = `${Math.round(sec / 3600)}h`;
  else value = `${Math.round(sec / 86400)}d`;

  if (value === "just now") return value;
  return future ? `in ${value}` : `${value} ago`;
}

export function modeToFormat(mode: TimestampMode, dataFormat: TimestampFormat): TimestampFormat {
  switch (mode) {
    case "absolute":
      return "iso";
    case "relative":
      return "relative";
    case "time":
      return "time";
    case "auto":
    default:
      return dataFormat;
  }
}

export type TimestampProps = {
  value: unknown;
  format: TimestampFormat;
  showTitleOnHover?: boolean;
  className?: string;
};

export function Timestamp({ value, format, showTitleOnHover = true, className }: TimestampProps) {
  const parsed = parseTimestamp(value);
  if (!parsed) return <span className={cn("text-muted-foreground", className)}>—</span>;

  const display = formatTimestamp(parsed, format);
  const title = showTitleOnHover ? parsed.toISOString() : undefined;

  return (
    <span
      className={cn("tabular-nums whitespace-nowrap text-muted-foreground", className)}
      title={title}
    >
      {display}
    </span>
  );
}
