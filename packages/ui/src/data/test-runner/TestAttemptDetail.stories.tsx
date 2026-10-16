import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { TestAttemptDetail } from "./TestAttemptDetail";
import { TestDetailPanel } from "./TestDetailPanel";
import { TestRunnerProvider } from "./context";
import { createTestRunnerRegistry } from "./adapter";
import { emptyTestFilters } from "./filterState";
import { ProcessNotFoundError } from "./process-metrics";
import type { Test, TestAttempt } from "./types";

const GO_STACK = `goroutine 7 [chan receive, 30 minutes]:
billing.(*Gateway).await(0xc0001b2000)
\t/app/billing/gateway.go:118 +0xa5
created by billing.NewGateway
\t/app/billing/gateway.go:58 +0xe0

goroutine 12 [select]:
net/http.(*persistConn).readLoop(0xc000200000)
\t/usr/local/go1.22/src/net/http/transport.go:2200 +0x1d1
`;

const FINISHED: TestAttempt = {
  sequence: 1,
  passed: true,
  pid: 4242,
  cpu_percent: 37.5,
  rss: 150 * 1024 * 1024,
  duration: 1.25e9,
  exit_code: 0,
};

const meta = {
  title: "Data/TestRunner/TestAttemptDetail",
  component: TestAttemptDetail,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "What one attempt of a test measured: pid, CPU, RSS, open files, duration, exit code and goroutine count as metric tiles, polled live every two seconds while the attempt runs (`fetchProcessMetrics`, stopping when it finishes or the process is gone), and the timeout stack trace as goroutine cards. A pid shared by a `go test` batch is labelled.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { attempt: FINISHED },
} satisfies Meta<typeof TestAttemptDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Finished: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("4242")).toBeInTheDocument();
  },
};

export const SharedByBatch: Story = {
  args: { attempt: { ...FINISHED, shared_process: true } },
};

export const NoMetrics: Story = {
  args: { attempt: { sequence: 1, passed: true } },
};

export const TimedOutWithGoroutines: Story = {
  args: {
    attempt: {
      sequence: 1,
      timed_out: true,
      pid: 4300,
      cpu_percent: 0.2,
      rss: 64 * 1024 * 1024,
      goroutine_count: 2,
      exit_code: 2,
      duration: 30e9,
      stack_trace: GO_STACK,
    },
  },
};

let reading = 10;
export const LivePolling: Story = {
  args: {
    attempt: { sequence: 2, pid: 4400, cpu_percent: 1, rss: 8 * 1024 * 1024 },
    fetchProcessMetrics: async (pid) => {
      reading = (reading + 17) % 100;
      return { pid, cpu_percent: reading, rss: (8 + reading) * 1024 * 1024, open_files: 12 };
    },
  },
};

export const LiveProcessExited: Story = {
  args: {
    attempt: { sequence: 2, pid: 4400, cpu_percent: 1, rss: 8 * 1024 * 1024 },
    fetchProcessMetrics: async (pid) => {
      throw new ProcessNotFoundError(pid);
    },
  },
};

const FLAKY: Test = {
  name: "charges a card on checkout",
  framework: "ginkgo",
  route_path: "billing/charge",
  failed: true,
  message: "gateway timed out",
  attempts: [
    { sequence: 1, failed: true, message: "card declined", pid: 4201, cpu_percent: 12, rss: 40 * 1024 * 1024, duration: 1.1e9, exit_code: 1 },
    {
      sequence: 2,
      run_kind: "rerun",
      timed_out: true,
      message: "gateway timed out",
      pid: 4202,
      cpu_percent: 0.3,
      rss: 64 * 1024 * 1024,
      goroutine_count: 2,
      duration: 30e9,
      stack_trace: GO_STACK,
    },
  ],
};

function ChooserHarness() {
  const [selected, setSelected] = useState<Test | null>(FLAKY);
  return (
    <TestRunnerProvider
      value={{
        tests: [FLAKY],
        selected,
        done: true,
        filters: emptyTestFilters(),
        expandAll: null,
        busy: {},
        adapters: createTestRunnerRegistry(),
        onSelect: setSelected,
        onFiltersChange: () => {},
        onExpandAllChange: () => {},
      }}
    >
      <div className="h-[560px] w-[760px] overflow-hidden rounded-md border border-border">
        <TestDetailPanel />
      </div>
    </TestRunnerProvider>
  );
}

/** A test that ran twice: the header chooser picks the attempt and the body follows it. */
export const AttemptChooser: Story = {
  render: () => <ChooserHarness />,
  decorators: [],
};
