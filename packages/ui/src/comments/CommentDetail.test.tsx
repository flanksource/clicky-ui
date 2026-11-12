import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CommentThreadList } from "./CommentThreadList";
import { DEFAULT_COMMENT_STATUSES, type Comment } from "./comment-types";
import { setCommentDraft } from "../test/comment-editor";

const root: Comment = { id: "detail-root", body: "A long root", createdAt: "2026-11-04", author: { name: "Ada" } };

it("loads only the selected detail tab and keeps a failed reply draft across tabs", async () => {
  const capture = vi.fn(() => <p>Screenshot context</p>);
  const agents = vi.fn(() => <p>Agent context</p>);
  const onReply = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
  render(<CommentThreadList comments={[root]} config={{ statuses: DEFAULT_COMMENT_STATUSES }}
    detailTabs={[{ id: "capture", label: "Capture", render: capture }, { id: "agents", label: "Agents", render: agents }]}
    onReply={onReply} previewLines={3} />);
  fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
  fireEvent.click(screen.getByText("Maximise"));
  const dialog = within(screen.getByRole("dialog", { name: "Comment thread" }));
  expect(capture).not.toHaveBeenCalled();
  expect(agents).not.toHaveBeenCalled();
  const input = dialog.getByRole("textbox", { name: "Write a reply…" });
  setCommentDraft(input, "Keep this reply");
  fireEvent.click(dialog.getByRole("tab", { name: "Capture" }));
  expect(capture).toHaveBeenCalled();
  expect(agents).not.toHaveBeenCalled();
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Send" })));
  expect(dialog.getByRole("alert")).toHaveTextContent("Offline");
  expect(input).toHaveTextContent("Keep this reply");
  fireEvent.click(dialog.getByRole("tab", { name: "Agents" }));
  expect(agents).toHaveBeenCalled();
  expect(input).toHaveTextContent("Keep this reply");
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Send" })));
  expect(onReply).toHaveBeenLastCalledWith(root, "Keep this reply");
  expect(input).toHaveTextContent("");
});
