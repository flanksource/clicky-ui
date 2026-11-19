import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { EventSourceFactory } from "../hooks/event-source";
import { EventSourceProvider } from "../hooks/event-source-provider";
import { TimeseriesStreamProvider } from "./timeseries-stream-provider";
import { FakeEventSource } from "./timeseries-stream.fixtures";
import { TaskPoolSummary, TaskPoolUsage, TaskRunConcurrency } from "./TaskPoolUsage";

const RUN_ID = "commit-gavel";

/** Latest reading per metric id for one pool state. */
type PoolState = Record<string, number>;

const IDLE: PoolState = {
  "pool:workers-busy": 0,
  "pool:workers-limit": 4,
  "pool:slots-used": 0,
  "pool:slots-capacity": 4,
  "pool:queued": 0,
  "pool:supervisors": 0,
};

const SATURATED: PoolState = {
  "pool:workers-busy": 4,
  "pool:workers-limit": 4,
  "pool:slots-used": 4,
  "pool:slots-capacity": 4,
  "pool:queued": 9,
  "pool:supervisors": 1,
  [`${RUN_ID}:concurrency-running`]: 1,
  [`${RUN_ID}:concurrency-limit`]: 1,
  [`${RUN_ID}:concurrency-waiting`]: 3,
};

/** Answers each subscription with a 15-point flat history of the state's readings. */
function fakePoolHub(state: PoolState): EventSourceFactory {
  return (url) => {
    const source = new FakeEventSource(url);
    const now = Date.now();
    const series = source.ids.flatMap((id) => {
      const value = state[id];
      if (value === undefined) return [];
      const points = Array.from({ length: 15 }, (_, i) => ({ at: new Date(now - (14 - i) * 60_000).toISOString(), value }));
      return [{ id, source: id, points }];
    });
    const timer = setTimeout(() => source.emit("snapshot", { series }), 50);
    source.onClose = () => clearTimeout(timer);
    return source;
  };
}

function PoolHarness({ state, runId, collapsed }: { state: PoolState; runId?: string; collapsed?: boolean }) {
  const [client] = useState(() => new QueryClient());
  const [factory] = useState(() => fakePoolHub(state));
  const [expanded, setExpanded] = useState(false);
  return (
    <QueryClientProvider client={client}>
      <EventSourceProvider value={factory}>
        <TimeseriesStreamProvider>
          <div className="space-y-3" style={collapsed ? { width: 360 } : undefined}>
            {collapsed ? (
              <>
                <TaskPoolSummary basePath="/api/v1" expanded={expanded} onExpandedChange={setExpanded} controls="story-pool-gauges" />
                {expanded ? <TaskPoolUsage id="story-pool-gauges" basePath="/api/v1" /> : null}
              </>
            ) : (
              <TaskPoolUsage basePath="/api/v1" />
            )}
            {runId ? <TaskRunConcurrency basePath="/api/v1" runId={runId} /> : null}
          </div>
        </TimeseriesStreamProvider>
      </EventSourceProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Data/TaskPoolUsage",
  component: PoolHarness,
} satisfies Meta<typeof PoolHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { state: IDLE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Workers busy: 0")).toBeInTheDocument();
  },
};

export const SaturatedWithThrottledRun: Story = {
  args: { state: SATURATED, runId: RUN_ID },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Workers busy: 4")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Queued: 9")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Waiting for a permit: 3")).toBeInTheDocument();
  },
};

export const CollapsedSummary: Story = {
  args: { state: SATURATED, collapsed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole("button", { name: "Worker pool: 4 busy · 4 slots · 9 queued · 1 supervisor" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(await canvas.findByLabelText("Queued: 9")).toBeInTheDocument();
  },
};
