import type { Span } from "./api";

/** Reads server-normalized spans; source inference belongs to commons-db. */
export function profileSpans(rows: readonly Record<string, unknown>[]): Span[] {
  return rows.map((row, index) => {
    const span = row._trace;
    if (!span || typeof span !== "object" || Array.isArray(span))
      throw new Error(`Row ${index + 1} is missing its canonical span`);
    const value = span as Record<string, unknown>;
    for (const key of [
      "traceId",
      "spanId",
      "startedAt",
      "service",
      "operation",
      "status",
    ])
      if (typeof value[key] !== "string")
        throw new Error(`Row ${index + 1} has invalid ${key}`);
    if (
      typeof value.durationMs !== "number" ||
      !Number.isFinite(value.durationMs) ||
      value.durationMs < 0
    )
      throw new Error(`Row ${index + 1} has invalid durationMs`);
    return value as Span;
  });
}
