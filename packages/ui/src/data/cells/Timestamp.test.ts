import { describe, expect, it } from "vitest";
import {
  chooseTimestampFormat,
  formatTimestamp,
  parseTimestamp,
  resolveDateMath,
} from "./Timestamp";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("chooseTimestampFormat", () => {
  it("picks relative when all values fall within a minute", () => {
    const t = new Date("2026-04-15T12:00:00Z");
    const values = [t, new Date(t.getTime() + 5 * SECOND), new Date(t.getTime() + 30 * SECOND)];
    expect(chooseTimestampFormat(values)).toBe("relative");
  });

  it("picks time when values are within the same calendar day", () => {
    const t = new Date("2026-04-15T01:00:00Z");
    const values = [t, new Date(t.getTime() + 6 * HOUR), new Date(t.getTime() + 18 * HOUR)];
    expect(chooseTimestampFormat(values)).toBe("time");
  });

  it("picks short when values span multiple days inside a year", () => {
    const t = new Date("2026-04-15T12:00:00Z");
    const values = [t, new Date(t.getTime() + 30 * DAY), new Date(t.getTime() + 90 * DAY)];
    expect(chooseTimestampFormat(values)).toBe("short");
  });

  it("picks iso when values span multiple years", () => {
    const t = new Date("2024-01-15T12:00:00Z");
    const values = [t, new Date(t.getTime() + 400 * DAY)];
    expect(chooseTimestampFormat(values)).toBe("iso");
  });

  it("falls back to iso for an empty list", () => {
    expect(chooseTimestampFormat([])).toBe("iso");
  });
});

describe("parseTimestamp", () => {
  it("parses ISO strings", () => {
    expect(parseTimestamp("2026-04-15T12:00:00Z")?.toISOString()).toBe("2026-04-15T12:00:00.000Z");
  });

  it("treats numbers below 1e12 as seconds", () => {
    expect(parseTimestamp(0)?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    expect(parseTimestamp(1_700_000_000)?.toISOString()).toBe("2023-11-14T22:13:20.000Z");
  });

  it("treats numbers >= 1e12 as milliseconds", () => {
    expect(parseTimestamp(1_700_000_000_000)?.toISOString()).toBe("2023-11-14T22:13:20.000Z");
  });

  it("returns null for unparseable input", () => {
    expect(parseTimestamp("not a date")).toBe(null);
    expect(parseTimestamp(null)).toBe(null);
    expect(parseTimestamp(undefined)).toBe(null);
    expect(parseTimestamp({})).toBe(null);
  });
});

describe("resolveDateMath", () => {
  const now = new Date("2026-04-15T12:00:00Z");

  it("resolves 'now' to the reference time", () => {
    expect(resolveDateMath("now", now)?.toISOString()).toBe("2026-04-15T12:00:00.000Z");
  });

  it("resolves now-Xm forms", () => {
    expect(resolveDateMath("now-15m", now)?.toISOString()).toBe("2026-04-15T11:45:00.000Z");
    expect(resolveDateMath("now-1h", now)?.toISOString()).toBe("2026-04-15T11:00:00.000Z");
    expect(resolveDateMath("now-24h", now)?.toISOString()).toBe("2026-04-14T12:00:00.000Z");
    expect(resolveDateMath("now-7d", now)?.toISOString()).toBe("2026-04-08T12:00:00.000Z");
    expect(resolveDateMath("now-2w", now)?.toISOString()).toBe("2026-04-01T12:00:00.000Z");
  });

  it("resolves now+Xs forms", () => {
    expect(resolveDateMath("now+30s", now)?.toISOString()).toBe("2026-04-15T12:00:30.000Z");
  });

  it("falls back to absolute parsing for ISO strings", () => {
    expect(resolveDateMath("2026-04-15T11:00:00Z", now)?.toISOString()).toBe(
      "2026-04-15T11:00:00.000Z",
    );
  });

  it("returns null for empty / nonsense values", () => {
    expect(resolveDateMath("", now)).toBe(null);
    expect(resolveDateMath("now-", now)).toBe(null);
    expect(resolveDateMath("now-15z", now)).toBe(null);
  });
});

describe("formatTimestamp", () => {
  const t = new Date("2026-04-15T12:00:00Z");

  it("renders relative durations", () => {
    const now = new Date(t.getTime() + 30 * SECOND);
    expect(formatTimestamp(t, "relative", now)).toBe("30s ago");
  });

  it("renders future relative durations", () => {
    const now = new Date(t.getTime() - 5 * MINUTE);
    expect(formatTimestamp(t, "relative", now)).toBe("in 5m");
  });

  it("renders iso as YYYY-MM-DD HH:mm in local time", () => {
    expect(formatTimestamp(t, "iso")).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});
