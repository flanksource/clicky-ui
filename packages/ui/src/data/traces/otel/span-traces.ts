import type { Span, Trace } from "./api";
import { indexTrace, isError, micros } from "./model";

/** A trace's root among its start-ordered spans: a parentless span, else the first span whose parent is not in the trace, else the first span. */
export function traceRoot(ordered: readonly Span[]): Span {
  const ids = new Set(ordered.map(span => span.spanId));
  return ordered.find(span => !span.parentId) ?? ordered.find(span => !ids.has(span.parentId!)) ?? ordered[0]!;
}

export function spanTraces(spans: readonly Span[]): Trace[] {
  const groups = new Map<string, Span[]>();
  for (const span of spans) {
    if (!span.traceId || !span.spanId || !Number.isFinite(span.durationMs) || span.durationMs < 0)
      throw new Error("Trace spans require traceId, spanId and a finite non-negative durationMs");
    micros(span.startedAt);
    const group = groups.get(span.traceId) ?? [];
    group.push(span);
    groups.set(span.traceId, group);
  }
  return [...groups].map(([traceId, group]) => {
    const ordered = [...group].sort((a, b) => micros(a.startedAt) - micros(b.startedAt) || a.spanId.localeCompare(b.spanId));
    const first = ordered[0]!;
    const ids = new Set(ordered.map(span => span.spanId));
    const root = traceRoot(ordered);
    const start = micros(first.startedAt);
    const end = ordered.reduce((latest, span) => Math.max(latest, micros(span.startedAt) + span.durationMs * 1000), start);
    const trace: Trace = {
      summary: { traceId, service: root.service, operation: root.operation, startedAt: first.startedAt, durationMs: (end - start) / 1000, spanCount: ordered.length, errors: ordered.filter(isError).length, services: [...new Set(ordered.map(span => span.service))].sort() },
      spans: ordered,
      missingParents: [...new Set(ordered.flatMap(span => span.parentId && !ids.has(span.parentId) ? [span.parentId] : []))].sort(),
    };
    indexTrace(trace);
    return trace;
  }).sort((a, b) => micros(b.summary.startedAt) - micros(a.summary.startedAt) || a.summary.traceId.localeCompare(b.summary.traceId));
}
