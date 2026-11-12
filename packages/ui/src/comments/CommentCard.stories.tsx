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

const opus = { id: "claude:s-1", name: "claude-opus-5-5", kind: "agent" as const };
const handOffs = [
  { title: "Queued", agentRun: { requestedAt: "2026-01-02T00:00:00.000Z", state: "queued" as const, target: { label: "Fix header" } } },
  { title: "Sent", agentRun: { requestedAt: "2026-01-02T00:00:00.000Z", state: "sent" as const, target: { label: "Fix header" } } },
  { title: "Replied", agentRun: { requestedAt: "2026-01-02T00:00:00.000Z", state: "sent" as const, repliedAt: "2026-01-02T00:03:00.000Z", target: { label: "Fix header" } } },
  { title: "Failed", agentRun: { requestedAt: "2026-01-02T00:00:00.000Z", state: "error" as const, error: "agent session s-1 is no longer live", target: { label: "Fix header" } } },
];

/** A thread handed to an agent: the provider's glyph, where it went, and a chat-style tick. */
export const AgentHandOff: Story = {
  args: { comment: root },
  render: (args) => (
    <div className="space-y-3">
      {handOffs.map(({ title, agentRun }) => (
        <CommentCard key={title} {...args} comment={{ ...root, id: `hand-off-${title}`, status: "in_progress", assignee: opus, agentRun }} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const stages = within(canvasElement).getAllByTestId("agent-delivery").map((chip) => chip.getAttribute("data-delivery"));
    await expect(stages).toEqual(["queued", "sent", "replied", "failed"]);
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
