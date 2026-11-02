import type { Trace, SearchResult } from "./api";

export const traceExample: Trace = {
  summary: { traceId: "0123456789abcdef0123456789abcdef", operation: "POST /orders", service: "checkout", startedAt: "2026-11-02T10:00:00Z", durationMs: 100, spanCount: 5, errors: 0, services: ["checkout"] },
  missingParents: [],
  spans: [
    { traceId: "0123456789abcdef0123456789abcdef", spanId: "root", operation: "POST /orders", service: "checkout", startedAt: "2026-11-02T10:00:00Z", durationMs: 100, status: "ok" },
    ...["orders", "customers", "items"].map((table, i) => ({ traceId: "0123456789abcdef0123456789abcdef", spanId: table, parentId: "root", operation: "SELECT", service: "checkout", startedAt: `2026-11-02T10:00:00.0${i + 1}Z`, durationMs: 2, status: "ok", attributes: { "db.system": "postgresql", "db.sql.table": table, "db.statement": `SELECT * FROM ${table}` } })),
    { traceId: "0123456789abcdef0123456789abcdef", spanId: "model", parentId: "root", operation: "chat example-model", service: "checkout", startedAt: "2026-11-02T10:00:00.05Z", durationMs: 20, status: "ok", attributes: { "gen_ai.operation.name": "chat", "gen_ai.request.model": "example-model", "gen_ai.usage.input_tokens": 123, "gen_ai.usage.output_tokens": 24 } },
  ],
};

export const searchExample: SearchResult = {
  traces: [traceExample.summary], total: 1, services: ["checkout"], attributes: [],
  rootOperations: [{ operation: "POST /orders", count: 1, p50Ms: 100, p95Ms: 100 }],
};
