import { describe, expect, it } from "vitest";
import { traceExample } from "./fixtures";
import { profileSpans } from "./profile-spans";

const span = traceExample.spans[0]!;

describe("profileSpans", () => {
  it("returns the canonical span carried by each row, in row order", () => {
    const second = { ...span, spanId: "second" };
    expect(profileSpans([{ _trace: span }, { _trace: second }])).toEqual([span, second]);
  });

  it.each([
    { name: "missing", row: {}, message: "Row 1 is missing its canonical span" },
    { name: "an array", row: { _trace: [span] }, message: "Row 1 is missing its canonical span" },
    { name: "a string", row: { _trace: "span" }, message: "Row 1 is missing its canonical span" },
    { name: "without a spanId", row: { _trace: { ...span, spanId: undefined } }, message: "Row 1 has invalid spanId" },
    { name: "with a numeric traceId", row: { _trace: { ...span, traceId: 7 } }, message: "Row 1 has invalid traceId" },
    { name: "with a negative duration", row: { _trace: { ...span, durationMs: -1 } }, message: "Row 1 has invalid durationMs" },
    { name: "with a non-finite duration", row: { _trace: { ...span, durationMs: Number.NaN } }, message: "Row 1 has invalid durationMs" },
  ])("rejects a row whose _trace is $name", ({ row, message }) => {
    expect(() => profileSpans([row])).toThrow(message);
  });

  it("names the first bad row's position", () => {
    expect(() => profileSpans([{ _trace: span }, {}])).toThrow("Row 2 is missing its canonical span");
  });
});
