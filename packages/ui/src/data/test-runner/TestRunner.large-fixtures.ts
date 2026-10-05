import type { Test } from "./types";

const ms = (n: number) => n * 1e6;

// --- large / deep payload generators (deterministic) ---------------------

/** A wide, deeply-nested object so JsonView must scroll + lazily collapse. */
function deepObject(
  depth: number,
  breadth: number,
  seed = 0,
): Record<string, unknown> {
  const node: Record<string, unknown> = {
    id: `node-${seed}`,
    label: `Generated record ${seed} with a deliberately verbose label to force horizontal overflow in the JSON viewer`,
    enabled: seed % 2 === 0,
    score: Number((seed * 1.37).toFixed(4)),
    tags: Array.from({ length: breadth }, (_, i) => `tag-${seed}-${i}`),
    metrics: { p50: seed, p95: seed * 4, p99: seed * 9, samples: seed * 1000 },
  };
  if (depth > 0) {
    node.children = Array.from({ length: breadth }, (_, i) =>
      deepObject(depth - 1, breadth, seed * breadth + i + 1),
    );
  }
  return node;
}

/** A long array of rows — exercises a tall, flat JsonView. */
const wideArray = Array.from({ length: 500 }, (_, i) => ({
  index: i,
  policyNumber: `POL-${String(i).padStart(6, "0")}`,
  status: i % 5 === 0 ? "FAILED" : "OK",
  durationMs: (i * 13) % 900,
  message: `row ${i}: processed with a moderately long human-readable status note`,
}));

/** Many lines of output to exercise the collapsible LogViewer at scale. */
const hugeLog = Array.from(
  { length: 800 },
  (_, i) =>
    `[2026-06-09T17:${String(i % 60).padStart(2, "0")}:00Z] step ${i} :: emitting record ${i} with a long-unbroken-token-${"x".repeat(40)} and trailing context`,
).join("\n");

/**
 * A suite whose leaves carry very large payloads: a 6×4 deep object, a
 * 500-row array, and an 800-line log — to stress JsonView, LogViewer, and the
 * detail pane's independent scrolling.
 */
export const largeDetailTests: Test[] = [
  {
    name: "data pipeline",
    framework: "fixture",
    route_path: "pipeline",
    children: [
      {
        name: "hydrates the full entity graph",
        framework: "fixture",
        route_path: "pipeline/graph",
        passed: true,
        duration: ms(4200),
        detail: deepObject(6, 4),
      },
      {
        name: "imports 500 policy rows",
        framework: "fixture",
        route_path: "pipeline/import",
        failed: true,
        duration: ms(9100),
        message: "100 of 500 rows failed validation",
        stdout: hugeLog,
        detail: {
          summary: { total: 500, ok: 400, failed: 100 },
          rows: wideArray,
        },
      },
    ],
  },
];

const FRAMEWORKS = ["go test", "ginkgo", "fixture"] as const;
const frameworkFor = (seed: number): string =>
  FRAMEWORKS[seed % FRAMEWORKS.length] ?? "fixture";

// Every leaf carries the same heavy payload shape as the LargePayloads story —
// a deep object, the 500-row array under summary/rows, and the 800-line log —
// so opening any leaf in the large tree exercises JsonView + LogViewer at scale.
// Shared by reference across all ~256 leaves (like `wideArray`/`hugeLog`): a
// fresh per-leaf `deepObject(5, 3, seed)` allocated ~190MB at module load, which
// OOM'd the memory-constrained CI vitest worker. One opened leaf renders one
// detail, so a single shared payload preserves the stress without the bloat.
const largeLeafDetail: Record<string, unknown> = {
  summary: { total: 500, ok: 400, failed: 100 },
  rows: wideArray,
  graph: deepObject(5, 3, 7),
};

// Builds one subtree. Containers branch `breadth`-ways down to `depth`; leaves
// carry a large payload + log so any opened leaf stresses the detail pane.
function bigSubtree(
  path: string,
  depth: number,
  breadth: number,
  seed: number,
): Test {
  if (depth === 0) {
    // Vary verdicts so the tree shows the full status spread; ~1 in 6 fails.
    const failed = seed % 6 === 0;
    const skipped = !failed && seed % 5 === 0;
    const leaf: Test = {
      name: `case ${path}`,
      framework: frameworkFor(seed),
      route_path: path,
      passed: !failed && !skipped,
      failed,
      skipped,
      duration: ms(((seed * 17) % 800) + 5),
      stdout: hugeLog,
      detail: largeLeafDetail,
    };
    if (failed) {
      leaf.message = `assertion failed in case ${path}`;
      leaf.failure_detail = {
        kind: "gomega",
        summary: `case ${path} did not meet expectations`,
        expected: `ok (${path})`,
        actual: `error at iteration ${seed}`,
        location: `pkg/case_${seed}_test.go:${(seed % 200) + 1}`,
      };
    }
    return leaf;
  }
  return {
    name: `group ${path}`,
    framework: frameworkFor(seed),
    route_path: path,
    children: Array.from({ length: breadth }, (_, i) =>
      bigSubtree(`${path}.${i}`, depth - 1, breadth, seed * breadth + i + 1),
    ),
  };
}

/**
 * A large forest (4 roots × depth 3 × breadth 4 = 340 nodes / 256 leaves) whose
 * every leaf carries the LargePayloads-sized detail (deep object + 500-row array
 * + 800-line log). Used for the dialog stress test: a long scrolling tree on the
 * left and very large detail payloads on the right.
 *
 * Depth is 3, not 4: at depth 4 (~1024 leaves) the jsdom unit test auto-expands
 * the failing branches and renders the whole tree, which OOM'd CI's
 * memory-constrained shared vitest worker (a STACK_TRACE_ERROR on the "very
 * large tree" test) once this package's suite grew. 340 nodes still scrolls and
 * stresses the detail panes while staying within the worker's budget; the
 * browser story renders the same fixture without the jsdom memory ceiling.
 */
export const largeTreeTests: Test[] = Array.from({ length: 4 }, (_, i) =>
  bigSubtree(`${i}`, 3, 4, i + 1),
);
