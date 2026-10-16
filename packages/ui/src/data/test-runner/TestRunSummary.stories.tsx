import type { Meta, StoryObj } from "@storybook/react-vite";
import { TestRunSummary } from "./TestRunSummary";
import { completedTests, runningTests } from "./TestRunner.fixtures";

const meta = {
  title: "Data/TestRunner/TestRunSummary",
  component: TestRunSummary,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Header summary for a test run: per-status counts, elapsed time, a stacked progress bar and pass/fail/pending cards. Pure — elapsed time comes from the injected `now` (epoch ms) rather than a live clock, so it is deterministic. `compact` switches to a single-line layout for dialog headers.",
      },
    },
  },
  argTypes: {
    compact: { control: "boolean" },
    tests: { control: false },
  },
  args: {
    tests: completedTests,
    done: true,
    startTime: 0,
    endTime: 31_278,
    runMeta: { sequence: 1, kind: "initial" },
  },
} satisfies Meta<typeof TestRunSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {};

export const Running: Story = {
  args: {
    tests: runningTests,
    done: false,
    endTime: null,
    now: 12_000,
  },
};

export const Compact: Story = { args: { compact: true } };

/** The run hit its timeout: the Timed out chip and the process exit code join the counts. */
export const TimedOutRun: Story = {
  args: { runMeta: { sequence: 1, kind: "initial", timed_out: true, exit_code: 124 } },
};

/** Tests that never ran because the run stopped after a failure count as aborted, apart from skipped. */
export const WithAborted: Story = {
  args: {
    tests: [
      { name: "a", passed: true },
      { name: "b", failed: true },
      { name: "after-failure-1", aborted: true, skipped: true },
      { name: "after-failure-2", aborted: true, skipped: true },
      { name: "intentional", skipped: true },
    ],
    runMeta: { sequence: 1, kind: "initial", exit_code: 1 },
  },
};
