import { cn } from "../../lib/utils";
import type { TimeRangePresetGroup } from "../../components/TimeRange";

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
  rangePresets?: Array<{ label: string; from: string; to: string } | TimeRangePresetGroup>;
  /** Enable absolute date+time input and timezone selection for range filters. */
  timeEnabled?: boolean;
  /** Default timezone used when encoding absolute date+time range values. */
  timeZone?: string;
  /** Selectable timezones shown when `timeEnabled` is true. */
  timeZones?: string[];
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

const RELATIVE_PATTERN = /^now\s*([+-])\s*(\d+)\s*([smhdwMqy])$/;
const ANCHORED_PATTERN = /^now\/([wMqy])(?:\s*([+-])\s*(\d+)\s*([wMqy]))?$/;

/**
 * Resolves date-math strings to an absolute Date. Recognised forms:
 *   - "now"
 *   - "now-15m", "now-1h", "now+30s", "now-7d", "now-2w" (units: s/m/h/d/w/M/q/y)
 *   - "now/w", "now/M", "now/q", "now/y" with optional calendar offsets
 *   - any value parseable by `parseTimestamp` (ISO, epoch ms/s, Date)
 * Returns null for unparseable input.
 */
export function resolveDateMath(value: unknown, now: Date = new Date()): Date | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.toLowerCase() === "now") return new Date(now.getTime());

    const anchoredMatch = trimmed.match(ANCHORED_PATTERN);
    if (anchoredMatch) {
      const [, anchor, sign, amount, unit] = anchoredMatch;
      let anchored = startOfPeriod(now, anchor!);
      if (sign && amount && unit) {
        anchored = addPeriod(anchored, unit, Number(amount) * (sign === "-" ? -1 : 1));
      }
      return anchored;
    }

    const match = trimmed.match(RELATIVE_PATTERN);
    if (match) {
      const [, sign, amount, unit] = match;
      const calendarUnit = unit!;
      if (isCalendarUnit(calendarUnit)) {
        return addPeriod(now, calendarUnit, Number(amount) * (sign === "-" ? -1 : 1));
      }
      const unitMs = UNIT_MS[calendarUnit.toLowerCase()];
      if (!unitMs) return null;
      const delta = Number(amount) * unitMs * (sign === "-" ? -1 : 1);
      return new Date(now.getTime() + delta);
    }
  }

  return parseTimestamp(value);
}

function isCalendarUnit(unit: string) {
  return unit === "M" || unit === "q" || unit === "y";
}

function startOfPeriod(date: Date, unit: string) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  if (unit === "w") {
    const start = new Date(Date.UTC(year, month, day));
    const dayOfWeek = start.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
    return start;
  }
  if (unit === "M") return new Date(Date.UTC(year, month, 1));
  if (unit === "q") return new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1));
  if (unit === "y") return new Date(Date.UTC(year, 0, 1));
  return new Date(date.getTime());
}

function addPeriod(date: Date, unit: string, amount: number) {
  const next = new Date(date.getTime());
  if (unit === "w") {
    next.setUTCDate(next.getUTCDate() + amount * 7);
  } else if (unit === "M") {
    next.setUTCMonth(next.getUTCMonth() + amount);
  } else if (unit === "q") {
    next.setUTCMonth(next.getUTCMonth() + amount * 3);
  } else if (unit === "y") {
    next.setUTCFullYear(next.getUTCFullYear() + amount);
  } else {
    const unitMs = UNIT_MS[unit.toLowerCase()];
    if (unitMs) next.setTime(next.getTime() + amount * unitMs);
  }
  return next;
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
