import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Data/Avatar",
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const InitialFallback: Story = {
  args: { alt: "alice", size: 32 },
};

export const Palette: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      {["alice", "bob", "carol", "dave", "eve", "frank", "grace", "heidi"].map((n) => (
        <Avatar key={n} alt={n} size={36} title={n} />
      ))}
    </div>
  ),
};

export const Square: Story = {
  args: { alt: "flanksource/clicky-ui", rounded: "md", size: 28 },
};

export const Linked: Story = {
  args: { alt: "GH", href: "https://github.com", size: 28 },
};
