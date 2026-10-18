// The typed step-kind detail gavel's fixture verifier attaches to a node
// (fixtures/verifier/report.go): `detail.step` names the kind and id, beside
// the structured `wait`, `attempts`, `exports`, `outputs` and (for a
// background Playwright watcher) `events`. Parsed here, once, so the detail
// view and the copy brief read the same typed shape. A present-but-malformed
// field is reported by path instead of being guessed at.

import type { BriefSection } from "../test-runner";
import { formatTestDuration } from "../test-runner";
import type { VerifyNode } from "./verify-report";

export type StepRef = { id: string; kind: string };

export type WaitPolicy = {
  until?: string;
  failWhen?: string;
  interval?: string;
  backoff?: { factor?: number; max?: string };
  jitter?: string;
  timeout?: string;
};

export const WAIT_OUTCOMES = ["satisfied", "failed", "timeout"] as const;
export type WaitOutcome = (typeof WAIT_OUTCOMES)[number];

export type WaitDetail = {
  policy: WaitPolicy;
  outcome: WaitOutcome;
  durationMs: number;
  /** The CEL expression that decided the outcome: policy.failWhen when it fired, else policy.until. */
  expression?: string;
  /** Domain reason the wait ended unsatisfied; may span several lines. */
  cause?: string;
  outputs?: unknown;
  error?: string;
  trace?: string;
};

export type StepAttempt = { attempt: number; status: string; error?: string; durationMs?: number; result?: VerifyNode };

export type StepExport = { name: string; value: unknown; step: string };

export const WATCHER_EVENT_TYPES = ["alert", "console", "pageerror", "response"] as const;
export type WatcherEventType = (typeof WATCHER_EVENT_TYPES)[number];

export type WatcherEvent = {
  type: WatcherEventType;
  text?: string;
  url?: string;
  status?: number;
  detail?: string;
};

export type StepDetail = {
  step: StepRef;
  outputs?: unknown;
  exports: StepExport[];
  wait?: WaitDetail;
  attempts: StepAttempt[];
  events: WatcherEvent[];
  /** Whether the step runs in the background until teardown (a watcher). */
  background: boolean;
  /** Everything else in `node.detail` (cel_trace, run, recordings, …). */
  rest: Record<string, unknown>;
};

export type StepDetailResult =
  | { kind: "none" }
  | { kind: "step"; step: StepDetail }
  | { kind: "invalid"; error: string };

const STEP_KEYS = new Set(["step", "outputs", "exports", "wait", "attempts", "events", "background"]);

class StepDetailError extends Error {}

function fail(path: string, expectation: string): never {
  throw new StepDetailError(`${path} must be ${expectation}`);
}

type Rec = Record<string, unknown>;

const isRecord = (value: unknown): value is Rec =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function record(value: unknown, path: string): Rec {
  return isRecord(value) ? value : fail(path, "an object");
}

function list(value: unknown, path: string): unknown[] {
  return Array.isArray(value) ? value : fail(path, "an array");
}

function str(value: unknown, path: string): string {
  return typeof value === "string" ? value : fail(path, "a string");
}

function num(value: unknown, path: string): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fail(path, "a number");
}

function bool(value: unknown, path: string): boolean {
  return typeof value === "boolean" ? value : fail(path, "a boolean");
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  return allowed.includes(value as T)
    ? (value as T)
    : fail(path, `one of ${allowed.join(", ")} (got ${JSON.stringify(value)})`);
}

/** `{ [key]: read(value) }` when the optional field is present, else `{}` — absent stays an absent key. */
function optional<K extends string, T>(source: Rec, key: K, read: (value: unknown) => T): { [P in K]?: T } {
  return source[key] === undefined || source[key] === null ? {} : ({ [key]: read(source[key]) } as { [P in K]?: T });
}

/** Durations arrive as Go-style strings ("15s"); a bare number is nanoseconds like every other duration on the wire. */
function durationText(value: unknown, path: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return formatTestDuration(value);
  return fail(path, "a duration string or nanosecond number");
}

function scalarText(value: unknown, path: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fail(path, "a string or number");
}

function readPolicy(value: unknown): WaitPolicy {
  const path = "detail.wait.policy";
  const policy = record(value, path);
  const backoff = (raw: unknown) => {
    const b = record(raw, `${path}.backoff`);
    return {
      ...optional(b, "factor", (v) => num(v, `${path}.backoff.factor`)),
      ...optional(b, "max", (v) => durationText(v, `${path}.backoff.max`)),
    };
  };
  return {
    ...optional(policy, "until", (v) => str(v, `${path}.until`)),
    ...optional(policy, "failWhen", (v) => str(v, `${path}.failWhen`)),
    ...optional(policy, "interval", (v) => durationText(v, `${path}.interval`)),
    ...optional(policy, "backoff", backoff),
    ...optional(policy, "jitter", (v) => scalarText(v, `${path}.jitter`)),
    ...optional(policy, "timeout", (v) => durationText(v, `${path}.timeout`)),
  };
}

function readWait(value: unknown): WaitDetail {
  const wait = record(value, "detail.wait");
  return {
    policy: readPolicy(wait.policy ?? {}),
    outcome: oneOf(wait.outcome, WAIT_OUTCOMES, "detail.wait.outcome"),
    durationMs: nonnegative(wait.durationMs, "detail.wait.durationMs"),
    ...(wait.outputs === undefined ? {} : { outputs: wait.outputs }),
    ...optional(wait, "expression", (v) => str(v, "detail.wait.expression")),
    ...optional(wait, "cause", (v) => str(v, "detail.wait.cause")),
    ...optional(wait, "error", (v) => str(v, "detail.wait.error")),
    ...optional(wait, "trace", (v) => str(v, "detail.wait.trace")),
  };
}

function nonnegative(value: unknown, path: string): number {
  const result = num(value, path);
  return result >= 0 ? result : fail(path, "non-negative");
}

function readAttemptResult(value: unknown, path: string): VerifyNode {
  const node = record(value, path);
  str(node.name, `${path}.name`);
  for (const key of ["framework", "message", "command", "work_dir", "stdout", "stderr"]) {
    if (node[key] !== undefined) str(node[key], `${path}.${key}`);
  }
  for (const key of ["passed", "failed", "timed_out", "warned", "skipped", "pending", "running"]) {
    if (node[key] !== undefined) bool(node[key], `${path}.${key}`);
  }
  if (node.duration !== undefined) nonnegative(node.duration, `${path}.duration`);
  if (node.children !== undefined) list(node.children, `${path}.children`).forEach((child, i) => readAttemptResult(child, `${path}.children[${i}]`));
  return { ...node, name: str(node.name, `${path}.name`) } as VerifyNode;
}

function readAttempt(value: unknown, index: number): StepAttempt {
  const path = `detail.attempts[${index}]`;
  const a = record(value, path);
  return {
    attempt: num(a.attempt, `${path}.attempt`),
    status: str(a.status, `${path}.status`),
    ...optional(a, "error", (v) => str(v, `${path}.error`)),
    ...optional(a, "durationMs", (v) => nonnegative(v, `${path}.durationMs`)),
    ...optional(a, "result", (v) => readAttemptResult(v, `${path}.result`)),
  };
}

function readAttempts(value: unknown): StepAttempt[] {
  const attempts = list(value, "detail.attempts").map(readAttempt);
  attempts.forEach((attempt, index) => {
    if (attempt.attempt !== index + 1) fail(`detail.attempts[${index}].attempt`, `the sequence number ${index + 1}`);
  });
  return attempts;
}

function readExports(value: unknown): StepExport[] {
  return Object.entries(record(value, "detail.exports")).map(([name, raw]) => {
    const path = `detail.exports.${name}`;
    const entry = record(raw, path);
    return { name, value: entry.value, step: str(entry.step, `${path}.step`) };
  });
}

function readEvent(value: unknown, index: number): WatcherEvent {
  const path = `detail.events[${index}]`;
  const e = record(value, path);
  return {
    type: oneOf(e.type, WATCHER_EVENT_TYPES, `${path}.type`),
    ...optional(e, "text", (v) => str(v, `${path}.text`)),
    ...optional(e, "url", (v) => str(v, `${path}.url`)),
    ...optional(e, "status", (v) => num(v, `${path}.status`)),
    ...optional(e, "detail", (v) => str(v, `${path}.detail`)),
  };
}

function readStep(detail: Rec): StepDetail {
  const ref = record(detail.step, "detail.step");
  const rest = Object.fromEntries(Object.entries(detail).filter(([key]) => !STEP_KEYS.has(key)));
  return {
    step: { id: str(ref.id, "detail.step.id"), kind: str(ref.kind, "detail.step.kind") },
    ...(detail.outputs === undefined ? {} : { outputs: detail.outputs }),
    exports: detail.exports == null ? [] : readExports(detail.exports),
    ...optional(detail, "wait", readWait),
    attempts: readAttempts(detail.attempts ?? []),
    events: list(detail.events ?? [], "detail.events").map(readEvent),
    background: bool(detail.background ?? false, "detail.background"),
    rest,
  };
}

/**
 * Whether `node.detail` carries a typed step (`detail.step`), and if so its
 * parsed contents. A node without `detail.step` is "none" whatever else its
 * detail holds; a `step` whose fields violate the contract is "invalid" with
 * the offending path, so the view can say so rather than render a guess.
 */
export function readStepDetail(detail: unknown): StepDetailResult {
  if (!isRecord(detail) || detail.step === undefined) return { kind: "none" };
  try {
    return { kind: "step", step: readStep(detail) };
  } catch (error) {
    if (error instanceof StepDetailError) return { kind: "invalid", error: error.message };
    throw error;
  }
}

/** The step detail when there is one, for matchers that only need to know. */
export function hasStepDetail(detail: unknown): boolean {
  return readStepDetail(detail).kind !== "none";
}

/** The fixtures.ExecutionNode fields gavel puts at the top of `node.detail`, shown as a header instead of raw JSON. */
export type ExecutionHeader = {
  kind?: string;
  state?: string;
  file?: string;
  sectionPath?: string;
  /** Zero-based row of the step within its section. */
  rowIndex?: number;
  line?: number;
  startedAt?: string;
  finishedAt?: string;
  /** Nanoseconds. */
  durationNs?: number;
  error?: string;
};

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/**
 * Splits the ExecutionNode fields (name, kind, state, origin, started_at,
 * finished_at, duration, error) off `detail` into a header, dropping the
 * internal `key`. A field of an unexpected type is not consumed — it stays in
 * `rest`, so it is visible in the raw block rather than silently hidden.
 */
export function splitExecutionDetail(detail: unknown): { header: ExecutionHeader; rest: unknown } {
  if (!isRecord(detail)) return { header: {}, rest: detail };
  const rest: Rec = { ...detail };
  delete rest.key;
  const take = <T>(key: string, guard: (value: unknown) => value is T): T | undefined => {
    const value = rest[key];
    if (!guard(value)) return undefined;
    delete rest[key];
    return value;
  };
  const header: ExecutionHeader = {};
  const assign = <K extends keyof ExecutionHeader>(field: K, value: ExecutionHeader[K] | undefined) => {
    if (value !== undefined) header[field] = value;
  };
  take("name", isString);
  assign("kind", take("kind", isString));
  assign("state", take("state", isString));
  assign("startedAt", take("started_at", isString));
  assign("finishedAt", take("finished_at", isString));
  assign("durationNs", take("duration", isNumber));
  assign("error", take("error", isString));
  const origin = take("origin", isRecord);
  if (origin) {
    assign("file", isString(origin.file) ? origin.file : undefined);
    assign("sectionPath", isString(origin.section_path) ? origin.section_path : undefined);
    assign("rowIndex", isNumber(origin.row_index) ? origin.row_index : undefined);
    assign("line", isNumber(origin.line) ? origin.line : undefined);
  }
  return { header, rest: Object.keys(rest).length > 0 ? rest : undefined };
}

export type WaitCondition = "until" | "failWhen";

/** Which of the wait's two conditions decided its outcome. `expression` is authoritative; older payloads without it are inferred from the outcome. */
export function waitDecidedBy(wait: WaitDetail): WaitCondition {
  if (wait.expression !== undefined) return wait.expression === wait.policy.failWhen ? "failWhen" : "until";
  return wait.outcome === "failed" && wait.policy.failWhen ? "failWhen" : "until";
}

/** `09:00:04` from an RFC 3339 timestamp, as written (no timezone conversion); anything else verbatim. */
export function clockTime(at: string): string {
  return /T(\d{2}:\d{2}:\d{2})/.exec(at)?.[1] ?? at;
}

export function formatDelay(ms: number): string {
  return ms <= 0 ? "0ms" : formatTestDuration(ms * 1e6);
}

/** `every 1s · backoff ×1.5 up to 10s · jitter ±20% · timeout 3m`, skipping what the policy leaves unset. */
export function policySummary(policy: WaitPolicy): string {
  const backoff = [
    policy.backoff?.factor !== undefined && `×${policy.backoff.factor}`,
    policy.backoff?.max && `up to ${policy.backoff.max}`,
  ].filter(Boolean);
  return [
    policy.interval && `every ${policy.interval}`,
    backoff.length > 0 && `backoff ${backoff.join(" ")}`,
    policy.jitter && `jitter ±${policy.jitter}`,
    policy.timeout && `timeout ${policy.timeout}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatExportValue(value: unknown): string {
  if (value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function waitCopy(wait: WaitDetail): BriefSection {
  const { policy } = wait;
  const lines = [
    `outcome: ${wait.outcome}`,
    `elapsed: ${formatDelay(wait.durationMs)}`,
    `policy: ${policySummary(policy)}`,
    policy.until && `until: ${policy.until}`,
    policy.failWhen && `failWhen: ${policy.failWhen}`,
    wait.expression && `decided by: ${wait.expression}`,
    wait.cause && `cause: ${wait.cause}`,
    wait.error && `error: ${wait.error}`,
    wait.trace && `trace: ${wait.trace}`,
    wait.outputs !== undefined && `outputs: ${JSON.stringify(wait.outputs)}`,
  ];
  return { title: "Wait", body: lines.filter(Boolean).join("\n") };
}

function attemptLine(a: StepAttempt): string {
  const head = [`#${a.attempt}`, a.status, a.durationMs !== undefined && formatDelay(a.durationMs)];
  return `${head.filter(Boolean).join(" ")}${a.error ? ` — ${a.error}` : ""}`;
}

function eventLine(e: WatcherEvent): string {
  const body = [e.status, e.text, e.url].filter((part) => part !== undefined).join(" ");
  return `[${e.type}]${body ? ` ${body}` : ""}${e.detail ? ` — ${e.detail}` : ""}`;
}

/** Brief sections for the "Copy details" button: wait trace, retry attempts, exports and watcher events. */
export function stepKindCopy(step: StepDetail): BriefSection[] {
  return [
    ...(step.outputs !== undefined ? [{ title: "Outputs", body: JSON.stringify(step.outputs, null, 2), lang: "json" }] : []),
    ...(step.wait ? [waitCopy(step.wait)] : []),
    ...(step.attempts.length > 0 ? [{ title: "Attempts", body: step.attempts.map(attemptLine).join("\n") }] : []),
    ...(step.exports.length > 0
      ? [{ title: "Exports", body: step.exports.map((e) => `${e.name}=${formatExportValue(e.value)} (from ${e.step})`).join("\n") }]
      : []),
    ...(step.events.length > 0 ? [{ title: "Events", body: step.events.map(eventLine).join("\n") }] : []),
  ];
}
