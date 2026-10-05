import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Message } from "./Message";
import type { UIMessage } from "./types";

const message: UIMessage = {
  id: "nested-agents",
  role: "assistant",
  parts: [
    {
      type: "dynamic-tool",
      toolCallId: "coordinator",
      toolName: "Agent",
      state: "output-available",
      input: { task: "Update the record" },
      output: "Delegated",
    },
    {
      type: "dynamic-tool",
      toolCallId: "worker",
      toolName: "Agent",
      state: "output-available",
      input: { task: "Write the update" },
      output: "Awaiting decision",
      toolMetadata: { parentToolCallId: "coordinator" },
    },
    {
      type: "dynamic-tool",
      toolCallId: "update",
      toolName: "updateRecord",
      state: "approval-requested",
      input: { id: "record-1", status: "reviewed" },
      approval: { id: "decision-update" },
      toolMetadata: { parentToolCallId: "worker" },
    },
  ],
};

function NestedApproval() {
  const [decision, setDecision] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const onApprove = (id: string, approved: boolean) => {
    setAttempts((count) => count + 1);
    if (attempts === 0)
      throw new Error("Decision service unavailable; retry the decision.");
    setDecision(`${id}: ${approved ? "approved" : "denied"}`);
  };
  return (
    <div className="max-w-2xl space-y-4">
      <Message message={message} onApprove={onApprove} />
      {decision && <p role="status">{decision}</p>}
    </div>
  );
}

const meta = {
  title: "Chat/Nested Tool Calls",
  component: NestedApproval,
} satisfies Meta<typeof NestedApproval>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovalRetry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Agent")).toHaveLength(2);
    await expect(canvas.getByText("updateRecord")).toBeVisible();
    await expect(canvas.getByText("record-1")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Decision service unavailable",
    );
    await expect(canvas.getByRole("button", { name: "Deny" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "decision-update: approved",
    );
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
