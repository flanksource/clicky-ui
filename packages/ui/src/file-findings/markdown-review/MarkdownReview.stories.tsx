import { useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { Comment, CommentCallbacks } from "../../comments/comment-types";
import { MonacoProvider } from "../../monaco/MonacoProvider";
import { MarkdownReview, type MarkdownReviewLayout, type MarkdownReviewProps, type MarkdownReviewView } from "./MarkdownReview";
import { LONG_DOC, SHORT_DOC, type DocFixture } from "./MarkdownReview.fixtures";
import { quoteAnchor } from "./quote-anchor";

const YOU = { id: "you", name: "You", kind: "user" as const };

// Vite bundles a worker named by `new Worker(new URL(...))`; the editor worker
// is enough here (no language services are used).
function getEditorWorker(): Worker {
  return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
}

/** Comments held in story state, so create/reply/resolve work without a server. */
function useLocalComments(initial: Comment[], onCreate?: CommentCallbacks["onCreate"]) {
  const [comments, setComments] = useState(initial);
  const nextId = useRef(0);
  const callbacks = useMemo<CommentCallbacks>(() => {
    const add = (comment: Pick<Comment, "body" | "anchor" | "parentId" | "status">) =>
      setComments((current) => [...current, { ...comment, id: `local-${++nextId.current}`, createdAt: new Date().toISOString(), author: YOU }]);
    return {
      onCreate: async (input) => {
        await onCreate?.(input);
        add({ body: input.body, anchor: input.anchor ?? null, status: "open" });
      },
      onReply: (input) => add({ body: input.body, anchor: input.anchor ?? null, parentId: input.parentId }),
      onUpdateStatus: (id, status) => setComments((current) => current.map((c) => (c.id === id ? { ...c, status } : c))),
      onDelete: (id) => setComments((current) => current.filter((c) => c.id !== id && c.parentId !== id)),
    };
  }, [onCreate]);
  return { items: comments, callbacks };
}

type HarnessProps = Partial<Omit<MarkdownReviewProps, "comments" | "findings">> & {
  fixture?: DocFixture;
  withComments?: boolean;
  withFindings?: boolean;
  editable?: boolean;
  onCreate?: CommentCallbacks["onCreate"];
};

function Harness({ fixture = SHORT_DOC, withComments = false, withFindings = false, editable = false, onCreate, ...props }: HarnessProps) {
  const [view, setView] = useState<MarkdownReviewView>(props.view ?? "preview");
  const [layout, setLayout] = useState<MarkdownReviewLayout>(props.layout ?? "margin");
  const [source, setSource] = useState(fixture.source);
  const comments = useLocalComments(fixture.comments, onCreate);
  const review = (
    <MarkdownReview
      path={fixture.path}
      source={source}
      {...props}
      view={view}
      onViewChange={setView}
      layout={layout}
      onLayoutChange={setLayout}
      {...(withComments ? { comments } : {})}
      {...(withFindings ? { findings: fixture.findings } : {})}
      {...(editable ? { onSourceChange: setSource } : {})}
    />
  );
  return editable ? <MonacoProvider getWorker={getEditorWorker}>{review}</MonacoProvider> : review;
}

const meta = {
  title: "Git/MarkdownReview",
  component: Harness,
  parameters: {
    docs: {
      description: {
        component:
          "Google Docs-style review of one markdown document. Each feature turns on with its prop: `findings` adds a severity rail, squiggles, read-only finding threads and a Problems tab; `comments` adds quote highlights with threads in a margin sidebar or inline under the text; `selectToComment` lets a reader select or right-click words to start a thread; `onSourceChange` turns Source into a Monaco editor. Without them it is a plain rendered/source viewer.",
      },
    },
  },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFeatures: Story = {
  tags: ["browser"],
  args: { withComments: true, withFindings: true, selectToComment: true, authorFilter: true, onCreate: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const paragraph = await waitFor(() => {
      const p = [...canvasElement.querySelectorAll("p")].find((el) => el.textContent?.includes("CI builds the artifacts"));
      if (!p) throw new Error("the build paragraph has not rendered yet");
      return p;
    });
    const text = [...paragraph.childNodes].find((node): node is Text => node instanceof Text && node.data.includes("artifacts"))!;
    const start = text.data.indexOf("artifacts");
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, start + "artifacts".length);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    paragraph.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    await userEvent.click(await canvas.findByRole("button", { name: "Comment" }));
    await userEvent.type(canvas.getByTestId("comment-compose-input"), "Which registry?");
    await userEvent.click(canvas.getByTestId("comment-compose-send"));

    const anchor = quoteAnchor({ path: ["Release checklist", "Cutting the build"], prefix: "builds the", quote: "artifacts", suffix: "and publishes" });
    await waitFor(() => expect(args.onCreate).toHaveBeenCalledWith(expect.objectContaining({ anchor, body: "Which registry?" })));
    await waitFor(() => expect(canvasElement.querySelector(`[data-card-anchor='${CSS.escape(anchor)}']`)).not.toBeNull());
  },
};

export const InlineThreads: Story = {
  tags: ["browser"],
  args: { withComments: true, withFindings: true, selectToComment: true, layout: "inline" },
};

export const LongDocument: Story = {
  tags: ["browser"],
  args: { fixture: LONG_DOC, withComments: true, withFindings: true, selectToComment: true, className: "h-[720px]" },
};

export const LintOnly: Story = {
  args: { withFindings: true, view: "problems" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, ""))).toEqual(["Preview", "Source", "Problems"]);
    expect(canvasElement.querySelectorAll("[data-problem-line]")).toHaveLength(SHORT_DOC.findings.length);
  },
};

export const CommentsOnly: Story = {
  args: { withComments: true, view: "source" },
};

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Preview", "Source"]);
    expect(canvas.queryByText(/open ·/)).toBeNull();
  },
};

export const EditableSource: Story = {
  tags: ["browser"],
  args: { withFindings: true, editable: true, view: "source" },
};
