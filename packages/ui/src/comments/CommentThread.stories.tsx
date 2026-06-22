import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { CommentThread } from "./CommentThread";
import {
  sampleComments,
  sampleConfig,
  useDemoCommentStore,
} from "./comment-fixtures";

const meta = {
  title: "Comments/CommentThread",
  component: CommentThread,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ autoFocusComposer = false }: { autoFocusComposer?: boolean }) {
  const { comments, callbacks } = useDemoCommentStore(sampleComments);
  return (
    <div className="max-w-xl">
      <CommentThread
        comments={comments}
        config={sampleConfig}
        autoFocusComposer={autoFocusComposer}
        {...callbacks}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const WithMentionAutocomplete: Story = {
  render: () => <Demo autoFocusComposer />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("comment-compose-input");
    await userEvent.click(input);
    await userEvent.type(input, "Looks good @cl");
    // The mention popover is portaled to document.body.
    const popover = await within(document.body).findByTestId("mention-popover");
    await expect(popover).toBeInTheDocument();
    const option = await within(popover).findByRole("option", {
      name: /claude/,
    });
    await userEvent.click(option);
    await expect((input as HTMLTextAreaElement).value).toContain("@claude");
  },
};
