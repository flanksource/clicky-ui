import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkloadPanel } from "./WorkloadPanel";
import { workloadPanelExample } from "./fixtures";

const meta = {
  title: "Charts/WorkloadPanel",
  component: WorkloadPanel,
  args: workloadPanelExample,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One container snapshot combining CPU and memory request/limit gauges, JVM region stacks, GC average/P90/P95/max durations and average/P90/P95 overhead, and thread counts. Uses the existing WorkloadCard header. CPU is in cores, memory in bytes, GC in milliseconds. observationWindowMs defines the GC percentage denominator. Omit jvm for non-JVM containers. No QueryClientProvider is required; the caller owns fetching. See data/workload-panel/README.md for the complete data contract.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkloadPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const WithoutJvm: Story = {
  render: ({ jvm: _jvm, ...props }) => <WorkloadPanel {...props} />,
};
export const NoCollections: Story = {
  args: {
    jvm: {
      ...workloadPanelExample.jvm,
      gc: {
        count: 0,
        timeMs: 0,
        p90Ms: 0,
        p95Ms: 0,
        maxMs: 0,
        percentP90: 0,
        percentP95: 0,
      },
    },
  },
};
