import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentThread } from "./CommentThread";
import { DEFAULT_COMMENT_STATUSES, type Comment } from "./comment-types";

const comment: Comment = {
  id: "thread-root",
  body: "Review this result",
  createdAt: "2026-10-18T09:00:00.000Z",
  author: { name: "Reviewer" },
  status: "open",
};

describe("CommentThread", () => {
  it("forwards close from the focused thread header to the root callback", () => {
    const onClose = vi.fn();
    render(
      <CommentThread
        comments={[comment]}
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        defaultExpanded
        hideComposer
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close comment" }));
    expect(onClose).toHaveBeenCalledExactlyOnceWith(comment.id);
  });
});
