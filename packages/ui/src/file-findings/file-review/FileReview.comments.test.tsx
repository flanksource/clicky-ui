import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as FileReview.test.tsx).
vi.mock("../../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));
// Monaco does not run in jsdom; the stub stands in for the editor and the gutter seam FileReview hands it.
vi.mock("../AnnotatedCode", () => ({
  AnnotatedCode: ({
    source,
    onChange,
    sourceComments,
  }: {
    source: string;
    onChange?: (source: string) => void;
    sourceComments?: import("../../monaco/source-comments").SourceComments;
  }) => (
    <div>
      <textarea data-testid="editor" value={source} onChange={(event) => onChange?.(event.target.value)} />
      {sourceComments?.ranges.map((range) => (
        <button key={range.id} type="button" data-testid="gutter-marker" onClick={() => sourceComments.onSelect(range.id)}>
          {range.startLine}-{range.endLine}
        </button>
      ))}
      {sourceComments?.onCreate && (
        <button type="button" onClick={() => sourceComments.onCreate!({ startLine: 2, endLine: 3 })}>
          gutter-comment
        </button>
      )}
    </div>
  ),
}));
const capture = vi.hoisted(() => ({
  result: { status: "captured", dataUrl: "data:image/png;base64,AAAA" } as const,
  captureScreenshot: vi.fn(),
}));
vi.mock("../../comments/annotation-screenshot", () => ({
  screenshotCaptureSupported: () => true,
  captureScreenshot: capture.captureScreenshot,
}));

import { elementAnchor, parseElementAnchor } from "../../comments/anchoring/dom-anchor";
import { capturePatch, patchAnchor } from "../../comments/anchoring/patch-anchor";
import { DOCUMENT_ANCHOR, type Comment } from "../../comments/comment-types";
import { setCommentDraft } from "../../test/comment-editor";
import { FileReview, type FileReviewComments, type FileReviewProps } from "./FileReview";
import { emptyProblemFilters } from "./problem-filters";

const TEXT_PATH = "notes/todo.txt";
const LINES = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`);
const TEXT = LINES.join("\n");
const MD_PATH = "docs/release.md";
const MD = ["# Release", "", "Tag the commit with the next version and push the tag.", "", "Watch the dashboard for an hour."].join("\n");

const rootComment = (id: string, anchor: string, body: string): Comment => ({
  id,
  body,
  status: "open",
  anchor,
  createdAt: "2026-10-24T09:00:00.000Z",
  author: { id: "dana", name: "Dana", kind: "user" },
});

const threadAnchor = patchAnchor(capturePatch(TEXT, 7, 8));
const thread = rootComment("t1", threadAnchor, "Why two lines?");

function review(props: Partial<FileReviewProps> & { comments?: Partial<FileReviewComments> } = {}) {
  const { comments, ...rest } = props;
  const element = (next: Partial<FileReviewProps> = {}) => (
    <FileReview
      path={TEXT_PATH}
      source={TEXT}
      view="source"
      onViewChange={vi.fn()}
      problemFilters={emptyProblemFilters}
      onProblemFiltersChange={vi.fn()}
      selectToComment
      {...rest}
      {...next}
      comments={{ items: [], callbacks: {}, anchoring: "patch", ...comments }}
    />
  );
  const view = render(element());
  return { ...view, again: (next: Partial<FileReviewProps>) => view.rerender(element(next)) };
}

const withAttr = (container: HTMLElement, attr: string, value: string) =>
  [...container.querySelectorAll(`[${attr}]`)].filter((el) => el.getAttribute(attr) === value);

/** Select from the start of one listed source line's text to the end of another's. */
function selectSourceLines(from: number, to: number) {
  const start = document.querySelector(`[data-source-text="${from}"]`)!;
  const end = document.querySelector(`[data-source-text="${to}"]`)!;
  const range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, end.childNodes.length);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(range);
  fireEvent.mouseUp(start);
}

/** Click the floating Comment pill over a selection (the header may have a Comment menu of its own). */
async function openDraft() {
  const pill = await waitFor(() => {
    const draft = document.querySelector<HTMLElement>("[data-comment-draft]");
    if (!draft) throw new Error("no comment pill yet");
    return within(draft).getByRole("button", { name: "Comment" });
  });
  fireEvent.click(pill);
}

async function post(body: string, button = "Post comment") {
  setCommentDraft(await screen.findByTestId("comment-compose-input"), body);
  fireEvent.click(screen.queryByRole("button", { name: button }) ?? screen.getByTestId("comment-compose-send"));
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  capture.captureScreenshot.mockReset().mockResolvedValue(capture.result);
  // jsdom lays nothing out and has no range geometry.
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
});

describe("FileReview patch comments on a listed source", () => {
  it("anchors a selection on the lines it covers, with three lines of context, as r:", async () => {
    const onCreate = vi.fn(async () => {});
    review({ comments: { callbacks: { onCreate } } });
    selectSourceLines(4, 5);
    await openDraft();
    await post("Merge these");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0]![0]).toMatchObject({ body: "Merge these", anchor: patchAnchor(capturePatch(TEXT, 4, 5)) });
  });

  it("keeps showing the source after posting, before the host's refresh brings the new thread back", async () => {
    // With layout, the posted selection still has highlight boxes, so its inline thread stays open
    // while `items` lacks the new comment: its r: anchor must still label without a thread placing it.
    Range.prototype.getClientRects = () => [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList;
    const rects = vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);
    onTestFinished(() => rects.mockRestore());
    const onCreate = vi.fn(async () => {});
    review({ comments: { callbacks: { onCreate } } });
    selectSourceLines(4, 5);
    await openDraft();
    await post("Merge these");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(document.querySelector('[data-source-text="4"]')?.textContent).toBe("line 4");
  });

  it("keeps anchoring on the selected characters (s:) unless anchoring is patch", async () => {
    const onCreate = vi.fn(async () => {});
    review({ comments: { callbacks: { onCreate }, anchoring: "quote" } });
    selectSourceLines(4, 4);
    await openDraft();
    await post("Quote it");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0]![0].anchor.startsWith("s:")).toBe(true);
  });

  it("lists a thread under the last line of its range and follows it when lines are inserted above its context", () => {
    const { container, again } = review({ comments: { items: [thread] } });
    const before = within(container.querySelector<HTMLElement>('[data-source-line="8"]')!).getByRole("button", { name: /Why two lines\?/ }).dataset.sourceThread;
    again({ source: ["new a", "new b", ...LINES].join("\n") });
    const after = within(container.querySelector<HTMLElement>('[data-source-line="10"]')!).getByRole("button", { name: /Why two lines\?/ }).dataset.sourceThread;
    expect({ before, after, highlighted: [...container.querySelectorAll("mark[data-source-comment]")].map((m) => m.textContent) }).toEqual({
      before: threadAnchor,
      after: threadAnchor,
      highlighted: ["line 7", "line 8"],
    });
  });

  it("lists a thread as outdated in the file-level list once its lines are deleted, rather than hiding it", () => {
    const { container, again } = review({ comments: { items: [thread] } });
    again({ source: LINES.filter((_, i) => i !== 6 && i !== 7).join("\n") });
    const list = within(container.querySelector<HTMLElement>("[data-file-threads]")!);
    expect({
      underLines: container.querySelectorAll("[data-source-thread]").length,
      label: list.getByText("Outdated · Lines 7–8").textContent,
      body: list.getByText("Why two lines?").textContent,
    }).toEqual({ underLines: 0, label: "Outdated · Lines 7–8", body: "Why two lines?" });
  });

  it("lists a thread whose hunk repeats as ambiguous", () => {
    const periodic = Array.from({ length: 18 }, (_, i) => "abc"[i % 3]!).join("\n");
    const anchor = patchAnchor(capturePatch(periodic, 10, 10));
    const { container } = review({ source: `pad\n${periodic}`, comments: { items: [rootComment("t2", anchor, "Which one?")] } });
    expect(within(container.querySelector<HTMLElement>("[data-file-threads]")!).getByText("Ambiguous · Line 10")).toBeTruthy();
  });
});

describe("FileReview patch comments in Preview", () => {
  const paragraph = patchAnchor(capturePatch(MD, 3, 3));

  it("anchors a selection on the lines of the blocks it touches", async () => {
    const onCreate = vi.fn(async () => {});
    const { container } = review({ path: MD_PATH, source: MD, view: "preview", comments: { callbacks: { onCreate } } });
    await waitFor(() => expect(container.querySelector('[data-source-start="3"]')).not.toBeNull());
    const block = container.querySelector('[data-source-start="3"]')!;
    const range = document.createRange();
    range.selectNodeContents(block);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    fireEvent.mouseUp(block);
    await openDraft();
    await post("Version of what?");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0]![0].anchor).toBe(paragraph);
  });

  it("boxes a thread on the block covering its lines and labels its card with them", async () => {
    const { container } = review({ path: MD_PATH, source: MD, view: "preview", comments: { items: [rootComment("t3", paragraph, "Check the tag")] } });
    await waitFor(() => expect(withAttr(container, "data-anchor-box", paragraph)).not.toHaveLength(0));
    expect(within(withAttr(container, "data-card-anchor", paragraph)[0] as HTMLElement).getByText("Line 3")).toBeTruthy();
  });

  it("places an e: thread on its element and lists one whose element is gone as not found", async () => {
    const placed = elementAnchor([{ kind: "css", selector: '[data-source-start="5"]' }]);
    const gone = elementAnchor([{ kind: "css", selector: "#removed" }]);
    const { container } = review({
      path: MD_PATH,
      source: MD,
      view: "preview",
      comments: { items: [rootComment("e1", placed, "Which dashboard?"), rootComment("e2", gone, "Where did it go?")] },
    });
    await waitFor(() => expect(withAttr(container, "data-anchor-box", placed)).not.toHaveLength(0));
    const rail = container.querySelector<HTMLElement>("[data-comment-sidebar]")!;
    const card = within(rail.querySelector<HTMLElement>(`[data-file-thread="${CSS.escape(gone)}"]`)!);
    expect({
      gone: withAttr(container, "data-anchor-box", gone).length,
      separateList: container.querySelector("section[data-file-threads]") !== null,
      listed: card.getByText("Element not found").textContent,
      body: card.getByText("Where did it go?").textContent,
    }).toEqual({ gone: 0, separateList: false, listed: "Element not found", body: "Where did it go?" });
  });

  it("puts file comments in the margin rail ahead of the placed cards, and the file draft there too", async () => {
    const onCreate = vi.fn(async () => {});
    const { container } = review({
      path: MD_PATH,
      source: MD,
      view: "preview",
      comments: { items: [rootComment("t3", paragraph, "Check the tag"), rootComment("d1", DOCUMENT_ANCHOR, "Needs an owner")], callbacks: { onCreate }, targets: { document: true } },
    });
    await waitFor(() => expect(withAttr(container, "data-anchor-box", paragraph)).not.toHaveLength(0));
    const rail = container.querySelector<HTMLElement>("[data-comment-sidebar]")!;
    const order = () => [...rail.querySelectorAll<HTMLElement>("[data-card-anchor]")].map((card) => card.dataset.cardAnchor);
    const listed = order();
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Comment on file" }));
    await post("Add a changelog entry", "Post comment");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect({
      listed,
      separateList: container.querySelector("section[data-file-threads]") !== null,
      posted: onCreate.mock.calls[0]![0],
    }).toEqual({
      listed: [DOCUMENT_ANCHOR, paragraph],
      separateList: false,
      posted: expect.objectContaining({ body: "Add a changelog entry", anchor: DOCUMENT_ANCHOR }),
    });
  });
});

describe("FileReview comment targets", () => {
  const targets = { element: true, document: true, screenshot: true };

  it("offers no Comment menu unless a target is enabled", () => {
    review({ path: MD_PATH, source: MD, view: "preview", comments: { callbacks: { onCreate: vi.fn() } } });
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull();
  });

  it("comments on an element picked in Preview, anchored on its locators as e:", async () => {
    const onCreate = vi.fn(async () => {});
    const { container } = review({ path: MD_PATH, source: MD, view: "preview", comments: { callbacks: { onCreate }, targets: { element: true } } });
    await waitFor(() => expect(container.querySelector('[data-source-start="3"]')).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Comment on element" }));
    expect(screen.getByRole("status").textContent).toMatch(/click an element/);
    fireEvent.click(container.querySelector('[data-source-start="3"]')!);
    await screen.findByRole("dialog", { name: /^New comment on Tag the commit/ });
    await post("Pin this");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    const { anchor } = onCreate.mock.calls[0]![0];
    expect(parseElementAnchor(anchor)).toEqual([expect.objectContaining({ kind: "markdown", tag: "p" })]);
  });

  it("comments on the whole file with DOCUMENT_ANCHOR and lists its threads in the file-level list", async () => {
    const onCreate = vi.fn(async () => {});
    const { container } = review({
      comments: { items: [rootComment("d1", DOCUMENT_ANCHOR, "Needs an owner")], callbacks: { onCreate }, targets },
    });
    expect(within(container.querySelector<HTMLElement>("[data-file-threads]")!).getByText("Needs an owner")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(screen.queryByRole("menuitem", { name: "Comment on element" })).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Comment on file" }));
    await post("Add a changelog entry", "Post comment");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0]![0]).toMatchObject({ body: "Add a changelog entry", anchor: DOCUMENT_ANCHOR });
  });

  it("posts with a screenshot of the anchored region, handing the host the capture and no action id", async () => {
    const onCreate = vi.fn(async () => {});
    review({ comments: { callbacks: { onCreate }, targets } });
    selectSourceLines(2, 2);
    await openDraft();
    await post("See this", "Post with screenshot");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect({ args: onCreate.mock.calls[0]!.length, input: onCreate.mock.calls[0]![0], target: capture.captureScreenshot.mock.calls[0]![0] instanceof Element }).toEqual({
      args: 1,
      input: expect.objectContaining({ body: "See this", anchor: patchAnchor(capturePatch(TEXT, 2, 2)), screenshot: capture.result }),
      target: true,
    });
  });
});

describe("FileReview Edit and Review", () => {
  it("has no toggle without onSourceChange", () => {
    review();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
  });

  it("lists file comments at the top of the edit rail beside the editor, not in a separate list above it", async () => {
    const fileThread = rootComment("d1", DOCUMENT_ANCHOR, "Needs an owner");
    const { container } = review({ onSourceChange: vi.fn(), comments: { items: [thread, fileThread] } });
    await screen.findByTestId("editor");
    const cards = [...container.querySelectorAll<HTMLElement>("[data-edit-threads] [data-card-anchor], [data-edit-threads] [data-file-thread]")];
    expect({
      separateList: container.querySelector("section[data-file-threads]") !== null,
      order: cards.map((card) => card.dataset.fileThread ?? card.dataset.cardAnchor),
      body: within(cards[0]!).getByText("Needs an owner").textContent,
    }).toEqual({ separateList: false, order: [DOCUMENT_ANCHOR, threadAnchor], body: "Needs an owner" });
  });

  it("opens in Edit, and Review is the read-only listing with threads under their lines", async () => {
    const { container } = review({ onSourceChange: vi.fn(), comments: { items: [thread] } });
    await screen.findByTestId("editor");
    const edit = screen.getByRole("button", { name: "Edit" });
    const review_ = screen.getByRole("button", { name: "Review" });
    const state = () => [edit.getAttribute("aria-pressed"), review_.getAttribute("aria-pressed"), screen.queryByTestId("editor") !== null, container.querySelector("[data-source-line]") !== null];
    const opened = state();
    fireEvent.click(review_);
    const reviewing = state();
    const underLine = within(container.querySelector<HTMLElement>('[data-source-line="8"]')!).getByRole("button", { name: /Why two lines\?/ }).dataset.sourceThread;
    fireEvent.click(edit);
    expect({ opened, reviewing, underLine, back: state() }).toEqual({
      opened: ["true", "false", true, false],
      reviewing: ["false", "true", false, true],
      underLine: threadAnchor,
      back: ["true", "false", true, false],
    });
  });

  it("marks thread ranges in the editor gutter, lists them beside it, and starts one from a selected range", async () => {
    const onCreate = vi.fn(async () => {});
    const { container } = review({ onSourceChange: vi.fn(), comments: { items: [thread], callbacks: { onCreate } } });
    await screen.findByTestId("gutter-marker");
    const rail = within(container.querySelector<HTMLElement>("[data-edit-threads]")!);
    expect({ marker: screen.getByTestId("gutter-marker").textContent, thread: rail.getByText("Why two lines?").textContent, label: rail.getByText("Lines 7–8").textContent }).toEqual({
      marker: "7-8",
      thread: "Why two lines?",
      label: "Lines 7–8",
    });
    fireEvent.click(screen.getByRole("button", { name: "gutter-comment" }));
    await post("Reword");
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0]![0]).toMatchObject({ body: "Reword", anchor: patchAnchor(capturePatch(TEXT, 2, 3)) });
  });

  it("reports edits to the host and hands host tabs the same seam", () => {
    const onSourceChange = vi.fn();
    const render_ = vi.fn(({ onSourceChange: change }: { onSourceChange?: (source: string) => void }) => (
      <button type="button" onClick={() => change?.("rewritten")}>
        rewrite
      </button>
    ));
    review({ onSourceChange, view: "tools", tabs: [{ id: "tools", label: "Tools", render: render_ }] });
    fireEvent.click(screen.getByRole("button", { name: "rewrite" }));
    expect(onSourceChange).toHaveBeenCalledWith("rewritten");
  });

  it("gives host tabs no onSourceChange when the file is not editable", () => {
    const render_ = vi.fn(() => null);
    review({ view: "tools", tabs: [{ id: "tools", label: "Tools", render: render_ }] });
    expect(Object.keys(render_.mock.calls[0]![0])).toEqual(["path", "source", "findings"]);
  });
});
