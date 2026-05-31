import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gauge } from "./Gauge";
import { UiError, UiPass, UiWarningCircle } from "../icons";

const meta: Meta<typeof Gauge> = {
  title: "Data/Gauge",
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
    tone: {
      control: "inline-radio",
      options: ["neutral", "success", "warning", "danger", "info"],
    },
    value: { control: { type: "number", min: 0, max: 200, step: 1 } },
    max: { control: { type: "number", min: 1, max: 200, step: 1 } },
    icon: { table: { disable: true } },
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
