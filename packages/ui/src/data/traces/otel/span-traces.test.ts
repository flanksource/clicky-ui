import { describe, expect, it } from "vitest";
import type { Span } from "./api";
import { spanTraces } from "./span-traces";

const root: Span = { traceId: "trace-a", spanId: "root", service: "checkout", operation: "POST /orders", startedAt: "2026-11-02T10:00:00.000100Z", durationMs: 10, status: "ok" };
const child: Span = { ...root, spanId: "db", parentId: "root", service: "warehouse", operation: "SELECT orders", startedAt: "2026-11-02T10:00:00.005100Z", durationMs: 20, status: "error", attributes: { "db.system": "postgresql", "db.rows": 3 } };

describe("spanTraces", () => {
  it("groups spans by trace, uses root identity and the full observed time bounds", () => {
    expect(spanTraces([child, { ...root, traceId: "trace-b", spanId: "other", startedAt: "2026-11-02T11:00:00Z" }, root])).toEqual([
      { summary: { traceId: "trace-b", service: "checkout", operation: "POST /orders", startedAt: "2026-11-02T11:00:00Z", durationMs: 10, spanCount: 1, errors: 0, services: ["checkout"] }, spans: [{ ...root, traceId: "trace-b", spanId: "other", startedAt: "2026-11-02T11:00:00Z" }], missingParents: [] },
      { summary: { traceId: "trace-a", service: "checkout", operation: "POST /orders", startedAt: root.startedAt, durationMs: 25, spanCount: 2, errors: 1, services: ["checkout", "warehouse"] }, spans: [root, child], missingParents: [] },
    ]);
  });

  it("marks missing parents and keeps single-span traces", () => {
    expect(spanTraces([child])[0]?.missingParents).toEqual(["root"]);
    expect(spanTraces([])).toEqual([]);
  });

  it.each([
    ["duplicate span IDs", [root, root]],
    ["parent cycles", [{ ...root, parentId: "db" }, child]],
    ["negative duration", [{ ...root, durationMs: -1 }]],
    ["invalid timestamp", [{ ...root, startedAt: "yesterday" }]],
    ["missing trace ID", [{ ...root, traceId: "" }]],
  ])("rejects %s", (_name, spans) => {
    expect(() => spanTraces(spans as Span[])).toThrow();
  });
});
