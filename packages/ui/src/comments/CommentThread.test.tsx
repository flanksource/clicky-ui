import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentThread } from "./CommentThread";
import { sampleProposal } from "./comment-fixtures";
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

  it("lets a proposal reply act through the thread's proposal callbacks", async () => {
    const onRejectProposal = vi.fn();
    const proposalReply: Comment = {
      id: "thread-reply",
      parentId: comment.id,
      body: "Proposed a fix",
      createdAt: "2026-10-18T09:05:00.000Z",
      author: { name: "claude", kind: "agent" },
      proposal: sampleProposal,
    };
    render(
      <CommentThread
        comments={[comment, proposalReply]}
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        defaultExpanded
        hideComposer
        onRejectProposal={onRejectProposal}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject proposal" }));
    await waitFor(() =>
      expect(onRejectProposal).toHaveBeenCalledExactlyOnceWith(proposalReply.id, undefined),
    );
  });
});
