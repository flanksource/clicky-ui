import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusDot } from "./StatusDot";

const meta = {
  title: "Data/Cells/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A small colored status dot with an optional inline label, for table cells and dense lists. Color maps from the shared `BadgeStatus` palette (success/error/warning/info). The dot carries an accessible name via `aria-label`.",
      },
    },
  },
  argTypes: {
    status: { control: "inline-radio", options: ["success", "error", "warning", "info"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md"] },
    label: { control: "text" },
  },
  args: { status: "success", size: "sm", label: "Healthy" },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <StatusDot status="success" label="Healthy" />
      <StatusDot status="warning" label="Degraded" />
      <StatusDot status="error" label="Down" />
      <StatusDot status="info" label="Provisioning" />
    </div>
  ),
};

export const DotOnly: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot status="success" size="xs" />
      <StatusDot status="warning" size="sm" />
      <StatusDot status="error" size="md" />
    </div>
  ),
};
