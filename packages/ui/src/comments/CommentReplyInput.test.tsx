import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { setCommentDraft } from "../test/comment-editor";
import { CommentReplyInput } from "./CommentReplyInput";
import { CommentThread } from "./CommentThread";
import { DEFAULT_COMMENT_STATUSES, type Comment, type CommentConfig } from "./comment-types";

const mentionables = [
  { id: "agent", name: "agent", kind: "agent" as const },
  { id: "runtime:claude", name: "claude", kind: "agent" as const },
  { id: "session:review-7", name: "review-7", kind: "agent" as const },
];
const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES, mentionables };

describe("CommentReplyInput", () => {
  it("autocompletes @agent, the runtime families and session slugs from config.mentionables", async () => {
    render(<CommentReplyInput parentId="t1" config={config} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    setCommentDraft(screen.getByTestId("comment-reply-input"), "@");

    await waitFor(() => expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(mentionables.map((m) => `@${m.name}`)));
  });

  it("submits the typed body unchanged", async () => {
    const onSubmit = vi.fn();
    render(<CommentReplyInput parentId="t1" config={config} onSubmit={onSubmit} onCancel={vi.fn()} />);
    setCommentDraft(screen.getByTestId("comment-reply-input"), "@claude take another look");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("@claude take another look"));
  });

  describe("what it says about delivery", () => {
    it("says a reply is delivered only when it names an @target, because the comment agent rule applies to new threads, not replies", () => {
      render(<CommentReplyInput parentId="t1" config={{ ...config, defaultDelivery: { label: "claude-opus-5-5", layer: "user" } }} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByTestId("reply-delivery").textContent).toBe("Replies are delivered only when they name an @target");
    });

    it("never states the new-thread default, which would send an unaddressed reply nowhere", () => {
      render(<CommentReplyInput parentId="t1" config={{ ...config, defaultDelivery: { label: "claude-opus-5-5", layer: "user" } }} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.queryByTestId("default-delivery")).toBeNull();
      expect(document.body.textContent).not.toContain("Comments without an @target");
    });

    it.each([{ name: "a null default" }, { name: "no default" }])("says it whether or not a rule is enabled ($name), since @mentions deliver either way", ({ name }) => {
      render(<CommentReplyInput parentId="t1" config={{ ...config, ...(name === "a null default" ? { defaultDelivery: null } : {}) }} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByTestId("reply-delivery")).toBeTruthy();
    });

    it("says nothing when the host offers nothing to address", () => {
      render(<CommentReplyInput parentId="t1" config={{ statuses: DEFAULT_COMMENT_STATUSES }} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.queryByTestId("reply-delivery")).toBeNull();
    });
  });
});

describe("CommentThread reply with an @agent", () => {
  const root: Comment = { id: "t1", body: "Why is this slow?", createdAt: "2026-01-01T00:00:00.000Z", status: "open", author: { name: "Ada" } };

  it("hands onReply the body unchanged and no deliver target", async () => {
    const onReply = vi.fn();
    render(<CommentThread comments={[root]} config={config} defaultExpanded hideComposer onReply={onReply} />);
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    setCommentDraft(screen.getByTestId("comment-reply-input"), "@claude profile it");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(onReply).toHaveBeenCalledTimes(1));
    const input = onReply.mock.calls[0]?.[0] as Record<string, unknown>;
    expect([input.body, "target" in input, "deliver" in input]).toEqual(["@claude profile it", false, false]);
  });
});
