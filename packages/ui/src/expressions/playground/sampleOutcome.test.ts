import { describe, expect, it } from "vitest";
import type { EvalResponse } from "./api.ts";
import { classifySample, nextFailure, resultTypes, tallySamples, type SampleOutcome } from "./sampleOutcome.ts";

const ALLOWED = ["F", "M"];
const allowedOnly = (response: EvalResponse) =>
  ALLOWED.includes(response.result) || response.result === "" ? [] : [`"${response.result}" is not one of ${ALLOWED.join(", ")}`];
const requiredAllowed = (response: EvalResponse) =>
  response.result === "" ? ["Required"] : allowedOnly(response);

describe("classifySample", () => {
  it.each<[string, EvalResponse, ((response: EvalResponse) => string[]) | undefined, ReturnType<typeof classifySample>]>([
    ["an evaluation error as failed", { result: "", durationMs: 1, error: { message: "map has no entry for key Gender" } }, allowedOnly, { outcome: "failed", issues: ["map has no entry for key Gender"] }],
    ["an allowed value as valid", { result: "F", durationMs: 1 }, allowedOnly, { outcome: "valid", issues: [] }],
    ["a disallowed value as invalid", { result: "X", durationMs: 1 }, allowedOnly, { outcome: "invalid", issues: ['"X" is not one of F, M'] }],
    ["a blank optional result as empty", { result: "  ", durationMs: 1 }, undefined, { outcome: "empty", issues: [] }],
    ["a blank required result as invalid, not empty", { result: "", durationMs: 1 }, requiredAllowed, { outcome: "invalid", issues: ["Required"] }],
    ["any value as valid without a validator", { result: "X", durationMs: 1 }, undefined, { outcome: "valid", issues: [] }],
  ])("classifies %s", (_name, response, validate, expected) => {
    expect(classifySample(response, validate)).toEqual(expected);
  });
});

describe("tallySamples", () => {
  it("counts each outcome, including the ones that did not occur", () => {
    expect(tallySamples(["valid", "invalid", "valid", "failed"])).toEqual({ valid: 2, invalid: 1, empty: 0, failed: 1 });
  });
});

describe("nextFailure", () => {
  const outcomes: SampleOutcome[] = ["valid", "failed", "empty", "invalid", "valid"];

  it.each([
    ["the next failing sample after the focus", 1, 3],
    ["wrapping to the first failure past the end", 3, 1],
    ["the first failure from before the start", -1, 1],
  ])("finds %s", (_name, from, expected) => {
    expect(nextFailure(outcomes, from)).toBe(expected);
  });

  it("returns nothing when the focused sample is the only failure", () => {
    expect(nextFailure(["valid", "invalid", "empty"], 1)).toBeUndefined();
  });

  it("returns nothing when no sample fails", () => {
    expect(nextFailure(["valid", "empty"], 0)).toBeUndefined();
  });
});

describe("resultTypes", () => {
  it("lists the distinct types of successful results, sorted", () => {
    expect(resultTypes([
      { result: "1", durationMs: 1, type: "int" },
      { result: "a", durationMs: 1, type: "string" },
      { result: "2", durationMs: 1, type: "int" },
      { result: "", durationMs: 1, type: "bool", error: { message: "boom" } },
      { result: "b", durationMs: 1 },
    ])).toEqual(["int", "string"]);
  });
});
