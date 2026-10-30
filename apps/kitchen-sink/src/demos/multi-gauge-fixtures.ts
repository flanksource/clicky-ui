export const JVM_OBSERVATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export type ResourceReading = {
  average: number;
  request?: number;
  limit: number;
  p90: number;
  p95: number;
};

export type WorkloadReading = {
  pod: string;
  deployment: string;
  container: string;
  cpu: ResourceReading;
  memory: ResourceReading;
  heap: ResourceReading;
  eden: ResourceReading;
  survivor: ResourceReading;
  old: ResourceReading;
  metaspace: ResourceReading;
  codeCache: ResourceReading;
  direct: ResourceReading;
  gc: {
    count: number;
    timeMs: number;
    p90Ms: number;
    p95Ms: number;
    maxMs: number;
    percentP90: number;
    percentP95: number;
  };
  threads: { live: number; daemon: number; peak: number; blocked: number };
};

function mib(reading: ResourceReading): ResourceReading {
  return {
    average: reading.average * 1024 ** 2,
    limit: reading.limit * 1024 ** 2,
    p90: reading.p90 * 1024 ** 2,
    p95: reading.p95 * 1024 ** 2,
    ...(reading.request === undefined
      ? {}
      : { request: reading.request * 1024 ** 2 }),
  };
}

export const workloadReadings: WorkloadReading[] = [
  {
    pod: "api-7bd9f8-k2m4n",
    deployment: "api",
    container: "server",
    cpu: { average: 0.42, request: 0.5, limit: 2, p90: 0.76, p95: 1.1 },
    memory: mib({
      average: 1382,
      request: 2048,
      limit: 4096,
      p90: 2662,
      p95: 3174,
    }),
    heap: mib({
      average: 840,
      request: 1024,
      limit: 2048,
      p90: 1331,
      p95: 1638,
    }),
    eden: mib({ average: 220, limit: 512, p90: 360, p95: 440 }),
    survivor: mib({ average: 44, limit: 128, p90: 72, p95: 96 }),
    old: mib({ average: 576, limit: 1408, p90: 899, p95: 1102 }),
    metaspace: mib({ average: 124, limit: 256, p90: 148, p95: 164 }),
    codeCache: mib({ average: 62, limit: 240, p90: 82, p95: 96 }),
    direct: mib({ average: 92, limit: 256, p90: 148, p95: 188 }),
    gc: { count: 128, timeMs: 3840, p90Ms: 35, p95Ms: 42, maxMs: 84, percentP90: 0.02, percentP95: 0.05 },
    threads: { live: 48, daemon: 16, peak: 64, blocked: 0 },
  },
  {
    pod: "api-7bd9f8-p5q7r",
    deployment: "api",
    container: "server",
    cpu: { average: 0.68, request: 0.5, limit: 2, p90: 1.2, p95: 1.65 },
    memory: mib({
      average: 1843,
      request: 2048,
      limit: 4096,
      p90: 2867,
      p95: 3482,
    }),
    heap: mib({
      average: 1147,
      request: 1024,
      limit: 2048,
      p90: 1690,
      p95: 1864,
    }),
    eden: mib({ average: 310, limit: 512, p90: 430, p95: 480 }),
    survivor: mib({ average: 62, limit: 128, p90: 92, p95: 112 }),
    old: mib({ average: 775, limit: 1408, p90: 1168, p95: 1272 }),
    metaspace: mib({ average: 148, limit: 256, p90: 172, p95: 188 }),
    codeCache: mib({ average: 78, limit: 240, p90: 98, p95: 112 }),
    direct: mib({ average: 152, limit: 256, p90: 198, p95: 224 }),
    gc: { count: 264, timeMs: 12900, p90Ms: 62, p95Ms: 78, maxMs: 160, percentP90: 0.06, percentP95: 0.14 },
    threads: { live: 72, daemon: 18, peak: 96, blocked: 2 },
  },
  {
    pod: "api-7bd9f8-s8t2v",
    deployment: "api",
    container: "server",
    cpu: { average: 0.31, request: 0.5, limit: 2, p90: 0.62, p95: 0.85 },
    memory: mib({
      average: 1229,
      request: 2048,
      limit: 4096,
      p90: 1894,
      p95: 2150,
    }),
    heap: mib({
      average: 655,
      request: 1024,
      limit: 2048,
      p90: 1075,
      p95: 1311,
    }),
    eden: mib({ average: 180, limit: 512, p90: 310, p95: 390 }),
    survivor: mib({ average: 32, limit: 128, p90: 54, p95: 74 }),
    old: mib({ average: 443, limit: 1408, p90: 711, p95: 847 }),
    metaspace: mib({ average: 112, limit: 256, p90: 132, p95: 148 }),
    codeCache: mib({ average: 52, limit: 240, p90: 68, p95: 80 }),
    direct: mib({ average: 64, limit: 256, p90: 104, p95: 136 }),
    gc: { count: 86, timeMs: 2150, p90Ms: 30, p95Ms: 31, maxMs: 62, percentP90: 0.01, percentP95: 0.03 },
    threads: { live: 36, daemon: 14, peak: 48, blocked: 0 },
  },
  {
    pod: "worker-6c8d4f-b3n5m",
    deployment: "worker",
    container: "processor",
    cpu: { average: 1.24, request: 2, limit: 4, p90: 2.4, p95: 3.2 },
    memory: mib({
      average: 3686,
      request: 4096,
      limit: 8192,
      p90: 5325,
      p95: 6554,
    }),
    heap: mib({
      average: 2458,
      request: 2048,
      limit: 4096,
      p90: 3174,
      p95: 3789,
    }),
    eden: mib({ average: 640, limit: 1024, p90: 820, p95: 950 }),
    survivor: mib({ average: 96, limit: 256, p90: 164, p95: 220 }),
    old: mib({ average: 1722, limit: 2816, p90: 2190, p95: 2619 }),
    metaspace: mib({ average: 224, limit: 384, p90: 272, p95: 304 }),
    codeCache: mib({ average: 116, limit: 240, p90: 148, p95: 172 }),
    direct: mib({ average: 384, limit: 1024, p90: 640, p95: 820 }),
    gc: { count: 412, timeMs: 28840, p90Ms: 92, p95Ms: 116, maxMs: 280, percentP90: 0.12, percentP95: 0.31 },
    threads: { live: 96, daemon: 24, peak: 128, blocked: 1 },
  },
  {
    pod: "worker-6c8d4f-c4p6q",
    deployment: "worker",
    container: "processor",
    cpu: { average: 2.6, request: 2, limit: 4, p90: 3.4, p95: 3.8 },
    memory: mib({
      average: 5939,
      request: 4096,
      limit: 8192,
      p90: 7066,
      p95: 7680,
    }),
    heap: mib({
      average: 3174,
      request: 2048,
      limit: 4096,
      p90: 3686,
      p95: 3994,
    }),
    eden: mib({ average: 820, limit: 1024, p90: 940, p95: 1000 }),
    survivor: mib({ average: 164, limit: 256, p90: 220, p95: 246 }),
    old: mib({ average: 2190, limit: 2816, p90: 2526, p95: 2748 }),
    metaspace: mib({ average: 296, limit: 384, p90: 336, p95: 360 }),
    codeCache: mib({ average: 168, limit: 240, p90: 196, p95: 220 }),
    direct: mib({ average: 768, limit: 1024, p90: 912, p95: 984 }),
    gc: { count: 936, timeMs: 121680, p90Ms: 190, p95Ms: 284, maxMs: 640, percentP90: 0.52, percentP95: 1.2 },
    threads: { live: 144, daemon: 32, peak: 192, blocked: 8 },
  },
  {
    pod: "scheduler-5d7f9a-d6r8s",
    deployment: "scheduler",
    container: "scheduler",
    cpu: { average: 0.08, request: 0.25, limit: 1, p90: 0.18, p95: 0.32 },
    memory: mib({
      average: 492,
      request: 512,
      limit: 1024,
      p90: 696,
      p95: 840,
    }),
    heap: mib({ average: 215, request: 256, limit: 512, p90: 328, p95: 430 }),
    eden: mib({ average: 60, limit: 128, p90: 96, p95: 116 }),
    survivor: mib({ average: 12, limit: 32, p90: 20, p95: 28 }),
    old: mib({ average: 143, limit: 352, p90: 212, p95: 286 }),
    metaspace: mib({ average: 56, limit: 128, p90: 68, p95: 80 }),
    codeCache: mib({ average: 24, limit: 64, p90: 32, p95: 40 }),
    direct: mib({ average: 32, limit: 128, p90: 48, p95: 64 }),
    gc: { count: 28, timeMs: 420, p90Ms: 17, p95Ms: 18, maxMs: 36, percentP90: 0.002, percentP95: 0.006 },
    threads: { live: 18, daemon: 8, peak: 24, blocked: 0 },
  },
];
