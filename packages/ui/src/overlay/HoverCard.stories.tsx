import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard } from "./HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Overlay/HoverCard",
  component: HoverCard,
  args: {
    trigger: <button className="rounded border border-border px-2 py-1">Hover me</button>,
    children: <div className="text-sm">Details</div>,
    placement: "top",
    delay: 0,
    arrow: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Portaled hover card that escapes clipped table rows, dropdowns, and modals. It supports preferred placement, viewport clamping, open delay, and a hover grace period.",
      },
    },
  },
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

export const BottomPlacement: Story = {
  render: () => (
    <div className="p-density-8 flex justify-center">
      <HoverCard
        trigger={<span className="underline cursor-help">hover me</span>}
        placement="bottom"
      >
        <div className="font-medium">Up to date</div>
        <div className="text-muted-foreground mt-0.5">Last synced 2m ago</div>
      </HoverCard>
    </div>
  ),
};
