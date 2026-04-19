import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { Tree } from "./Tree";

const meta: Meta<typeof Tree> = {
  title: "Data/Tree",
  component: Tree,
};

export default meta;
type Story = StoryObj;

// --- Story 1: test tree --------------------------------------------------
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

export const TestTree: Story = {
  render: () => {
    const [selected, setSelected] = useState<Test | null>(null);
    return (
      <Tree<Test>
        roots={tests}
        getChildren={(t) => t.children}
        getKey={(t) => t.id}
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
              {node.duration && (
                <span className="text-xs text-muted-foreground">{node.duration}ms</span>
              )}
              <Badge tone={tone} size="sm">
                {node.status}
              </Badge>
            </>
          );
        }}
      />
    );
  },
};

// --- Story 2: process tree ----------------------------------------------
type Proc = { pid: number; name: string; cpu: number; children?: Proc[] };
const processes: Proc[] = [
  {
    pid: 1,
    name: "init",
    cpu: 0.1,
    children: [
      { pid: 23, name: "sshd", cpu: 0.0 },
      {
        pid: 42,
        name: "node",
        cpu: 12.4,
        children: [{ pid: 100, name: "vite", cpu: 5.2 }],
      },
    ],
  },
];

export const ProcessTree: Story = {
  render: () => (
    <Tree<Proc>
      roots={processes}
      getChildren={(p) => p.children}
      getKey={(p) => p.pid}
      defaultOpen={() => true}
      renderRow={({ node }) => (
        <>
          <Icon name="codicon:debug-alt" className="text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">pid {node.pid}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{node.cpu.toFixed(1)}%</span>
        </>
      )}
    />
  ),
};

// --- Story 3: grouped config tree ---------------------------------------
type Config = { id: string; kind: string; name: string; children?: Config[] };
const groups: Config[] = [
  {
    id: "g-pod",
    kind: "group",
    name: "Pod (2)",
    children: [
      { id: "p1", kind: "Pod", name: "api-server" },
      { id: "p2", kind: "Pod", name: "worker" },
    ],
  },
  {
    id: "g-svc",
    kind: "group",
    name: "Service (1)",
    children: [{ id: "s1", kind: "Service", name: "api" }],
  },
];

export const GroupedConfigTree: Story = {
  render: () => (
    <Tree<Config>
      roots={groups}
      getChildren={(c) => c.children}
      getKey={(c) => c.id}
      defaultOpen={() => true}
      renderRow={({ node, hasChildren }) =>
        hasChildren ? (
          <span className="font-medium text-sm">{node.name}</span>
        ) : (
          <>
            <Icon name="codicon:symbol-class" className="text-blue-500" />
            <span>{node.name}</span>
          </>
        )
      }
    />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Tree<Test>
      roots={[]}
      getChildren={(t) => t.children}
      getKey={(t) => t.id}
      renderRow={() => null}
      empty={<div className="p-density-4 text-muted-foreground text-sm">No tests yet</div>}
    />
  ),
};
