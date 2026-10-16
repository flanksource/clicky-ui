import { SAMPLE_FACETS, SAMPLE_FACET_ORDER } from "./process-facets";
import type { TraceWindow } from "./TraceWindowList";
import type {
  GoProfileRecord,
  HttpExchangeRow,
  ProcessDescriptor,
  ProcessEnv,
  ProcessNodeRow,
  ProcessSampleRow,
  SqlStatementRow,
  StackFrame,
  StackRecord,
  TerminalEvent,
} from "./types";

export const httpExchangeRows: HttpExchangeRow[] = [
  {
    startedAt: "2026-10-01T09:00:00.000Z",
    feature: "http",
    method: "GET",
    host: "api.example.com",
    url: "https://api.example.com/v1/configs?limit=2",
    status: 200,
    durationMs: 84,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/configs?limit=2",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "Accept", value: "application/json" }],
      queryString: [{ name: "limit", value: "2" }],
      headersSize: 64,
      bodySize: 0,
    },
    response: {
      status: 200,
      statusText: "OK",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "Content-Type", value: "application/json" }],
      // The http kind stores a JSON body as structure, not text.
      content: { size: 42, mimeType: "application/json", text: { items: [{ id: "cfg-1" }, { id: "cfg-2" }] } },
      bodySize: 42,
    },
    timings: { send: 1, wait: 80, receive: 3 },
    serverIPAddress: "203.0.113.10",
  },
  {
    startedAt: "2026-10-01T09:00:01.000Z",
    feature: "http",
    method: "POST",
    host: "api.example.com",
    url: "https://api.example.com/v1/cycles/run",
    status: 503,
    durationMs: 1200,
    request: {
      method: "POST",
      url: "https://api.example.com/v1/cycles/run",
      headers: [{ name: "Content-Type", value: "application/json" }],
      postData: { mimeType: "application/json", text: { cycle: "nightly", token: "****" } },
      bodySize: 36,
    },
    response: {
      status: 503,
      statusText: "Service Unavailable",
      content: { size: 18, mimeType: "text/plain", text: "upstream not ready" },
      bodySize: 18,
    },
  },
  {
    startedAt: "2026-10-01T09:00:02.000Z",
    feature: "http_proxy",
    method: "CONNECT",
    host: "registry.example.com:443",
    url: "registry.example.com:443",
    status: 200,
    durationMs: 5300,
    request: { method: "CONNECT", url: "registry.example.com:443", bodySize: 0 },
    response: { status: 200, statusText: "Connection Established", content: { size: 0 }, bodySize: 0 },
    tunnelled: true,
    bytesIn: 482_113,
    bytesOut: 2_048,
  },
  {
    startedAt: "2026-10-01T09:00:03.000Z",
    feature: "http",
    method: "GET",
    host: "down.example.com",
    url: "https://down.example.com/health",
    status: 0,
    durationMs: 3,
    request: { method: "GET", url: "https://down.example.com/health" },
    response: { status: 0, content: { size: 0 }, bodySize: 0 },
    error: "dial tcp 203.0.113.99:443: connect: connection refused",
  },
];

export const sqlStatementRows: SqlStatementRow[] = [
  {
    startedAt: "2026-10-01T09:00:00.000Z",
    connection: "primary",
    driver: "pgx",
    op: "SELECT",
    tables: ["users", "orgs"],
    sql: "SELECT u.id, o.name FROM users u JOIN orgs o ON o.id = u.org_id WHERE u.id = $1",
    repeatKey: "select-users-by-id",
    args: [41],
    durationMs: 1.8,
    rows: 1,
  },
  {
    startedAt: "2026-10-01T09:00:00.100Z",
    connection: "primary",
    driver: "pgx",
    op: "SELECT",
    tables: ["users", "orgs"],
    sql: "SELECT u.id, o.name FROM users u JOIN orgs o ON o.id = u.org_id WHERE u.id = $1",
    repeatKey: "select-users-by-id",
    args: [42],
    durationMs: 2.4,
    rows: 1,
  },
  {
    startedAt: "2026-10-01T09:00:00.200Z",
    connection: "primary",
    driver: "pgx",
    op: "SELECT",
    tables: ["users", "orgs"],
    sql: "SELECT u.id, o.name FROM users u JOIN orgs o ON o.id = u.org_id WHERE u.id = $1",
    repeatKey: "select-users-by-id",
    args: [43],
    durationMs: 2.1,
    rows: 0,
  },
  {
    startedAt: "2026-10-01T09:00:01.000Z",
    connection: "primary",
    driver: "pgx",
    op: "UPDATE",
    tables: ["jobs"],
    sql: "UPDATE jobs SET state = 'done' WHERE id = 9",
    repeatKey: "update-jobs",
    durationMs: 12.5,
    rows: 1,
  },
  {
    startedAt: "2026-10-01T09:00:02.000Z",
    connection: "primary",
    driver: "pgx",
    op: "INSERT",
    tables: ["audit"],
    sql: "INSERT INTO audit (actor, action) VALUES ($1, $2)",
    repeatKey: "insert-audit",
    durationMs: 0.9,
    rows: -1,
    error: 'relation "audit" does not exist',
  },
];

const SIZE = { width: 40, height: 6 };

/** A short build log: colour, a progress line redrawn with a carriage return, a resize, and a settled screen. */
export const terminalEvents: TerminalEvent[] = [
  { at: "2026-10-01T09:00:00.000Z", offset: 0.1, kind: "o", data: "\u001b[1m$ make build\u001b[0m\r\n", ...SIZE },
  { at: "2026-10-01T09:00:00.600Z", offset: 0.6, kind: "o", data: "\u001b[32mcompiling\u001b[0m 1/3\r", ...SIZE },
  { at: "2026-10-01T09:00:01.100Z", offset: 1.1, kind: "o", data: "\u001b[32mcompiling\u001b[0m 2/3\r", ...SIZE },
  { at: "2026-10-01T09:00:01.600Z", offset: 1.6, kind: "o", data: "\u001b[32mcompiling\u001b[0m 3/3\r\n", ...SIZE },
  { at: "2026-10-01T09:00:02.000Z", offset: 2.0, kind: "r", data: "", width: 60, height: 6 },
  { at: "2026-10-01T09:00:02.200Z", offset: 2.2, kind: "o", data: "\u001b[31mwarning:\u001b[0m 1 unused import\r\n", width: 60, height: 6 },
  { at: "2026-10-01T09:00:03.000Z", offset: 3.0, kind: "o", data: "done\r\n", width: 60, height: 6 },
  {
    at: "2026-10-01T09:00:03.000Z",
    offset: 3.0,
    kind: "snapshot",
    data: "$ make build\ncompiling 3/3\nwarning: 1 unused import\ndone",
    width: 60,
    height: 6,
  },
  { at: "2026-10-01T09:00:03.000Z", offset: 3.0, kind: "exit", data: "", width: 60, height: 6, exitCode: 0, command: "make build" },
];

export const processNodeRows: ProcessNodeRow[] = [
  {
    key: "100:1",
    pid: 100,
    ppid: 1,
    name: "gavel",
    command: "gavel test ./...",
    status: "running",
    isRoot: true,
    startedAt: "2026-10-01T09:00:00.000Z",
    lastSeenAt: "2026-10-01T09:00:30.000Z",
    cpuPercent: 3.5,
    rssBytes: 120_000_000,
    peakCpuPercent: 12,
    peakRssBytes: 140_000_000,
  },
  {
    key: "101:100",
    parentKey: "100:1",
    pid: 101,
    ppid: 100,
    name: "go",
    command: "go test ./pkg/...",
    status: "running",
    startedAt: "2026-10-01T09:00:02.000Z",
    lastSeenAt: "2026-10-01T09:00:30.000Z",
    cpuPercent: 88.2,
    rssBytes: 420_000_000,
    peakCpuPercent: 160,
    peakRssBytes: 512_000_000,
  },
  {
    key: "102:101",
    parentKey: "101:100",
    pid: 102,
    ppid: 101,
    name: "compile",
    command: "compile -o pkg.a",
    status: "exited",
    startedAt: "2026-10-01T09:00:03.000Z",
    exitedAt: "2026-10-01T09:00:09.500Z",
    lastSeenAt: "2026-10-01T09:00:09.000Z",
    cpuPercent: 0,
    rssBytes: 0,
    peakCpuPercent: 95,
    peakRssBytes: 300_000_000,
  },
  {
    // Its parent was never recorded: it renders as a root.
    key: "300:299",
    parentKey: "299:1",
    pid: 300,
    ppid: 299,
    name: "orphan",
    command: "sleep 600",
    status: "sleeping",
    startedAt: "2026-10-01T09:00:05.000Z",
    lastSeenAt: "2026-10-01T09:00:30.000Z",
    cpuPercent: 0,
    rssBytes: 1_200_000,
    peakCpuPercent: 0,
    peakRssBytes: 1_200_000,
  },
];

export const processSampleRows: ProcessSampleRow[] = Array.from({ length: 12 }, (_, tick) => ({
  sampledAt: new Date(Date.UTC(2026, 9, 1, 9, 0, 2 + tick)).toISOString(),
  tick: tick + 1,
  key: "101:100",
  pid: 101,
  cpuPercent: [5, 20, 60, 140, 160, 120, 90, 70, 88, 100, 60, 30][tick] ?? 0,
  memoryPercent: 2 + tick * 0.2,
  rssBytes: 100_000_000 + tick * 30_000_000,
}));

export const processEnvFixture: ProcessEnv = {
  PATH: "/usr/local/bin:/usr/bin",
  HOME: "/home/dev",
  GOFLAGS: "-mod=readonly",
  API_TOKEN: "********",
};

/** processNodeRows with a working directory, the stack transports each process offers, and the root's recorded environment. */
export const processDetailRows: ProcessNodeRow[] = processNodeRows.map((row) => {
  switch (row.key) {
    case "100:1":
      return {
        ...row,
        cwd: "/work/repo",
        stackTransports: [
          { transport: "inprocess", destructive: false },
          { transport: "native", destructive: false },
        ],
        environment: processEnvFixture,
      };
    case "101:100":
      return {
        ...row,
        cwd: "/work/repo/pkg",
        stackTransports: [
          { transport: "native", destructive: false },
          { transport: "sigquit", destructive: true },
        ],
      };
    case "102:101":
      return { ...row, environmentError: "permission denied reading the environment of pid 102" };
    default:
      return row;
  }
});

const frame = (func: string, file: string, line: number): StackFrame => ({ func, file, line });

type GoroutineSpec = {
  id: number;
  state: string;
  waitMinutes?: number;
  frames: StackFrame[];
  createdBy?: StackFrame;
};

/** The checkpoint of a Go dump: one record per goroutine, each with the text it was parsed from. */
function goStackRecords(
  checkpoint: Pick<StackRecord, "checkpointId" | "takenAt" | "reason" | "transport" | "key" | "pid">,
  goroutines: GoroutineSpec[],
): StackRecord[] {
  return goroutines.map(({ id, state, waitMinutes, frames, createdBy }) => ({
    ...checkpoint,
    format: "go",
    goroutineId: id,
    state,
    ...(waitMinutes ? { waitMinutes } : {}),
    frames,
    ...(createdBy ? { createdBy } : {}),
    raw: [
      `goroutine ${id} [${state}${waitMinutes ? `, ${waitMinutes} minutes` : ""}]:`,
      ...frames.flatMap((f) => [`${f.func}(...)`, `\t${f.file}:${f.line}`]),
      ...(createdBy ? [`created by ${createdBy.func}`, `\t${createdBy.file}:${createdBy.line}`] : []),
    ].join("\n"),
  }));
}

const ROOT_CHECKPOINT = { key: "100:1", pid: 100, transport: "inprocess" } as const;

/** A native stack sample, which the UI shows as raw text. */
export const nativeSample = `Sampling process 101 for 1 seconds
Call graph:
    12 Thread_1001  DispatchQueue_1: com.apple.main-thread  (serial)
      12 start  (in dyld) + 6076
        12 main  (in go) + 88
`;

/**
 * `stacks` records: the root dumped twice in-process (a periodic reading, then the watchdog
 * timeout), a busy child sampled natively, and an exited child whose dump failed.
 */
export const stackRecords: StackRecord[] = [
  ...goStackRecords(
    { ...ROOT_CHECKPOINT, checkpointId: "ckpt-periodic", takenAt: "2026-10-01T09:00:10.000Z", reason: "periodic" },
    [
      {
        id: 1,
        state: "running",
        frames: [frame("main.main", "/app/cmd/gavel/main.go", 42), frame("runtime.main", "runtime/proc.go", 250)],
      },
      {
        id: 17,
        state: "chan receive",
        frames: [frame("app/runner.(*Runner).wait", "/app/runner/runner.go", 118)],
        createdBy: frame("app/runner.New", "/app/runner/runner.go", 58),
      },
    ],
  ),
  ...goStackRecords(
    { ...ROOT_CHECKPOINT, checkpointId: "ckpt-timeout", takenAt: "2026-10-01T09:00:28.000Z", reason: "timeout" },
    [
      {
        id: 1,
        state: "running",
        frames: [frame("main.main", "/app/cmd/gavel/main.go", 42), frame("runtime.main", "runtime/proc.go", 250)],
      },
      {
        id: 17,
        state: "chan receive",
        waitMinutes: 2,
        frames: [frame("app/runner.(*Runner).wait", "/app/runner/runner.go", 118)],
        createdBy: frame("app/runner.New", "/app/runner/runner.go", 58),
      },
      {
        id: 22,
        state: "select",
        frames: [frame("database/sql.(*DB).connectionOpener", "database/sql/sql.go", 1196)],
        createdBy: frame("database/sql.OpenDB", "database/sql/sql.go", 791),
      },
    ],
  ),
  {
    checkpointId: "ckpt-native",
    takenAt: "2026-10-01T09:00:29.000Z",
    reason: "manual",
    transport: "native",
    key: "101:100",
    pid: 101,
    format: "native",
    raw: nativeSample,
  },
  {
    checkpointId: "ckpt-exited",
    takenAt: "2026-10-01T09:00:09.800Z",
    reason: "final",
    transport: "native",
    key: "102:101",
    pid: 102,
    format: "",
    raw: "",
    error: "the process exited before a stack could be read",
  },
];

const establishedSocket: ProcessDescriptor = {
  fd: "7",
  type: "IPv4",
  name: "127.0.0.1:8080->127.0.0.1:51044",
  protocol: "TCP",
  state: "ESTABLISHED",
  localAddr: "127.0.0.1:8080",
  remoteAddr: "127.0.0.1:51044",
};
const listeningPort: ProcessDescriptor = {
  fd: "6",
  type: "IPv4",
  name: "*:8080",
  protocol: "TCP",
  state: "LISTEN",
  localAddr: "0.0.0.0:8080",
  port: 8080,
};
const stdin: ProcessDescriptor = { fd: "0", type: "CHR", name: "/dev/null" };
const traceFile: ProcessDescriptor = { fd: "3", type: "REG", name: "/work/repo/.gavel/traces/run-1/process_tree.jsonl" };
const pkgDir: ProcessDescriptor = { fd: "4", type: "DIR", name: "/work/repo/pkg" };
const NO_DESCRIPTORS: ProcessDescriptor[] = [];

const filesEarly = [stdin, traceFile];
const filesMid = [stdin, traceFile, pkgDir];
const filesLate = [stdin, pkgDir];

/** What the process held at each tick; the sample stores a list only when it differs from the previous tick's. */
const openSocket = [establishedSocket];
const listening = [listeningPort];
const heldAt: Record<(typeof SAMPLE_FACET_ORDER)[number], (tick: number) => ProcessDescriptor[]> = {
  openFiles: (tick) => (tick >= 9 ? filesLate : tick >= 5 ? filesMid : filesEarly),
  sockets: (tick) => (tick >= 6 && tick < 10 ? openSocket : NO_DESCRIPTORS),
  ports: () => listening,
  connections: (tick) => (tick >= 6 && tick < 10 ? openSocket : NO_DESCRIPTORS),
};

/**
 * processSampleRows from a session that armed every facet and disk IO. Open files change at
 * ticks 5 and 9, a socket and a connection appear at tick 6 and close at tick 10 (an empty list
 * is not stored), and the listening port never changes, so only tick 1 stores its list.
 */
export const processFacetSampleRows: ProcessSampleRow[] = processSampleRows.map((row) => {
  const sample: ProcessSampleRow = {
    ...row,
    diskReadBytes: row.tick * 4_000_000,
    diskWriteBytes: row.tick * row.tick * 500_000,
  };
  for (const facet of SAMPLE_FACET_ORDER) {
    const { countKey, listKey } = SAMPLE_FACETS[facet];
    const held = heldAt[facet](row.tick);
    sample[countKey] = held.length;
    const changed = row.tick === 1 || held !== heldAt[facet](row.tick - 1);
    if (changed && held.length > 0) sample[listKey] = held;
  }
  return sample;
});

const profileFrame = (func: string, line: number): StackFrame => frame(func, "/app/runner/work.go", line);

const PROFILE_CHECKPOINT = { key: "100:1", pid: 100, source: "pprof", reason: "timeout" } as const;

const cpuStacks: Array<{ frames: StackFrame[]; samples: number; nanos: number }> = [
  {
    frames: [
      profileFrame("app/runner.hashChunk", 88),
      profileFrame("app/runner.(*Runner).process", 61),
      profileFrame("app/runner.(*Runner).Run", 34),
      profileFrame("main.main", 42),
    ],
    samples: 120,
    nanos: 1_200_000_000,
  },
  {
    frames: [
      profileFrame("compress/flate.(*compressor).deflate", 640),
      profileFrame("app/runner.(*Runner).process", 66),
      profileFrame("app/runner.(*Runner).Run", 34),
      profileFrame("main.main", 42),
    ],
    samples: 60,
    nanos: 600_000_000,
  },
  {
    frames: [
      profileFrame("app/runner.hashChunk", 90),
      profileFrame("app/runner.(*Runner).verify", 112),
      profileFrame("app/runner.(*Runner).Run", 36),
      profileFrame("main.main", 42),
    ],
    samples: 30,
    nanos: 300_000_000,
  },
  {
    frames: [profileFrame("runtime.mallocgc", 1200), profileFrame("app/runner.(*Runner).process", 70), profileFrame("main.main", 42)],
    samples: 20,
    nanos: 200_000_000,
  },
];

const heapStacks: Array<{ frames: StackFrame[]; bytes: number; objects: number }> = [
  {
    frames: [profileFrame("bytes.growSlice", 249), profileFrame("app/runner.(*Runner).buffer", 142), profileFrame("main.main", 42)],
    bytes: 96 * 1024 * 1024,
    objects: 96,
  },
  {
    frames: [profileFrame("app/runner.newChunk", 77), profileFrame("app/runner.(*Runner).process", 61), profileFrame("main.main", 42)],
    bytes: 24 * 1024 * 1024,
    objects: 3072,
  },
];

/**
 * `goprof` records: a CPU profile taken at the watchdog timeout (two sample types) and an
 * earlier heap profile (in-use and allocated space).
 */
export const goProfileRecords: GoProfileRecord[] = [
  ...cpuStacks.flatMap((stack, index): GoProfileRecord[] =>
    (
      [
        ["samples", "count", stack.samples],
        ["cpu", "nanoseconds", stack.nanos],
      ] as const
    ).map(([sampleType, unit, value]) => ({
      ...PROFILE_CHECKPOINT,
      checkpointId: "prof-cpu",
      takenAt: "2026-10-01T09:00:28.000Z",
      profile: "cpu",
      sampleType,
      unit,
      value,
      frames: stack.frames,
      stackHash: `cpu-${index}`,
    })),
  ),
  ...heapStacks.flatMap((stack, index): GoProfileRecord[] =>
    (
      [
        ["inuse_objects", "count", stack.objects],
        ["inuse_space", "bytes", stack.bytes],
      ] as const
    ).map(([sampleType, unit, value]) => ({
      ...PROFILE_CHECKPOINT,
      checkpointId: "prof-heap",
      takenAt: "2026-10-01T09:00:12.000Z",
      reason: "periodic",
      profile: "heap",
      sampleType,
      unit,
      value,
      frames: stack.frames,
      stackHash: `heap-${index}`,
    })),
  ),
];

/** Two armed windows of one fixture step: an HTTP capture and a process capture, with chips beyond the six that fit. */
export const traceWindows: TraceWindow[] = [
  {
    kind: "http_proxy",
    stream: "step-1",
    afterSeq: 0,
    toSeq: 0,
    run_id: "run-1",
    count: 2,
    summary: { count: 2, hosts: 1, errors: 0, bytesIn: 4096, bytesOut: 512, p95Ms: 120, slowest: 340, extra: "hidden" },
  },
  { kind: "process_tree", stream: "step-1", afterSeq: 4, toSeq: 9, run_id: "run-1", count: 1, summary: { processes: 4 } },
];
