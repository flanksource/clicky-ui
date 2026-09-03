// Wire types for captain's VerifyReport — the shared shape a captain workflow
// run and a gavel todo attempt both produce for their verification step. The Go
// twin is written from the same spec, so field names and nesting here are
// canonical; do not deviate without updating both sides.

export type VerifyState =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "errored"
  | "warned"
  | "skipped"
  | "cancelled"
  | "timed_out";

export interface VerifySummary {
  total: number;
  passed: number;
  failed: number;
  warned: number;
  skipped: number;
  pending: number;
  running: number;
  timedout: number;
}

export interface VerifyNodeProgress {
  phase?: string;
  done: number;
  total: number;
}

/** Mirrors the test-runner's `FixtureContext` — a fixture/CEL step's evidence. */
export interface VerifyNodeContext {
  command?: string;
  exit_code?: number;
  cwd?: string;
  cel_expression?: string;
  cel_vars?: Record<string, unknown>;
  expected?: unknown;
  actual?: unknown;
}

export interface VerifyNode {
  name: string;
  framework?: string;
  task_id?: string;
  file?: string;
  line?: number;
  message?: string;
  command?: string;
  work_dir?: string;
  stdout?: string;
  stderr?: string;
  /** Duration in nanoseconds. */
  duration?: number;
  passed?: boolean;
  failed?: boolean;
  warned?: boolean;
  skipped?: boolean;
  pending?: boolean;
  running?: boolean;
  timed_out?: boolean;
  progress?: VerifyNodeProgress;
  context?: VerifyNodeContext;
  detail?: unknown;
  children?: VerifyNode[];
  /**
   * Pre-computed summary for a group node whose children were elided (e.g. a
   * fixture runner reporting a large suite without every leaf). When present,
   * `summarizeVerifyNodes` and `verifyReportTests` both take this summary as
   * the node's contribution and do not recurse into `children`, mirroring
   * Go's `SummarizeNodes` (captain/pkg/api/verify_report.go).
   */
  summary?: VerifySummary;
}

export interface VerifyChecklistItem {
  item: string;
  passed?: boolean | null;
  message?: string;
}

export interface VerifyReport {
  kind: string;
  name?: string;
  ran: boolean;
  passed: boolean;
  reason?: string;
  feedback?: string;
  iteration?: number;
  summary: VerifySummary;
  tests?: VerifyNode[];
  checklist?: VerifyChecklistItem[];
  state: VerifyState;
  started_at?: string;
  finished_at?: string;
  /** Duration in nanoseconds. */
  duration?: number;
}

export function emptyVerifySummary(): VerifySummary {
  return {
    total: 0,
    passed: 0,
    failed: 0,
    warned: 0,
    skipped: 0,
    pending: 0,
    running: 0,
    timedout: 0,
  };
}

/** A single leaf `VerifyNode`'s classification, by the same precedence order
 *  Go's `SummarizeNodes` applies: failed → timed-out → warned → skipped →
 *  running → pending → passed. Returns null for a leaf carrying no status
 *  flag at all (excluded from every bucket, including `total`). */
function leafBucket(node: VerifyNode): keyof Omit<VerifySummary, "total"> | null {
  if (node.failed) return "failed";
  if (node.timed_out) return "timedout";
  if (node.warned) return "warned";
  if (node.skipped) return "skipped";
  if (node.running) return "running";
  if (node.pending) return "pending";
  if (node.passed) return "passed";
  return null;
}

function addVerifySummary(target: VerifySummary, source: VerifySummary): void {
  target.total += source.total;
  target.passed += source.passed;
  target.failed += source.failed;
  target.warned += source.warned;
  target.skipped += source.skipped;
  target.pending += source.pending;
  target.running += source.running;
  target.timedout += source.timedout;
}

/**
 * Mirrors captain's `SummarizeNodes` (captain/pkg/api/verify_report.go): tallies
 * only leaf nodes (a node with children is a container and is never itself
 * counted — its children are) into a `VerifySummary`, applying the same
 * failed → timed-out → warned → skipped → running → pending → passed
 * precedence per leaf. Used to build a `VerifyReport.summary` that stays
 * consistent with its `tests`, the way captain's `Validate` requires.
 *
 * A node carrying its own `summary` (a group whose children were elided)
 * contributes that summary directly and is never recursed into, even when it
 * also carries `children` — parity with Go's `SummarizeNodes`.
 */
export function summarizeVerifyNodes(nodes: VerifyNode[]): VerifySummary {
  const summary = emptyVerifySummary();
  const walk = (list: VerifyNode[]) => {
    for (const node of list) {
      if (node.summary) {
        addVerifySummary(summary, node.summary);
        continue;
      }
      if (node.children && node.children.length > 0) {
        walk(node.children);
        continue;
      }
      const bucket = leafBucket(node);
      if (bucket === null) continue;
      summary[bucket] += 1;
      summary.total += 1;
    }
  };
  walk(nodes);
  return summary;
}
