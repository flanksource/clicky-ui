import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gauge } from "./Gauge";
import { UiError, UiGraph, UiPass, UiWarningCircle } from "../icons";

const meta: Meta<typeof Gauge> = {
  title: "Charts/Gauge",
  component: Gauge,
  args: {
    label: "Passed",
    value: 92,
    max: 100,
    tone: "success",
    suffix: "%",
    subtitle: "110 / 120 tests",
    meta: "fresh",
    icon: UiPass,
  },
  argTypes: {
    label: { control: "text" },
    tone: {
      control: "inline-radio",
      options: ["neutral", "success", "warning", "danger", "info"],
    },
    variant: {
      control: "inline-radio",
      options: ["default", "cell"],
    },
    showLabel: { control: "boolean" },
    value: { control: { type: "number", min: 0, max: 200, step: 1 } },
    max: { control: { type: "number", min: 1, max: 200, step: 1 } },
    suffix: { control: "text" },
    subtitle: { control: "text" },
    meta: { control: "text" },
    icon: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact metric tile for summaries and test/run dashboards. It displays a label, normalized value, optional icon, subtitle, and right-aligned metadata.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Gauge>;

export const Default: Story = {};

export const StatusSet: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-3">
      <Gauge
        icon={UiPass}
        label="Passed"
        value={92}
        tone="success"
        subtitle="110 / 120 tests"
        meta="fresh"
      />
      <Gauge
        icon={UiError}
        label="Failed"
        value={3}
        tone="danger"
        subtitle="requires attention"
        meta="3m"
      />
      <Gauge
        icon={UiWarningCircle}
        label="Skipped"
        value={5}
        tone="warning"
        subtitle="intentionally skipped"
        meta="cached"
      />
    </div>
  ),
};

export const CellVariants: Story = {
  render: () => (
    <div className="grid w-[22rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
      <div className="border-b border-r border-border px-2 py-1.5">
        <Gauge
          variant="cell"
          icon={UiPass}
          label="Passed"
          value={92}
          tone="success"
          meta="fresh"
        />
      </div>
      <div className="border-b border-border px-2 py-1.5">
        <Gauge
          variant="cell"
          showLabel={false}
          icon={UiPass}
          label="Passed"
          value={92}
          tone="success"
          meta="fresh"
        />
      </div>
      <div className="border-r border-border px-2 py-1.5">
        <Gauge
          variant="cell"
          icon={UiWarningCircle}
          label="Skipped"
          value={5}
          tone="warning"
        />
      </div>
      <div className="px-2 py-1.5">
        <Gauge
          variant="cell"
          showLabel={false}
          icon={UiGraph}
          label="Coverage"
          value={78}
          tone="info"
        />
      </div>
    </div>
  ),
};
