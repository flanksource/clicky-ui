import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentCard } from "./CommentCard";
import { sampleComments, sampleConfig } from "./comment-fixtures";

const root = sampleComments[0]!;
const agentReply = sampleComments[3]!;

const meta = {
  title: "Comments/CommentCard",
  component: CommentCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { comment: root, config: sampleConfig },
} satisfies Meta<typeof CommentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  args: { defaultExpanded: true },
};

export const ResolvedByAgent: Story = {
  args: { comment: agentReply, defaultExpanded: true },
};
