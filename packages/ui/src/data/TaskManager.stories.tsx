import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import type { Decorator } from "@storybook/react-vite";
import { TaskManager } from "./TaskManager";
import type { TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";

const BASE = "2026-06-02T12:00:00Z";

const RUNS: TaskRunMeta[] = [
  {
    id: "run-deploy",
    name: "Deploy payments-api",
    kind: "deploy",
    status: "running",
    startedAt: BASE,
    total: 5,
    completed: 3,
    failed: 0,
    running: 1,
    labels: { env: "prod" },
  },
  {
    id: "run-migrate",
    name: "DB migration 0042",
    kind: "migration",
    status: "success",
    startedAt: BASE,
    total: 3,
    completed: 3,
    failed: 0,
    running: 0,
  },
  {
    id: "run-scan",
    name: "Security scan",
    kind: "scan",
    status: "failed",
    startedAt: BASE,
    total: 4,
    completed: 2,
    failed: 2,
    running: 0,
  },
];

const SNAPSHOTS: Record<string, TaskSnapshot[]> = {
  "run-deploy": [
    { id: "run-deploy", name: "Deploy payments-api", type: "group", status: "running", total: 5, completed: 3, failed: 0, running: 1 },
    { id: "build", name: "Build image", type: "task", status: "success", groupId: "run-deploy" },
    { id: "push", name: "Push to registry", type: "task", status: "success", groupId: "run-deploy" },
    { id: "rollout", name: "Rollout", type: "task", status: "running", description: "waiting for 1/3 pods", progress: 2, maxValue: 3, groupId: "run-deploy" },
  ],
  "run-migrate": [
    { id: "run-migrate", name: "DB migration 0042", type: "group", status: "success", total: 3, completed: 3, failed: 0, running: 0 },
    { id: "m1", name: "Add column", type: "task", status: "success", groupId: "run-migrate" },
  ],
  "run-scan": [
    { id: "run-scan", name: "Security scan", type: "group", status: "failed", total: 4, completed: 2, failed: 2, running: 0 },
    { id: "s1", name: "Dependency audit", type: "task", status: "failed", error: "2 high severity advisories", groupId: "run-scan" },
  ],
};

// A minimal EventSource stand-in: it serves the synthetic listing on the runs
// stream and per-run snapshots on the task stream, so TaskManager renders real
// rows without a backend. Events fire asynchronously, after the component has
// attached its listeners.
class FakeEventSource {
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};
  onerror: ((e: Event) => void) | null = null;

  constructor(url: string) {
    setTimeout(() => {
      if (url.includes("/tasks/runs/stream")) {
        this.emit("runs", RUNS);
        return;
      }
      const id = new URL(url, "http://x").searchParams.get("tasks") ?? "";
      for (const snap of SNAPSHOTS[id] ?? []) this.emit("task", snap);
      this.dispatch("done", new MessageEvent("done"));
    }, 0);
  }

  addEventListener(type: string, cb: (e: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  close() {}

  private emit(type: string, data: unknown) {
    this.dispatch(type, new MessageEvent(type, { data: JSON.stringify(data) }));
  }

  private dispatch(type: string, event: MessageEvent) {
    for (const cb of this.listeners[type] ?? []) cb(event);
  }
}

const withFakeStream: Decorator = (Story) => {
  // Patch synchronously during render so the component's EventSource (created in
  // its own effect, after this parent renders) resolves to the fake.
  const original = useRef<typeof globalThis.EventSource | undefined>(undefined);
  if (globalThis.EventSource !== (FakeEventSource as unknown as typeof EventSource)) {
    original.current = globalThis.EventSource;
    globalThis.EventSource = FakeEventSource as unknown as typeof EventSource;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.EventSource = original.current;
    },
    [],
  );
  return <Story />;
};

const meta: Meta<typeof TaskManager> = {
  title: "Data/TaskManager",
  component: TaskManager,
  decorators: [withFakeStream],
  parameters: {
    docs: {
      description: {
        component:
          "The generic clicky-ui task-manager view: lists every run from the task API with kind/status filters and expands each row into a live `TaskProgress`. SSE-first (falls back to polling). This story injects a fake `EventSource` serving synthetic runs and snapshots — no backend.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskManager>;

export const Default: Story = {
  render: () => (
    <div className="max-w-2xl">
      <TaskManager basePath="/api/v1" />
    </div>
  ),
};

export const SingleKind: Story = {
  render: () => (
    <div className="max-w-2xl">
      <TaskManager basePath="/api/v1" kind="deploy" />
    </div>
  ),
};
