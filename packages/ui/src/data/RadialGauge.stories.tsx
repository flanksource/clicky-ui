import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadialGauge } from "./RadialGauge";
import { Icon } from "./Icon";

const meta: Meta<typeof RadialGauge> = {
  title: "Data/RadialGauge",
  component: RadialGauge,
  args: {
    value: 70,
    max: 100,
    size: 28,
    thickness: 3,
    tone: "success",
    label: "Rate Limit",
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "success", "warning", "danger", "info"],
    },
    value: { control: { type: "number", min: 0, max: 200, step: 1 } },
    max: { control: { type: "number", min: 1, max: 200, step: 1 } },
    size: { control: { type: "number", min: 16, max: 96, step: 2 } },
    thickness: { control: { type: "number", min: 1, max: 12, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact circular progress ring for header/toolbar quotas. Renders an arc " +
          "proportional to value/max with optional centered content (icon or number) and a side label.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadialGauge>;

export const Default: Story = {};

export const WithCenterIcon: Story = {
  args: {
    center: <Icon name="mdi:github" width={13} height={13} />,
    label: "Rate Limit",
  },
};

export const ToneSet: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-density-4">
      <RadialGauge value={92} tone="success" label="92%" />
      <RadialGauge value={45} tone="warning" label="45%" />
      <RadialGauge value={8} tone="danger" label="8%" />
      <RadialGauge value={50} tone="info" label="info" />
      <RadialGauge value={50} tone="neutral" label="neutral" />
    </div>
  ),
};
