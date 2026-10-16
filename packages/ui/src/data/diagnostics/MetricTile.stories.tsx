import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { MetricTile } from "./MetricTile";

const meta: Meta<typeof MetricTile> = {
  title: "Data/Diagnostics/MetricTile",
  component: MetricTile,
  parameters: {
    docs: {
      description: {
        component:
          "A compact labelled value with an optional tone bar underneath. Used for process and test-attempt metrics (CPU, RSS, FDs, exit code).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetricTile>;

export const Tones: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-4 gap-density-1">
      <MetricTile label="Idle" value="0.0%" barPct={0} tone="neutral" />
      <MetricTile label="Busy" value="35.0%" barPct={35} tone="success" />
      <MetricTile label="Hot" value="72.0%" barPct={72} tone="warning" />
      <MetricTile label="Pegged" value="98.0%" barPct={98} tone="danger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("98.0%")).toBeInTheDocument();
  },
};

export const WithoutBar: Story = {
  args: { label: "PID", value: "4242" },
};
