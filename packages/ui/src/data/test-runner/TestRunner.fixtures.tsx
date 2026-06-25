import { Button } from "../../components/button";
import type { TestNodeAdapter } from "./adapter";
import type { Test } from "./types";

const ms = (n: number) => n * 1e6;

/** A completed, mixed-status run across go test, ginkgo and fixture frameworks. */
export const completedTests: Test[] = [
  {
    name: "github.com/acme/api/auth",
    framework: "go test",
    route_path: "auth",
    children: [
      {
        name: "TestLogin",
        framework: "go test",
        route_path: "auth/login",
        children: [
          {
            name: "TestLogin/accepts_valid_credentials",
            framework: "go test",
            route_path: "auth/login/valid",
            passed: true,
            duration: ms(42),
          },
          {
            name: "TestLogin/rejects_bad_password",
            framework: "go test",
            route_path: "auth/login/bad",
            failed: true,
            duration: ms(110),
            message: "expected 401, got 200",
            failure_detail: {
              kind: "go_test",
              summary: "login should reject an incorrect password",
              expected: "status 401 Unauthorized",
              actual: "status 200 OK",
              location: "auth/login_test.go:88",
              stack:
                "auth/login_test.go:88 +0x1a4\nauth/login_test.go:71 +0x90\ntesting.tRunner +0xff",
            },
            stdout: "POST /login\n< 200 OK\nsession=abc123\n",
          },
        ],
      },
      {
        name: "TestLogout",
        framework: "go test",
        route_path: "auth/logout",
        passed: true,
        duration: ms(18),
      },
    ],
  },
  {
    name: "billing suite",
    framework: "ginkgo",
    route_path: "billing",
    children: [
      {
        name: "charges a card on checkout",
        framework: "ginkgo",
        route_path: "billing/charge",
        timed_out: true,
        duration: ms(30000),
        message: "context deadline exceeded after 30s",
      },
      {
        name: "issues a refund",
        framework: "ginkgo",
        route_path: "billing/refund",
        skipped: true,
      },
      {
        name: "prorates a mid-cycle upgrade",
        framework: "ginkgo",
        route_path: "billing/prorate",
        passed: true,
        duration: ms(210),
      },
    ],
  },
  {
    name: "setup",
    framework: "fixture",
    route_path: "setup",
    passed: true,
    duration: ms(900),
    detail: { seededRecords: 128, schema: "public", reset: true },
  },
];

/** Same forest, but as an in-flight run: some running, some queued. */
export const runningTests: Test[] = [
  {
    name: "github.com/acme/api/auth",
    framework: "go test",
    route_path: "auth",
    children: [
      {
        name: "TestLogin/accepts_valid_credentials",
        framework: "go test",
        route_path: "auth/login/valid",
        passed: true,
        duration: ms(42),
      },
      {
        name: "TestLogin/rejects_bad_password",
        framework: "go test",
        route_path: "auth/login/bad",
        running: true,
        progress: { phase: "asserting", done: 2, total: 5 },
      },
    ],
  },
  {
    name: "billing suite",
    framework: "ginkgo",
    route_path: "billing",
    children: [
      { name: "charges a card on checkout", framework: "ginkgo", route_path: "billing/charge", pending: true },
      { name: "issues a refund", framework: "ginkgo", route_path: "billing/refund", pending: true },
    ],
  },
];

// --- large / deep payload generators (deterministic) ---------------------

/** A wide, deeply-nested object so JsonView must scroll + lazily collapse. */
function deepObject(depth: number, breadth: number, seed = 0): Record<string, unknown> {
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
        detail: { summary: { total: 500, ok: 400, failed: 100 }, rows: wideArray },
      },
    ],
  },
];

const FRAMEWORKS = ["go test", "ginkgo", "fixture"] as const;
const frameworkFor = (seed: number): string => FRAMEWORKS[seed % FRAMEWORKS.length] ?? "fixture";

// Every leaf carries the same heavy payload shape as the LargePayloads story —
// a deep object, the 500-row array under summary/rows, and the 800-line log —
// so opening any leaf in the large tree exercises JsonView + LogViewer at scale.
// Shared by reference across all ~1024 leaves (like `wideArray`/`hugeLog`): a
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
function bigSubtree(path: string, depth: number, breadth: number, seed: number): Test {
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
 * A very large forest (4 roots × depth 4 × breadth 4 ≈ several hundred nodes)
 * whose every leaf carries the LargePayloads-sized detail (deep object +
 * 500-row array + 800-line log). Used for the dialog stress test: a long
 * scrolling tree on the left and very large detail payloads on the right.
 */
export const largeTreeTests: Test[] = Array.from({ length: 4 }, (_, i) =>
  bigSubtree(`${i}`, 4, 4, i + 1),
);

/**
 * Demo adapter proving the registry extension point: nodes named "setup" get a
 * custom detail body, an extra "Context" tab, and a node action — the seam that
 * lets a downstream host drop its DetailPanel wrapper.
 */
export const setupAdapter: TestNodeAdapter = {
  id: "demo-setup",
  match: (node) => node.name === "setup",
  // Demonstrates the framework-icon override: a host can return any node here
  // (e.g. a brand logo from its own icon provider) instead of the built-in glyph.
  renderFrameworkIcon: () => <span className="text-xs text-violet-600">★</span>,
  renderRowLeading: () => <span className="text-xs text-violet-600">⚙</span>,
  renderDetail: ({ node }) => {
    const detail = (node.detail ?? {}) as Record<string, unknown>;
    return (
      <div className="space-y-2 p-density-4 text-sm">
        <p className="font-medium text-violet-700 dark:text-violet-300">Custom setup panel</p>
        <p className="text-muted-foreground">
          Rendered by a host-registered adapter instead of the default body.
        </p>
        <ul className="list-disc pl-5">
          {Object.entries(detail).map(([k, v]) => (
            <li key={k}>
              <span className="font-mono text-xs">{k}</span>: {String(v)}
            </li>
          ))}
        </ul>
      </div>
    );
  },
  detailTabs: ({ node }) => [
    {
      id: "context",
      label: "Context",
      render: () => (
        <div className="p-density-4 text-sm text-muted-foreground">
          Context tab for <span className="font-mono">{node.name}</span>.
        </div>
      ),
    },
  ],
  nodeActions: ({ node }) => (
    <Button size="sm" variant="outline" onClick={() => window.alert(`Re-run step: ${node.name}`)}>
      Re-run step
    </Button>
  ),
  ownsScroll: () => false,
};
