import { describe, expect, it } from "vitest";
import { aggregateProfile, formatProfileValue, profileValueTypes, stacksThrough } from "./profile-aggregate";
import type { ProfileSample, StackFrame } from "./types";

const at = (func: string): StackFrame => ({ func, file: `/src/${func}.go`, line: 10 });
const cpu = (value: number, ...funcs: string[]): ProfileSample => ({
  sampleType: "cpu",
  unit: "nanoseconds",
  value,
  frames: funcs.map(at),
});

describe("aggregateProfile", () => {
  const samples: ProfileSample[] = [
    cpu(10, "A", "B", "C"),
    cpu(5, "B", "C"),
    // A recurses: it counts once towards its cumulative value.
    cpu(2, "A", "A", "C"),
    { sampleType: "samples", unit: "count", value: 999, frames: [at("Z")] },
  ];

  it("totals the value of the chosen sample type only", () => {
    expect(aggregateProfile(samples, "cpu").total).toBe(17);
  });

  it("attributes flat value to the innermost frame and cumulative value to every function in the stack, once per sample", () => {
    const { functions } = aggregateProfile(samples, "cpu");
    expect(functions.map(({ func, flat, cum }) => ({ func, flat, cum }))).toEqual([
      { func: "A", flat: 12, cum: 12 },
      { func: "B", flat: 5, cum: 15 },
      { func: "C", flat: 0, cum: 17 },
    ]);
  });

  it("keeps the location a function was first seen at", () => {
    expect(aggregateProfile(samples, "cpu").functions[0]).toMatchObject({ func: "A", file: "/src/A.go", line: 10 });
  });

  it("breaks flat ties by cumulative value, then name", () => {
    // flat: x 4, y 4, a 4, z 2. cum: x 4, y 6, a 4, z 2.
    const tied = [cpu(4, "x"), cpu(4, "y"), cpu(4, "a"), cpu(2, "z", "y")];
    expect(aggregateProfile(tied, "cpu").functions.map((row) => row.func)).toEqual(["y", "a", "x", "z"]);
  });

  it("reports the unit and is empty for a sample type with no samples", () => {
    expect(aggregateProfile(samples, "cpu").unit).toBe("nanoseconds");
    expect(aggregateProfile(samples, "missing")).toEqual({ total: 0, unit: "", functions: [] });
  });

  it("throws on one sample type recorded in two units", () => {
    expect(() => aggregateProfile([cpu(1, "A"), { ...cpu(1, "A"), unit: "count" }], "cpu")).toThrow(/mixed units/);
  });

  it("throws on a sample with no frames", () => {
    expect(() => aggregateProfile([cpu(1)], "cpu")).toThrow(/no frames/);
  });
});

describe("profileValueTypes", () => {
  it("lists each sample type once, in order of first appearance", () => {
    const samples: ProfileSample[] = [
      { ...cpu(1, "A"), sampleType: "samples", unit: "count" },
      cpu(1, "A"),
      { ...cpu(2, "B"), sampleType: "samples", unit: "count" },
    ];
    expect(profileValueTypes(samples)).toEqual([
      { sampleType: "samples", unit: "count" },
      { sampleType: "cpu", unit: "nanoseconds" },
    ]);
  });
});

describe("stacksThrough", () => {
  const samples = [cpu(10, "A", "B", "C"), cpu(5, "B", "C"), cpu(3, "A", "B", "C"), cpu(7, "D")];

  it("merges samples that share a stack and orders stacks by value", () => {
    const stacks = stacksThrough(samples, "cpu", "B", 5);
    expect(stacks.map((stack) => [stack.frames.map((frame) => frame.func).join(">"), stack.value])).toEqual([
      ["A>B>C", 13],
      ["B>C", 5],
    ]);
  });

  it("keeps only the heaviest stacks up to the limit", () => {
    expect(stacksThrough(samples, "cpu", "C", 1)).toHaveLength(1);
  });

  it("is empty for a function no stack contains", () => {
    expect(stacksThrough(samples, "cpu", "nope", 5)).toEqual([]);
  });
});

describe("formatProfileValue", () => {
  it.each([
    [2048, "bytes", "2 KB"],
    [1_500_000_000, "nanoseconds", "1.5 s"],
    [250_000, "nanoseconds", "250 µs"],
    [90_000_000, "nanoseconds", "90 ms"],
    [1200, "count", "1.2K"],
    [3, "objects", "3 objects"],
  ])("formats %d %s as %s", (value, unit, expected) => {
    expect(formatProfileValue(value, unit)).toBe(expected);
  });
});
