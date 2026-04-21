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

const tests: Test[] = [
  {
    id: "root",
    name: "my-suite",
    status: "failed",
    children: [
      {
        id: "g1",
        name: "group: auth",
        status: "passed",
        children: [
          { id: "t1", name: "logs in", status: "passed", duration: 42 },
          { id: "t2", name: "logs out", status: "passed", duration: 18 },
        ],
      },
      {
        id: "g2",
        name: "group: billing",
        status: "failed",
        children: [
          { id: "t3", name: "charges card", status: "failed", duration: 210 },
          { id: "t4", name: "refund", status: "skipped" },
        ],
      },
    ],
  },
];

export function TreeDemo() {
  const [selected, setSelected] = useState<Test | null>(null);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  return (
    <DemoSection
      id="tree"
      title="Tree / TreeNode"
      description="Generic render-prop tree primitive — consumer owns the row content."
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
