import type { Meta, StoryObj } from "@storybook/react-vite";
import { MethodBadge } from "./MethodBadge";

const meta: Meta<typeof MethodBadge> = {
  title: "Data/MethodBadge",
  component: MethodBadge,
};

export default meta;
type Story = StoryObj<typeof MethodBadge>;

export const AllMethods: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].map((method) => (
        <MethodBadge key={method} method={method} />
      ))}
    </div>
  ),
};
