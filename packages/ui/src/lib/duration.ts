// Go `time.ParseDuration` syntax, scanned linearly. The obvious regex
// (`/^(\d+(\.\d+)?(ns|us|ms|s|m|h))+$/`) nests a quantifier inside a repeated
// group and backtracks exponentially on inputs like "000000000000x".

export const DURATION_UNITS = [
  "ns",
  "us",
  "µs",
  "μs",
  "ms",
  "s",
  "m",
  "h",
] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

export const DURATION_SCALE_MS: Record<DurationUnit, number> = {
  ns: 1 / 1_000_000,
  us: 1 / 1_000,
  µs: 1 / 1_000,
  μs: 1 / 1_000,
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
};

/** Reads a decimal number at `start`, or null when there is not one there. */
export function readDurationNumber(
  value: string,
  start: number,
): { value: number; next: number } | null {
  let next = start;
  let integerDigits = 0;
  while (isAsciiDigit(value[next])) {
    integerDigits++;
    next++;
  }
  let fractionalDigits = 0;
  if (value[next] === ".") {
    next++;
    while (isAsciiDigit(value[next])) {
      fractionalDigits++;
      next++;
    }
  }
  if (integerDigits === 0 && fractionalDigits === 0) return null;
  return { value: Number(value.slice(start, next)), next };
}

export function durationUnitAt(value: string, start: number): DurationUnit | null {
  for (const unit of DURATION_UNITS) {
    if (value.startsWith(unit, start)) return unit;
  }
  return null;
}

/**
 * Total milliseconds for an unsigned Go duration ("1h30m"), or null when the
 * whole string is not a sequence of number+unit components.
 */
export function parseGoDurationMs(value: string): number | null {
  let offset = 0;
  let totalMs = 0;
  while (offset < value.length) {
    const component = readDurationNumber(value, offset);
    const unit = component && durationUnitAt(value, component.next);
    if (!component || !unit) return null;
    totalMs += component.value * DURATION_SCALE_MS[unit];
    offset = component.next + unit.length;
  }
  return offset === 0 ? null : totalMs;
}

function isAsciiDigit(value: string | undefined): boolean {
  return value !== undefined && value >= "0" && value <= "9";
}
