import { describe, expect, it } from "vitest";
import { formatTaskDuration } from "./task-run-format";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

describe("formatTaskDuration", () => {
  it.each([
    { ms: 0, text: "0ms" },
    { ms: 850, text: "850ms" },
    { ms: 999.6, text: "1s" },
    { ms: 3_940, text: "3.9s" },
    { ms: 6_000, text: "6s" },
    { ms: 31_300, text: "31s" },
    { ms: MINUTE + 2 * SECOND, text: "1m 2s" },
    { ms: 2 * MINUTE, text: "2m" },
    { ms: HOUR + 5 * MINUTE + 20 * SECOND, text: "1h 5m" },
    { ms: 3 * HOUR, text: "3h" },
  ])("renders $ms ms as $text", ({ ms, text }) => {
    expect(formatTaskDuration(ms)).toBe(text);
  });

  it("refuses a negative or non-finite span rather than printing nonsense", () => {
    expect(() => formatTaskDuration(-1)).toThrow("formatTaskDuration: expected a non-negative duration, got -1");
    expect(() => formatTaskDuration(Number.NaN)).toThrow("got NaN");
  });
});
