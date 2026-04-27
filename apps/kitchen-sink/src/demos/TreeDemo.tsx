import { useState } from "react";
import { Badge, Icon, Tree } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

type Test = {
  id: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  duration?: number;
  children?: Test[];
};

const suiteGroups = [
  {
    id: "auth",
    name: "group: auth",
    status: "passed" as const,
    tests: [
      { id: "login", name: "logs in", status: "passed" as const, duration: 42 },
      { id: "logout", name: "logs out", status: "passed" as const, duration: 18 },
      { id: "mfa", name: "requires mfa", status: "passed" as const, duration: 67 },
      { id: "session", name: "expires session", status: "skipped" as const },
    ],
  },
  {
    id: "billing",
    name: "group: billing",
    status: "failed" as const,
    tests: [
      { id: "charge", name: "charges card", status: "failed" as const, duration: 210 },
      { id: "refund", name: "refunds card", status: "passed" as const, duration: 64 },
      { id: "invoice", name: "renders invoice", status: "passed" as const, duration: 31 },
      { id: "ledger", name: "syncs ledger export", status: "failed" as const, duration: 155 },
    ],
  },
  {
    id: "checkout",
    name: "group: checkout",
    status: "passed" as const,
    tests: [
      { id: "cart", name: "persists cart", status: "passed" as const, duration: 25 },
      { id: "coupon", name: "applies coupon", status: "passed" as const, duration: 21 },
      { id: "tax", name: "calculates tax", status: "passed" as const, duration: 29 },
      { id: "address", name: "validates address", status: "passed" as const, duration: 36 },
    ],
  },
  {
    id: "search",
    name: "group: search",
    status: "passed" as const,
    tests: [
      { id: "ranking", name: "ranks results", status: "passed" as const, duration: 47 },
      { id: "facets", name: "updates facets", status: "passed" as const, duration: 39 },
      { id: "spellcheck", name: "suggests spellcheck", status: "skipped" as const },
      {
        id: "availability",
        name: "shows availability badges",
        status: "passed" as const,
        duration: 52,
      },
    ],
  },
  {
    id: "ops",
    name: "group: ops",
    status: "failed" as const,
    tests: [
      { id: "alerts", name: "sends alert digest", status: "passed" as const, duration: 74 },
      { id: "runbook", name: "links runbook", status: "passed" as const, duration: 33 },
      { id: "drain", name: "drains node safely", status: "failed" as const, duration: 126 },
      { id: "rollback", name: "rolls back deployment", status: "passed" as const, duration: 84 },
    ],
  },
];

const tests: Test[] = [
  {
    id: "root",
    name: "my-suite",
    status: "failed",
    children: suiteGroups.map((group) => ({
      id: group.id,
      name: group.name,
      status: group.status,
      children: group.tests.map((test) => {
        const node: Test = {
          id: `${group.id}-${test.id}`,
          name: test.name,
          status: test.status,
        };
        if (test.duration !== undefined) {
          node.duration = test.duration;
        }
        return node;
      }),
    })),
  },
];

export function TreeDemo() {
  const [selected, setSelected] = useState<Test | null>(null);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  return (
    <DemoSection
      id="tree"
      title="Tree / TreeNode"
      description="Generic render-prop tree primitive — consumer owns the row content. Large trees now surface an inline filter automatically."
    >
      <DemoRow>
        <button
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent"
          onClick={() => setExpandAll(true)}
        >
          Expand all
        </button>
        <button
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent"
          onClick={() => setExpandAll(false)}
        >
          Collapse all
        </button>
        <span className="text-xs text-muted-foreground">
          Selected: {selected?.name ?? "(none)"}
        </span>
      </DemoRow>
      <Tree<Test>
        roots={tests}
        getChildren={(t) => t.children}
        getKey={(t) => t.id}
        expandAll={expandAll}
        selected={selected}
        onSelect={setSelected}
        defaultOpen={(t, d) => d < 1 || t.status === "failed"}
        renderRow={({ node }) => {
          const icon =
            node.status === "passed"
              ? "codicon:pass"
              : node.status === "failed"
                ? "codicon:error"
                : "codicon:debug-pause";
          const tone =
            node.status === "passed" ? "success" : node.status === "failed" ? "danger" : "warning";
          return (
            <>
              <Icon name={icon} />
              <span className="truncate flex-1">{node.name}</span>
              {node.duration !== undefined && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {node.duration}ms
                </span>
              )}
              <Badge tone={tone} size="sm">
                {node.status}
              </Badge>
            </>
          );
        }}
      />
    </DemoSection>
  );
}
