import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElapsedDuration } from "./ElapsedDuration";

const meta: Meta<typeof ElapsedDuration> = {
  title: "Charts/ElapsedDuration",
  component: ElapsedDuration,
  argTypes: {
    startedAt: { control: "text" },
    finishedAt: { control: "text" },
    format: { table: { disable: true } },
    fallback: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A run's duration derived from its `startedAt` / `finishedAt` timestamps, since the task stream carries no duration. Ticks once a second while the run is unfinished and holds the span between the timestamps once it ends. Renders `fallback` (nothing by default) before the run has started.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ElapsedDuration>;

export const Finished: Story = {
  args: { startedAt: "2026-10-15T07:00:00Z", finishedAt: "2026-10-15T07:01:30Z" },
};

export const Running: Story = {
  args: { startedAt: new Date(Date.now() - 42_000).toISOString(), finishedAt: undefined },
};

export const NotStarted: Story = {
  args: {
    startedAt: undefined,
    finishedAt: undefined,
    fallback: <span className="text-muted-foreground">—</span>,
  },
};
