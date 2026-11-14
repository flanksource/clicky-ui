import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ProposalCard } from "./ProposalCard";
import { ME, sampleProposal, sampleProposalDiff } from "./comment-fixtures";

const callbacks = {
  onApplyProposal: fn(async () => {}),
  onRejectProposal: fn(async () => {}),
  onRequestRevision: fn(async () => {}),
  loadProposalDiff: fn(async () => sampleProposalDiff),
};

const meta = {
  title: "Comments/ProposalCard",
  component: ProposalCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { commentId: "c1r3", proposal: sampleProposal, callbacks },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProposalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Proposed: Story = {};

export const ExpandedDiff: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /show diff/i }));
    await expect(await canvas.findByText(/Math\.round/)).toBeInTheDocument();
  },
};

export const AskForRevisions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ask for revisions" }));
    await expect(canvas.getByRole("button", { name: "Send feedback" })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText("Revision feedback"), "Also cover negative amounts");
    await expect(canvas.getByRole("button", { name: "Send feedback" })).toBeEnabled();
  },
};

export const ApplyFails: Story = {
  args: {
    callbacks: {
      ...callbacks,
      onApplyProposal: async () => {
        throw new Error("working tree has conflicting changes in src/rollup/currency.ts");
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
    await expect(await canvas.findByRole("alert")).toBeInTheDocument();
  },
};

export const ReadOnly: Story = { args: { callbacks: {} } };

export const Applied: Story = {
  args: {
    proposal: { ...sampleProposal, state: "applied", decidedBy: ME, decidedAt: "2026-06-20T10:00:00.000Z" },
  },
};

export const Rejected: Story = {
  args: {
    proposal: {
      ...sampleProposal,
      state: "rejected",
      decidedBy: ME,
      decidedAt: "2026-06-20T10:00:00.000Z",
      feedback: "This changes rounding for every currency, not just the rollup.",
    },
  },
};

export const RevisionRequested: Story = {
  args: {
    proposal: {
      ...sampleProposal,
      state: "revision_requested",
      decidedBy: ME,
      decidedAt: "2026-06-20T10:00:00.000Z",
      feedback: "Please add a test for negative amounts.",
    },
  },
};

export const Superseded: Story = {
  args: { proposal: { ...sampleProposal, state: "superseded" } },
};
