import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { goProfileRecords } from "./fixtures";
import { GoProfileView, ProfileTopTable } from "./GoProfileView";

const meta: Meta<typeof GoProfileView> = {
  title: "Data/Traces/GoProfileView",
  component: GoProfileView,
  args: { records: goProfileRecords },
  decorators: [
    (Story) => (
      <div className="max-w-4xl rounded-md border border-border p-density-3">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A Go pprof profile as the `goprof` kind stores it: a chooser across checkpoints (profile type, source and time; the latest by default) over a top-N table of functions by flat and cumulative value, per sample type, with a drill-down from a function to the heaviest stacks that reach it. `ProfileTopTable` underneath takes any samples of a value, a unit and a stack, so it can show other profilers' samples too.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GoProfileView>;

export const CpuProfile: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  },
};

export const HeapProfile: Story = {
  args: { records: goProfileRecords.filter((record) => record.profile === "heap") },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Total 120 MB across 5 functions")).toBeInTheDocument();
  },
};

export const DrillDown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /app\/runner\.hashChunk/ }));
    await expect(canvasElement.querySelector('[data-profile-stacks="app/runner.hashChunk"]')).not.toBeNull();
  },
};

export const TopTwoOnly: Story = { args: { topN: 2 } };

export const NoProfiles: Story = { args: { records: [] } };

export const AnyProfilerSamples: StoryObj<typeof ProfileTopTable> = {
  render: () => (
    <ProfileTopTable
      samples={[
        { sampleType: "wall", unit: "milliseconds", value: 420, frames: [{ func: "Db.query", file: "Db.java", line: 88 }, { func: "Svc.handle", file: "Svc.java", line: 31 }] },
        { sampleType: "wall", unit: "milliseconds", value: 180, frames: [{ func: "Json.parse", file: "Json.java", line: 12 }, { func: "Svc.handle", file: "Svc.java", line: 29 }] },
      ]}
    />
  ),
};
