/**
 * Wire types of the JVM diagnostics agent protocol (`jvm.*` operations).
 * Field names match the agent's JSON so a host can pass responses through
 * unchanged.
 */

export interface JvmStatus {
  /** The agent was installed with runtime mutations enabled. */
  allowMutation: boolean;
  /** java.lang.instrument is attached, so bytecode patches are possible. */
  instrumentation?: boolean;
}

export interface MBeanAttribute {
  name: string;
  type: string;
  description?: string;
  readable: boolean;
  writable: boolean;
  is?: boolean;
}

/** An attribute's metadata together with its last read value, when one was read. */
export interface MBeanAttributeReading extends MBeanAttribute {
  value?: unknown;
}

export interface MBeanParameter {
  name: string;
  type: string;
  description?: string;
}

export interface MBeanOperation {
  name: string;
  returnType: string;
  description?: string;
  /** javax.management.MBeanOperationInfo impact: 0 INFO, 1 ACTION, 2 ACTION_INFO, 3 UNKNOWN. */
  impact?: number;
  signature: MBeanParameter[];
}

export interface MBeanNotification {
  name: string;
  description?: string;
  types: string[];
}

export interface MBeanInfo {
  objectName: string;
  className: string;
  description?: string;
  attributes: MBeanAttribute[];
  operations: MBeanOperation[];
  notifications: MBeanNotification[];
}

export interface MBeanAttributeValue {
  name: string;
  value: unknown;
}

export interface MBeanWriteRequest {
  objectName: string;
  attribute: string;
  value: unknown;
}

export interface MBeanInvokeRequest {
  objectName: string;
  operation: string;
  /** Parameter types, in order; selects the overload. */
  signature: string[];
  args: unknown[];
}

/* ---------- threads (jvm.threads, jvm.threads.stack, jvm.threads.dump) ---------- */

/** java.lang.Thread.State, as the agent sends it (upper case). */
export type JvmThreadState = "NEW" | "RUNNABLE" | "BLOCKED" | "WAITING" | "TIMED_WAITING" | "TERMINATED" | (string & {});

export interface JvmThread {
  id: number;
  name: string;
  state: JvmThreadState;
  daemon: boolean;
  priority?: number;
  /** CPU over the sample window; null when the JVM does not measure thread CPU time. */
  cpuPercent: number | null;
  cpuTimeMs: number | null;
  blockedCount?: number;
  blockedTimeMs?: number;
  waitedCount?: number;
  waitedTimeMs?: number;
  lockName: string | null;
  lockOwnerId: number | null;
  lockOwnerName: string | null;
  inNative?: boolean;
  suspended?: boolean;
}

export interface JvmThreadsSnapshot {
  sampledMs: number;
  cpuTimeEnabled: boolean;
  /** Ids of threads in a monitor or ownable-synchronizer deadlock. */
  deadlocked: number[];
  threads: JvmThread[];
}

export interface JvmStackFrame {
  className: string;
  methodName: string;
  fileName?: string;
  /** -1 when unknown, -2 for a native method. */
  lineNumber: number;
}

export interface JvmThreadStack {
  thread: JvmThread;
  /** The thread's jstack-format text. */
  text: string;
  frames: JvmStackFrame[];
}

/* ---------- classes (jvm.loaders, jvm.classes, jvm.classes.*) ---------- */

export interface JvmClassLoader {
  /** Identity used by every class operation's `loader` parameter. */
  hash: string;
  label: string;
  className: string;
  classCount: number;
  /** application, bootstrap, platform, … */
  kind: string;
  /** A browsing group of several loaders; not a valid target for writes. */
  virtual?: boolean;
}

export interface JvmClassRef {
  name: string;
  loader: string;
}

export interface JvmClassQuery {
  query?: string;
  loader?: string;
  limit?: number;
  offset?: number;
  includePlatform?: boolean;
}

export interface JvmClassPage {
  total: number;
  offset: number;
  limit: number;
  classes: JvmClassRef[];
}

export interface JvmClassTarget {
  class: string;
  loader?: string;
  method?: string;
}

export interface JvmMethodRange {
  name: string;
  /** JVM descriptor, e.g. `(Ljava/lang/String;)D`. */
  descriptor: string;
  /** First and last line of the method in the decompiled source (1-based). */
  line: number;
  endLine: number;
}

export interface JvmClassSource {
  class: string;
  loader: string;
  source: string;
  methods: JvmMethodRange[];
  /** Original bytecode line number for each decompiled source line (index = row - 1); 0 when unmapped. */
  sourceLineNumbers: number[];
  decompiler: string;
  digest: string;
}

export interface CompileDiagnostic {
  /** ERROR, WARNING, NOTE, … */
  kind: string;
  line: number;
  column: number;
  message: string;
}

export interface JvmCompileRequest extends JvmClassTarget {
  source: string;
  classpath?: string;
}

export interface JvmCompilation {
  success: boolean;
  diagnostics: CompileDiagnostic[];
  applied?: boolean;
  classes?: string[];
}

export interface JvmPatchRequest extends JvmCompileRequest {
  /** Restore the original bytecode after this many seconds unless renewed. */
  leaseSeconds: number;
}

export interface JvmPatch {
  class: string;
  loader: string;
  patched: boolean;
  /** Epoch ms when the lease restores the original bytecode; absent or null without a lease. */
  leaseExpiresAt?: number | null;
  digest?: string;
  originalDigest?: string;
  /** The class could not be inspected, e.g. it is no longer loaded. */
  error?: string;
}

/* ---------- metrics (jvm.metrics) ---------- */

export interface JvmMemoryPool {
  name: string;
  /** HEAP, NON_HEAP or BUFFER. */
  type?: string;
  used: number;
  committed: number;
  /** -1 when the pool has no maximum. */
  max: number;
}

export interface JvmGarbageCollector {
  name: string;
  collectionCount: number;
  /** Accumulated collection time in ms. */
  collectionTime: number;
}

export interface JvmRuntimeInfo {
  javaVersion: string;
  javaHome?: string;
  osName: string;
  osVersion: string;
  processors: number;
  /** Negative when the OS does not report it. */
  systemLoadAverage: number;
  /** ms since JVM start. */
  uptime: number;
}

/** A pool MBean's selected attributes (Tomcat connector threads, connection pools). */
export type JvmPoolMetric = { name: string; objectName?: string } & Record<string, unknown>;

export interface JvmMetrics {
  capturedAt: string;
  runtime: JvmRuntimeInfo;
  processCpuPercent: number | null;
  memory: { heap: JvmMemoryPool[]; nonHeap: JvmMemoryPool[]; buffer: JvmMemoryPool[] };
  garbageCollectors: JvmGarbageCollector[];
  connectors: JvmPoolMetric[];
  dataSources: JvmPoolMetric[];
}

/* ---------- logging (jvm.logging.*) ---------- */

export interface JvmLogger {
  /** "" names the root logger. */
  name: string;
  /** null inherits the parent's level. */
  level: string | null;
  /** null for the root logger. */
  parent: string | null;
}

/* ---------- expressions (jvm.ognl.eval, jvm.groovy.eval) ---------- */

export interface JvmOgnlRequest {
  expression: string;
  loader?: string;
}

export interface JvmGroovyRequest {
  source: string;
  loader?: string;
  args?: Record<string, unknown>;
  timeoutSeconds?: number;
}

/** An evaluation's result: the plain `value` and/or an object `graph` (clicky-ui `ObjectGraphNode` shape). */
export interface JvmEvaluation {
  value?: unknown;
  graph?: unknown;
  stdout?: string;
  stderr?: string;
  elapsedMs?: number;
}
