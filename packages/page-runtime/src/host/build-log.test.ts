import { describe, expect, it } from "vitest";
import { buildLog, type BuildStep } from "./build-log.ts";
import type { ActivityLoad } from "./activity-state.ts";

const loadStart = 1_000_000;
const steps: BuildStep[] = [
  { label: "Resolve page dependencies", source: "host", at: loadStart },
  { label: "Prepare runtime and links", source: "host", at: loadStart + 120 },
  { label: "booting", source: "frame", at: loadStart + 300 },
];

describe("buildLog", () => {
  it("times each step until the next one and leaves the running step open", () => {
    expect(buildLog({ steps, load: null })).toEqual([
      { label: "Resolve page dependencies", source: "host", offsetMs: 0, durationMs: 120 },
      { label: "Prepare runtime and links", source: "host", offsetMs: 120, durationMs: 180 },
      { label: "booting", source: "frame", offsetMs: 300, durationMs: null },
    ]);
  });

  it("merges frame timeline marks and Tailwind builds in time order relative to the first step", () => {
    const frameNavigation = loadStart + 250;
    const load: ActivityLoad = { id: "load-1", navigationStart: frameNavigation, records: [], timeline: [{ phase: "boot", atMs: 10 }, { phase: "ready", atMs: 400 }], tailwind: [{ kind: "candidates", startMs: 200, durationMs: 35, candidates: 12, cssBytes: 900, cacheHit: true }] };
    expect(buildLog({ steps, load }).map(({ label, source, offsetMs, durationMs }) => [label, source, offsetMs, durationMs])).toEqual([
      ["Resolve page dependencies", "host", 0, 120],
      ["Prepare runtime and links", "host", 120, 180],
      ["boot", "timeline", 260, 10],
      ["booting", "frame", 300, null],
      ["Tailwind candidates (cache)", "tailwind", 450, 35],
      ["ready", "timeline", 650, 390],
    ]);
  });

  it("leaves out activity from a frame navigation that started before this load", () => {
    const previous: ActivityLoad = { id: "load-0", navigationStart: loadStart - 5_000, records: [], timeline: [{ phase: "ready", atMs: 900 }], tailwind: [] };
    expect(buildLog({ steps, load: previous }).map(entry => entry.source)).toEqual(["host", "host", "frame"]);
  });

  it("records a failed step as an error with no running time", () => {
    const failed = [...steps, { label: "Frame failed", source: "frame" as const, at: loadStart + 500, error: "module not found" }];
    expect(buildLog({ steps: failed, load: null }).at(-1)).toEqual({ label: "Frame failed", source: "frame", offsetMs: 500, durationMs: 0, error: "module not found" });
  });

  it("refuses frame activity without a step to time it against", () => {
    expect(() => buildLog({ steps: [], load: { id: "orphan", navigationStart: loadStart, records: [], timeline: [], tailwind: [] } })).toThrow(/orphan/);
  });
});
