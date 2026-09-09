import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { TaskManager } from "./TaskManager";
import type { TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";

// A supervised process, streamed the way clicky actually streams one: the output
// travels as `event: output` deltas and is stripped from every `event: task`
// frame, while the task frame itself changes on almost every tick because its
// duration and resource sample do. That combination is what used to make the
// stdout tab appear and then disappear about once a second, and this story is
// the browser-level guard against it coming back.

const RUNS: TaskRunMeta[] = [
  {
    id: "run-agent",
    name: "claude-agent",
    kind: "agent",
    status: "running",
    startedAt: "2026-06-02T12:00:00Z",
    total: 1,
    completed: 0,
    failed: 0,
    running: 1,
  },
];

const processDetails = (sampledAt: string) => ({
  pid: 4242,
  command: "tsx",
  status: "running",
  restarts: 0,
  restartPolicy: "no",
  latest: { cpuPercent: 3.1, rssBytes: 1024, vmsBytes: 2048, openFiles: 8, sampledAt },
  peak: { cpuPercent: 9.4, rssBytes: 4096, vmsBytes: 8192, openFiles: 12, sampledAt },
  metrics: {},
  metadata: { state: "running", session: "df7aa36e", turn: { planMode: false, pending: 1 } },
});

const groupFrame: TaskSnapshot = {
  id: "run-agent",
  name: "claude-agent",
  type: "group",
  status: "running",
  groupId: "run-agent",
  total: 1,
  running: 1,
};

const taskFrame = (duration: string, sampledAt: string): TaskSnapshot => ({
  id: "agent-task",
  name: "run agent",
  type: "task",
  status: "running",
  groupId: "run-agent",
  duration,
  details: processDetails(sampledAt),
});

const FIRST_CHUNK = "starting agent\nconnected\n";
const SECOND_CHUNK = "turn 1 complete\n";

/**
 * Replays a fixed script of frames, in the order and shape clicky sends them:
 * a task frame, then its output, then further task frames carrying no output at
 * all. Frames are spaced so the component renders between them.
 */
class ScriptedEventSource {
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};
  onerror: ((e: Event) => void) | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(url: string) {
    const isRuns = url.includes("/tasks/runs/stream");
    const script: [number, string, unknown][] = isRuns
      ? [[0, "runs", RUNS]]
      : [
          [0, "task", groupFrame],
          [0, "task", taskFrame("1s", "2026-06-02T12:00:01Z")],
          [20, "output", {
            id: "agent-task",
            groupId: "run-agent",
            stream: "stdout",
            data: FIRST_CHUNK,
            offset: 0,
            reset: true,
          }],
          // Nothing but a changed duration and a fresh resource sample — exactly
          // the frame that used to wipe the accumulated output.
          [120, "task", taskFrame("2s", "2026-06-02T12:00:02Z")],
          [220, "task", taskFrame("3s", "2026-06-02T12:00:03Z")],
          [320, "output", {
            id: "agent-task",
            groupId: "run-agent",
            stream: "stdout",
            data: SECOND_CHUNK,
            offset: FIRST_CHUNK.length,
          }],
          [420, "task", taskFrame("4s", "2026-06-02T12:00:04Z")],
        ];
    for (const [delay, type, data] of script) {
      this.timers.push(
        setTimeout(() => {
          for (const cb of this.listeners[type] ?? []) {
            cb(new MessageEvent(type, { data: JSON.stringify(data) }));
          }
        }, delay),
      );
    }
  }

  addEventListener(type: string, cb: (e: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  close() {
    for (const timer of this.timers) clearTimeout(timer);
  }
}

const withQueryClient: Decorator = (Story) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  );
};

const withScriptedStream: Decorator = (Story) => {
  const original = useRef<typeof globalThis.EventSource | undefined>(undefined);
  if (globalThis.EventSource !== (ScriptedEventSource as unknown as typeof EventSource)) {
    original.current = globalThis.EventSource;
    globalThis.EventSource = ScriptedEventSource as unknown as typeof EventSource;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.EventSource = original.current;
    },
    [],
  );
  return <Story />;
};

const meta = {
  title: "Data/TaskManager Output",
  component: TaskManager,
  decorators: [withScriptedStream, withQueryClient],
  parameters: {
    docs: {
      description: {
        component:
          "A supervised process whose stdout arrives as append-only SSE deltas while its task frames keep changing. Guards the accumulator: task frames carry no output, and must not take the accumulated output with them when they replace a snapshot.",
      },
    },
  },
} satisfies Meta<typeof TaskManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OutputSurvivesLaterTaskFrames: Story = {
  render: () => (
    <div className="max-w-2xl">
      <TaskManager basePath="/api/v1" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText("claude-agent"));
    await userEvent.click(await canvas.findByText("run agent"));

    // The tab exists once output has arrived...
    await expect(await canvas.findByRole("button", { name: "stdout" })).toBeInTheDocument();
    await expect(await canvas.findByText(/starting agent/)).toBeInTheDocument();

    // ...and is still there after the task frames that carry none, with the
    // later delta appended to what was already on screen rather than replacing
    // it. Both chunks present is the whole point: one of them alone would mean
    // the pane had been reset in between.
    await waitFor(async () => {
      await expect(canvas.getByText(/turn 1 complete/)).toBeInTheDocument();
    });
    await expect(canvas.getByRole("button", { name: "stdout" })).toBeInTheDocument();
    await expect(canvas.getByText(/starting agent/)).toHaveTextContent(
      "starting agent connected turn 1 complete",
    );

    // The structured metadata reaches the header as chips, and keeps its
    // structure out of them.
    await expect(canvas.getByTitle("state: running")).toBeInTheDocument();
    await expect(canvas.getByTitle("session: df7aa36e")).toBeInTheDocument();
    await expect(canvas.queryByTitle(/^turn:/)).toBeNull();
  },
};
