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
