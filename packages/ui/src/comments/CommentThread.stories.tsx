import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { $createParagraphNode, $createTextNode, $getRoot, getNearestEditorFromDOMNode } from "lexical";
import { CommentThread } from "./CommentThread";
import { buildThreadTodo } from "./gavel/thread-todo";
import {
  proposalComments,
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

function ProposalDemo() {
  const { comments, callbacks } = useDemoCommentStore(proposalComments);
  return (
    <div className="max-w-xl">
      <CommentThread
        comments={comments}
        config={sampleConfig}
        defaultExpanded
        {...callbacks}
      />
    </div>
  );
}

export const WithProposedPatch: Story = {
  render: () => <ProposalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Apply" }));
    await expect(await canvas.findByText("Applied")).toBeInTheDocument();
  },
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

function DefaultDeliveryDemo() {
  const { comments, callbacks } = useDemoCommentStore(sampleComments);
  return (
    <div className="max-w-xl">
      <CommentThread
        comments={comments}
        config={{
          ...sampleConfig,
          targets: [],
          defaultDelivery: { label: "claude-opus-5-5", layer: "project", description: "Delivered by the project's comment agent rule" },
        }}
        defaultExpanded
        {...callbacks}
      />
    </div>
  );
}

/**
 * The new-thread composer states where a comment without an `@target` goes, and which settings layer says so.
 * A reply box does not: the comment agent rule applies to new threads only, so it says replies need an `@target`.
 */
export const WithDefaultDeliveryLine: Story = {
  render: () => <DefaultDeliveryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Add a comment…" }));
    const line = await canvas.findByTestId("default-delivery");
    await expect(line).toHaveTextContent("Comments without an @target go to claude-opus-5-5 (rule from project)");
    await userEvent.click((await canvas.findAllByRole("button", { name: "Reply" }))[0]!);
    await expect(await canvas.findByTestId("reply-delivery")).toHaveTextContent("Replies are delivered only when they name an @target");
    await expect(canvas.getAllByTestId("default-delivery")).toHaveLength(1);
  },
};

function ThreadActionsDemo() {
  const { comments, callbacks, setComments } = useDemoCommentStore(sampleComments);
  const [todo, setTodo] = useState<{ title: string; body: string }>();
  const rename = (id: string, body: string) => setComments((previous) => previous.map((comment) => (comment.id === id ? { ...comment, body } : comment)));
  return (
    <div className="max-w-xl space-y-3">
      <CommentThread
        comments={comments}
        config={sampleConfig}
        defaultExpanded
        {...callbacks}
        onEdit={rename}
        onEditReply={(_rootId, messageId, body) => rename(messageId, body)}
        onDeleteReply={(_rootId, messageId) => setComments((previous) => previous.filter((comment) => comment.id !== messageId))}
        onCreateTodo={(thread) => setTodo(buildThreadTodo({ thread, pageUrl: "https://app.example/dashboard" }))}
      />
      {todo && (
        <pre data-testid="thread-todo" className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-2 text-[11px]">
          {`${todo.title}\n\n${todo.body}`}
        </pre>
      )}
    </div>
  );
}

/** Edit, edit-reply, delete-reply and Create todo appear only because the host passed their callbacks. */
export const WithThreadActions: Story = {
  render: () => <ThreadActionsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = (await canvas.findByText(/headline number/)).closest<HTMLElement>("[data-testid='comment-card']")!;
    await userEvent.click(within(root).getByRole("button", { name: "Comment actions" }));
    await userEvent.click(await within(document.body).findByRole("menuitem", { name: "Create todo" }));
    const todo = await canvas.findByTestId("thread-todo");
    await expect(todo).toHaveTextContent("Replies");
    await expect(todo).toHaveTextContent("Verified: the variance is a `currency` conversion");
  },
};
