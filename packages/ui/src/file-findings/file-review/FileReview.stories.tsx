import { useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { capturePatch, patchAnchor } from "../../comments/anchoring/patch-anchor";
import type { Comment, CommentCallbacks } from "../../comments/comment-types";
import { MonacoProvider } from "../../monaco/MonacoProvider";
import { FileReview, type FileReviewCommentTargets, type FileReviewLayout, type FileReviewProps, type FileReviewView } from "./FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./problem-filters";
import { CODE_FILE, CODE_SOURCE, LONG_DOC, SHORT_DOC, type DocFixture } from "./FileReview.fixtures";
import { quoteAnchor } from "./quote-anchor";
import { locateSource, sourceAnchor } from "./source-anchor";

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

type HarnessProps = Partial<Omit<FileReviewProps, "comments" | "findings">> & {
  fixture?: DocFixture;
  withComments?: boolean;
  withFindings?: boolean;
  withBlame?: boolean;
  editable?: boolean;
  onCreate?: CommentCallbacks["onCreate"];
  anchoring?: "quote" | "patch";
  targets?: FileReviewCommentTargets;
};

function Harness({ fixture = SHORT_DOC, withComments = false, withFindings = false, withBlame = false, editable = false, onCreate, anchoring, targets, ...props }: HarnessProps) {
  const [view, setView] = useState<FileReviewView>(props.view ?? "preview");
  const [layout, setLayout] = useState<FileReviewLayout>(props.layout ?? "margin");
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  const [source, setSource] = useState(fixture.source);
  const comments = useLocalComments(fixture.comments, onCreate);
  const review = (
    <FileReview
      path={fixture.path}
      source={source}
      {...props}
      view={view}
      onViewChange={setView}
      layout={layout}
      onLayoutChange={setLayout}
      {...(withComments ? { comments: { ...comments, ...(anchoring ? { anchoring } : {}), ...(targets ? { targets } : {}) } } : {})}
      {...(withFindings ? { findings: fixture.findings, problemFilters, onProblemFiltersChange: setProblemFilters } : {})}
      {...(withBlame ? { blame: fixture.blame } : {})}
      {...(editable ? { onSourceChange: setSource } : {})}
    />
  );
  return editable ? <MonacoProvider getWorker={getEditorWorker}>{review}</MonacoProvider> : review;
}

const meta = {
  title: "Git/FileReview",
  component: Harness,
  parameters: {
    docs: {
      description: {
        component:
          "Google Docs-style review of one file. Markdown gets a rendered Preview; any other file a syntax-highlighted Source listing with threads under their lines. Each feature turns on with its prop: `findings` adds a severity rail, squiggles, read-only finding threads and a Problems tab; `comments` adds quote highlights with threads in a margin sidebar or inline under the text; `selectToComment` lets a reader select or right-click words to start a thread; `blame` adds a Blame toggle with who last changed each line; `onSourceChange` turns Source into a Monaco editor. Without them it is a plain rendered/source viewer.",
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

/** Host actions are typed menu items shared by Problems, Source and Preview. */
export const ContextualProblemActions: Story = {
  args: {
    withFindings: true,
    view: "problems",
    getFindingActions: (finding) => [{ label: "Copy rule ID", onSelect: () => { void navigator.clipboard.writeText(finding.rule ?? finding.source); } }],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button", { name: "Problem actions" })[0]!);
    await expect(within(document.body).getByRole("menuitem", { name: "Copy rule ID" })).toBeVisible();
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

export const CodeFile: Story = {
  tags: ["browser"],
  args: { fixture: CODE_FILE, view: "source", withComments: true, withFindings: true, withBlame: true, selectToComment: true, onCreate: fn(), className: "h-[720px]" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, ""))).toEqual(["Source", "Problems"]);
    // Select once the syntax colours have replaced the plain text, so the selected node stays in the document.
    const line = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-source-text="12"]');
      if (!el?.querySelector("span[style*='color']")) throw new Error("line 12 is not highlighted yet");
      return el;
    }, { timeout: 5_000 });
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let text: Text | null = null;
    while (walker.nextNode()) if ((walker.currentNode as Text).data.includes("attempts")) text = walker.currentNode as Text;
    if (!text) throw new Error("line 12 has no text node holding \"attempts\"");
    const start = text.data.indexOf("attempts");
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, start + "attempts".length);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    line.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    await userEvent.click(await canvas.findByRole("button", { name: "Comment" }));
    await userEvent.type(canvas.getByTestId("comment-compose-input"), "Off by one?");
    await userEvent.click(canvas.getByTestId("comment-compose-send"));

    const column = CODE_SOURCE.split("\n")[11]!.indexOf("attempts");
    const anchor = sourceAnchor(locateSource(CODE_SOURCE, { line: 12, column }, { line: 12, column: column + "attempts".length })!);
    await waitFor(() => expect(args.onCreate).toHaveBeenCalledWith(expect.objectContaining({ anchor, body: "Off by one?" })));
    await waitFor(() => expect(canvasElement.querySelector(`[data-source-thread='${CSS.escape(anchor)}']`)).not.toBeNull());

    await userEvent.click(canvas.getByRole("button", { name: "Blame" }));
    expect(canvasElement.querySelectorAll("[data-blame-sha]")).toHaveLength(CODE_FILE.blame!.length);
  },
};

export const EditableSource: Story = {
  tags: ["browser"],
  args: { withFindings: true, editable: true, view: "source" },
};

const PATCH_THREAD: Comment = {
  id: "patch-1",
  body: "Is a green day still the bar for major versions?",
  status: "open",
  anchor: patchAnchor(capturePatch(SHORT_DOC.source, 7, 7)),
  createdAt: "2026-10-24T09:00:00.000Z",
  author: YOU,
};

/**
 * An editable file whose threads are git-style patch anchors (`r:`): select
 * lines in the editor, the Source listing or the Preview and the thread keeps
 * to those lines as the text changes. Switch **Edit / Review** in the header;
 * the Comment menu comments on an element or the whole file.
 */
export const PatchComments: Story = {
  tags: ["browser"],
  args: {
    fixture: { ...SHORT_DOC, comments: [PATCH_THREAD] },
    withComments: true,
    editable: true,
    selectToComment: true,
    anchoring: "patch",
    targets: { element: true, document: true, screenshot: true },
    view: "source",
    className: "h-[720px]",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Review" }));
    const thread = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('[data-source-line="7"] [data-source-thread]');
      if (!el) throw new Error("the patch thread is not listed under line 7 yet");
      return el;
    });
    await expect(thread).toHaveTextContent("Is a green day still the bar");
  },
};
