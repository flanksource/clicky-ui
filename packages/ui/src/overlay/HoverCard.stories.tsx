import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard } from "./HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Overlay/HoverCard",
  component: HoverCard,
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <div className="p-density-8 flex justify-center">
      <HoverCard trigger={<span className="underline cursor-help">hover me</span>} placement="top">
        <div className="font-medium">Up to date</div>
        <div className="text-muted-foreground mt-0.5">Last synced 2m ago</div>
      </HoverCard>
    </div>
  ),
};
