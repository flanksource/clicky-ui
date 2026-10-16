import { formatBytes, formatDuration, formatShort } from "../../lib/format";
import type { ProfileSample, StackFrame } from "./types";

/** A sample type of a profile with its unit, for example `cpu` in `nanoseconds`. */
export type ProfileValueType = { sampleType: string; unit: string };

/** One function's share of a profile. */
export type ProfileFunctionRow = {
  func: string;
  /** Where the function was first seen in the samples. */
  file: string;
  line: number;
  /** Value of the samples whose innermost frame is this function. */
  flat: number;
  /** Value of the samples whose stack contains this function at all, counted once per sample. */
  cum: number;
};

export type ProfileAggregate = {
  total: number;
  unit: string;
  /** Every function, sorted by `flat` descending. */
  functions: ProfileFunctionRow[];
};

/** A distinct stack and the value of all the samples that shared it. */
export type ProfileStack = { frames: StackFrame[]; value: number };

/** The sample types present, in order of first appearance. */
export function profileValueTypes(samples: ProfileSample[]): ProfileValueType[] {
  const seen = new Map<string, ProfileValueType>();
  for (const sample of samples) {
    if (!seen.has(sample.sampleType)) seen.set(sample.sampleType, { sampleType: sample.sampleType, unit: sample.unit });
  }
  return [...seen.values()];
}

function ofType(samples: ProfileSample[], sampleType: string): ProfileSample[] {
  const own = samples.filter((sample) => sample.sampleType === sampleType);
  const units = new Set(own.map((sample) => sample.unit));
  if (units.size > 1) {
    throw new Error(`sample type "${sampleType}" has mixed units ${[...units].map((unit) => `"${unit}"`).join(", ")}`);
  }
  for (const sample of own) {
    if (sample.frames.length === 0) throw new Error(`a "${sampleType}" sample has no frames`);
  }
  return own;
}

/**
 * Totals one sample type's samples per function: flat (the innermost frame) and
 * cumulative (anywhere in the stack, once per sample even when the function
 * recurses). Frames are innermost first.
 */
export function aggregateProfile(samples: ProfileSample[], sampleType: string): ProfileAggregate {
  const own = ofType(samples, sampleType);
  const rows = new Map<string, ProfileFunctionRow>();
  let total = 0;
  for (const sample of own) {
    total += sample.value;
    for (const frame of sample.frames) {
      if (!rows.has(frame.func)) {
        rows.set(frame.func, { func: frame.func, file: frame.file, line: frame.line, flat: 0, cum: 0 });
      }
    }
    for (const func of new Set(sample.frames.map((frame) => frame.func))) rows.get(func)!.cum += sample.value;
    rows.get(sample.frames[0]!.func)!.flat += sample.value;
  }
  return {
    total,
    unit: own[0]?.unit ?? "",
    functions: [...rows.values()].sort((a, b) => b.flat - a.flat || b.cum - a.cum || a.func.localeCompare(b.func)),
  };
}

/** The heaviest distinct stacks of one sample type that pass through `func`, heaviest first. */
export function stacksThrough(samples: ProfileSample[], sampleType: string, func: string, limit: number): ProfileStack[] {
  const stacks = new Map<string, ProfileStack>();
  for (const sample of ofType(samples, sampleType)) {
    if (!sample.frames.some((frame) => frame.func === func)) continue;
    const id = sample.frames.map((frame) => `${frame.func}@${frame.file}:${frame.line}`).join("\n");
    const stack = stacks.get(id);
    if (stack) stack.value += sample.value;
    else stacks.set(id, { frames: sample.frames, value: sample.value });
  }
  return [...stacks.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

const NANOS_PER_MS = 1e6;

/** A profile value for display in its unit: bytes, durations and plain counts. */
export function formatProfileValue(value: number, unit: string): string {
  switch (unit) {
    case "bytes":
      return formatBytes(value);
    case "nanoseconds":
      return Math.abs(value) < NANOS_PER_MS ? `${formatShort(value / 1e3)} µs` : formatDuration(value / NANOS_PER_MS);
    case "microseconds":
      return Math.abs(value) < 1e3 ? `${formatShort(value)} µs` : formatDuration(value / 1e3);
    case "milliseconds":
      return formatDuration(value);
    case "seconds":
      return formatDuration(value, { from: "s" });
    case "count":
    case "":
      return formatShort(value);
    default:
      return `${formatShort(value)} ${unit}`;
  }
}
