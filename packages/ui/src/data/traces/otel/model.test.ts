import { describe, expect, it } from "vitest";
import { buildRows, indexTrace, micros, selfTimeMs, type Span, type Trace } from "./model";

const at = "2026-11-02T10:00:00.000000Z";
const span = (spanId: string, durationMs: number, parentId?: string): Span => ({ spanId, durationMs, ...(parentId ? { parentId } : {}), startedAt: at, service: "checkout", operation: spanId, status: "ok", attributes: { "db.system": "postgresql" } });
const trace = (spans: Span[]): Trace => ({ spans, summary: { traceId: "trace", service: "checkout", operation: "root", startedAt: at, durationMs: 100, spanCount: spans.length, errors: 0, services: ["checkout"] }, missingParents: [] });

describe("OpenTelemetry waterfall model", () => {
  it("clips overlapping child intervals to the parent when computing self time", () => {
    const root = span("root", 100);
    const index = indexTrace(trace([root, span("a", 150, "root"), span("b", 80, "root")]));
    expect(selfTimeMs(index, root)).toBe(0);
  });
  it("retains sub-millisecond precision with RFC3339 offsets", () => {
    expect(micros("2026-11-02T12:00:00.000125+02:00") - micros(at)).toBe(125);
  });
  it("rejects parent cycles instead of dropping their spans", () => {
    expect(() => indexTrace(trace([span("a", 1, "b"), span("b", 1, "a")]))).toThrow("cycle");
  });
  it("groups three consecutive database leaf siblings", () => {
    const index = indexTrace(trace([span("root", 100), ...["a", "b", "c"].map(id => span(id, 1, "root"))]));
    expect(buildRows(index, { collapsed: new Set(), expanded: new Set(), group: true }).map(row => row.type)).toEqual(["span", "group"]);
  });
});
