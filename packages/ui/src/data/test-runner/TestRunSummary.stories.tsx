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
