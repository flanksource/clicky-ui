import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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

export const Collapsed: Story = {
  args: { onUpdateStatus: fn() },
};

export const Expanded: Story = {
  args: { defaultExpanded: true },
};

export const ResolvedByAgent: Story = {
  args: { comment: agentReply, defaultExpanded: true },
};

const claude = { id: "a-claude", name: "claude", kind: "agent" as const };

export const AssignedToAgent: Story = {
  args: {
    comment: {
      ...root,
      status: "in_progress",
      assignee: claude,
      acknowledgedBy: claude,
      acknowledgedAt: "2026-01-02T00:00:00.000Z",
    },
    defaultExpanded: true,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("Assigned to claude"),
    ).toBeVisible();
  },
};

export const AcknowledgeAndAssign: Story = {
  args: {
    comment: { ...root, status: "open" },
    config: { ...sampleConfig, assignees: sampleConfig.mentionables ?? [] },
    defaultExpanded: true,
    onAcknowledge: fn(),
    onAssign: fn(),
    // The seam a host uses to start an action from an assignment.
    extraAssignItems: () => [{ label: "Run agent…", onSelect: fn() }],
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Comment actions" }),
    );
    const menu = within(document.body);
    await userEvent.click(menu.getByRole("menuitem", { name: "Assign…" }));
    await userEvent.click(menu.getByRole("menuitem", { name: "claude" }));
    await expect(args.onAssign).toHaveBeenCalledWith(
      expect.objectContaining({ name: "claude", kind: "agent" }),
    );
  },
};
