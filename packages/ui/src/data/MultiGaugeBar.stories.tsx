import type { Meta, StoryObj } from "@storybook/react";
import { MultiGaugeBar } from "./MultiGaugeBar";
import { formatBytes } from "../lib/format";
const meta = {
  title: "Charts/MultiGaugeBar",
  component: MultiGaugeBar,
  args: {
    label: "CPU",
    average: 1.24,
    max: 4,
    unit: "cores",
    formatValue: (value) => String(Number(value.toFixed(2))),
    markers: [
      { label: "Request", value: 2, shape: "pointer", tone: "info" },
      { label: "P90", value: 2, tone: "warning" },
      { label: "P95", value: 2.4, tone: "danger" },
      { label: "Limit", value: 4, shape: "pointer" },
    ],
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A single shared scale with usage inside the green fill and the numeric maximum beside the track. Small downward pointers show requests, percentiles and limits; semantic tones distinguish each measure. Use icon for a header icon, unit for the maximum caption and formatValue for numeric formatting. Observations above max expand the scale; coincident pointers stack without shifting their values. The "cell" variant omits the card, scale ticks and legend, retaining exact marker values in its tooltip and accessible name.',
      },
    },
  },
} satisfies Meta<typeof MultiGaugeBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const KubernetesCPU: Story = {};
export const TableCell: Story = {
  args: { variant: "cell" },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const KubernetesMemory: Story = {
  args: {
    label: "Memory",
    unit: "",
    formatValue: formatBytes,
    average: 1382 * 1024 ** 2,
    max: 4 * 1024 ** 3,
    markers: [
      {
        label: "Request",
        value: 2 * 1024 ** 3,
        shape: "pointer",
        tone: "info",
      },
      { label: "P90", value: 2662 * 1024 ** 2, tone: "warning" },
      { label: "P95", value: 3174 * 1024 ** 2, tone: "danger" },
      { label: "Limit", value: 4 * 1024 ** 3, shape: "pointer" },
    ],
  },
};
export const Coincident: Story = {
  args: {
    markers: [
      { label: "Request", value: 2, shape: "pointer", tone: "info" },
      { label: "P90", value: 2, tone: "warning" },
      { label: "P95", value: 2, tone: "danger" },
      { label: "Limit", value: 4, shape: "pointer" },
    ],
  },
};
export const AboveLimit: Story = {
  args: {
    max: 4,
    markers: [
      { label: "Request", value: 2, shape: "pointer", tone: "info" },
      { label: "P90", value: 3.8, tone: "warning" },
      { label: "P95", value: 5, tone: "danger" },
      { label: "Limit", value: 4, shape: "pointer" },
    ],
  },
};
export const Zero: Story = {
  args: { average: 0, max: 0, markers: [{ label: "Max", value: 0 }] },
};
