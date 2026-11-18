import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setCommentDraft } from "../test/comment-editor";
import { CommentCard } from "./CommentCard";
import { CommentThread } from "./CommentThread";
import { DEFAULT_COMMENT_STATUSES, type Comment, type CommentConfig } from "./comment-types";

const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };
const root: Comment = { id: "t1", body: "The total ignores the discount", createdAt: "2026-01-01T00:00:00.000Z", status: "open", author: { name: "Ada" }, anchor: "e:main" };
const reply: Comment = { id: "m1", parentId: "t1", body: "Reproduced", createdAt: "2026-01-01T00:05:00.000Z", author: { name: "claude", kind: "agent" } };
const thread = [root, reply];

/** Opens the actions menu of the card holding `body`. */
function openActions(body: string) {
  const card = screen.getByText(body).closest<HTMLElement>("[data-testid='comment-card']");
  if (!card) throw new Error(`No card shows ${body}`);
  fireEvent.click(within(card).getByRole("button", { name: "Comment actions" }));
}
const menuLabels = () => screen.queryAllByRole("menuitem").map((item) => item.textContent);

function renderThread(callbacks: Partial<React.ComponentProps<typeof CommentThread>> = {}) {
  return render(<CommentThread comments={thread} config={config} defaultExpanded hideComposer {...callbacks} />);
}

describe("CommentThread actions", () => {
  it("edits the root through onEdit(id, body)", async () => {
    const onEdit = vi.fn();
    renderThread({ onEdit });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    setCommentDraft(screen.getByTestId("comment-edit-input"), "The total ignores the 20% discount");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onEdit).toHaveBeenCalledExactlyOnceWith("t1", "The total ignores the 20% discount"));
  });

  it("edits a reply through onEditReply(rootId, messageId, body), never onEdit", async () => {
    const onEdit = vi.fn();
    const onEditReply = vi.fn();
    renderThread({ onEdit, onEditReply });
    openActions(reply.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    setCommentDraft(screen.getByTestId("comment-edit-input"), "Reproduced on Safari too");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onEditReply).toHaveBeenCalledExactlyOnceWith("t1", "m1", "Reproduced on Safari too"));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("starts the editor from the current body and restores it on Cancel without calling back", () => {
    const onEdit = vi.fn();
    renderThread({ onEdit });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(screen.getByTestId("comment-edit-input")).toHaveTextContent(root.body);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect([screen.queryByTestId("comment-edit-input"), screen.getByText(root.body) !== null, onEdit.mock.calls.length]).toEqual([null, true, 0]);
  });

  it("closes the editor without calling back when the body is unchanged", () => {
    const onEdit = vi.fn();
    renderThread({ onEdit });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect([screen.queryByTestId("comment-edit-input"), onEdit.mock.calls.length]).toEqual([null, 0]);
  });

  it("keeps the editor open and shows the error when saving fails", async () => {
    renderThread({ onEdit: vi.fn().mockRejectedValue(new Error("version conflict")) });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    setCommentDraft(screen.getByTestId("comment-edit-input"), "A new body");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("version conflict");
    expect(screen.getByTestId("comment-edit-input")).toBeVisible();
  });

  it("deletes a reply through onDeleteReply(rootId, messageId) instead of onDelete", () => {
    const onDelete = vi.fn();
    const onDeleteReply = vi.fn();
    renderThread({ onDelete, onDeleteReply });
    openActions(reply.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onDeleteReply).toHaveBeenCalledExactlyOnceWith("t1", "m1");
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("still deletes the root through onDelete(id)", () => {
    const onDelete = vi.fn();
    const onDeleteReply = vi.fn();
    renderThread({ onDelete, onDeleteReply });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledExactlyOnceWith("t1");
    expect(onDeleteReply).not.toHaveBeenCalled();
  });

  it("creates a todo from the whole thread, root first, offered on roots only", () => {
    const onCreateTodo = vi.fn();
    renderThread({ onCreateTodo });
    openActions(reply.body);
    expect(screen.queryByRole("menuitem", { name: "Create todo" })).toBeNull();
    fireEvent.keyDown(document.body, { key: "Escape" });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Create todo" }));

    expect(onCreateTodo).toHaveBeenCalledExactlyOnceWith([root, reply]);
  });

  it("shows the todo callback's failure on the card", async () => {
    renderThread({ onCreateTodo: vi.fn().mockRejectedValue(new Error("gavel is unreachable")) });
    openActions(root.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Create todo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't create todo from comment: gavel is unreachable");
  });

  it("offers none of Edit, Delete or Create todo when their callbacks are absent", () => {
    renderThread({ onClose: vi.fn() });
    openActions(root.body);
    expect(menuLabels()).not.toEqual(expect.arrayContaining(["Edit"]));
    expect(menuLabels()).not.toEqual(expect.arrayContaining(["Delete"]));
    expect(menuLabels()).not.toEqual(expect.arrayContaining(["Create todo"]));
  });

  it("offers a reply no Edit when only onEdit is provided", () => {
    renderThread({ onEdit: vi.fn() });
    openActions(reply.body);
    expect(menuLabels()).toEqual(["Maximise"]);
  });

  it("falls back to onDelete(messageId) for a reply when no onDeleteReply is provided", () => {
    const onDelete = vi.fn();
    renderThread({ onDelete });
    openActions(reply.body);
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledExactlyOnceWith("m1");
  });
});

describe("CommentCard actions", () => {
  it("offers Edit from the collapsed card and expands to the editor", () => {
    const onEdit = vi.fn();
    render(<CommentCard comment={root} config={config} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(screen.getByTestId("comment-edit-input")).toHaveTextContent(root.body);
  });

  it("renders no actions menu without any action callback", () => {
    render(<CommentCard comment={root} config={config} defaultExpanded />);
    expect(screen.queryByRole("button", { name: "Comment actions" })).toBeNull();
  });
});
