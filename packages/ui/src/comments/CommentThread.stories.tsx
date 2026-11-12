import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { $createParagraphNode, $createTextNode, $getRoot, getNearestEditorFromDOMNode } from "lexical";
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
  // The Lexical composer needs a real DOM selection and layout.
  tags: ["browser"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("comment-compose-input");
    await userEvent.click(input);
    // The composer is a Lexical editor, which ignores user-event's synthetic
    // keystrokes, so the draft is typed through the editor's model.
    const editor = getNearestEditorFromDOMNode(input);
    if (!editor) throw new Error("comment-compose-input is not inside a Lexical editor");
    editor.update(() => {
      const text = $createTextNode("Looks good @cl");
      $getRoot().clear().append($createParagraphNode().append(text));
      text.selectEnd();
    }, { discrete: true });
    // The composer's mention list is portaled to document.body.
    const popover = await within(document.body).findByRole("listbox", {
      name: "Vocabulary and mentions",
    });
    await expect(popover).toBeInTheDocument();
    const option = await within(popover).findByRole("option", {
      name: /claude/,
    });
    await userEvent.click(option);
    await expect(input).toHaveTextContent("@claude");
  },
};
