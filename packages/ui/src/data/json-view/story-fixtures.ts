const RECORDS_PER_BATCH = 100;
const BATCH_COUNT = 100;

export const largeJsonSource = JSON.stringify({
  totalRecords: RECORDS_PER_BATCH * BATCH_COUNT,
  batches: Object.fromEntries(
    Array.from({ length: BATCH_COUNT }, (_, batch) => [
      `batch-${String(batch).padStart(3, "0")}`,
      {
        recordCount: RECORDS_PER_BATCH,
        records: Array.from({ length: RECORDS_PER_BATCH }, (_, record) => {
          const index = batch * RECORDS_PER_BATCH + record;
          return {
            id: `record-${String(index).padStart(5, "0")}`,
            service: index % 2 === 0 ? "api" : "worker",
            enabled: index % 5 !== 0,
            durationMs: (index * 13) % 900,
            tags: ["example", `batch-${batch}`],
            description:
              `Record ${index} completed its scheduled work and reported its current health. `.repeat(
                4,
              ),
          };
        }),
      },
    ]),
  ),
});

export const truncatedObjectSource =
  '{\n  "requestId": "run-0042",\n  "service": {\n    "name": "api",\n    "metrics": { "ready": true, "requests": 128, "latencyMs":';
export const truncatedArraySource =
  '{\n  "service": "api",\n  "ports": [8080, 9090, { "name": "metrics", "port":';
export const truncatedStringSource =
  '{\n  "service": "worker",\n  "enabled": true,\n  "message": "The worker was processing a record when';

export const ndjsonSource = [
  '{"timestamp":"2026-01-01T09:00:00Z","service":"api","status":"healthy","requests":128}',
  '{"timestamp":"2026-01-01T09:00:01Z","service":"worker","status":"healthy","jobs":42}',
  '{"timestamp":"2026-01-01T09:00:02Z","service":"scheduler","status":"running","message":"Job started but the connection',
].join("\n");
