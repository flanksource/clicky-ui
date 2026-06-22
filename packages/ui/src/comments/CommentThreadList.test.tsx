import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentThreadList } from "./CommentThreadList";
import {
  DEFAULT_COMMENT_STATUSES,
  type Comment,
  type CommentConfig,
} from "./comment-types";

const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };

const comments: Comment[] = [
  {
    id: "r1",
    body: "root comment",
    createdAt: "2026-01-01T00:00:00.000Z",
    status: "open",
    author: { name: "Ada" },
  },
  {
    id: "c1",
    body: "a reply",
    parentId: "r1",
    createdAt: "2026-01-01T01:00:00.000Z",
    author: { name: "Bo" },
  },
];

describe("CommentThreadList", () => {
  it("renders a card per root and reply", () => {
    render(<CommentThreadList comments={comments} config={config} />);
    const cards = screen.getAllByTestId("comment-card");
    expect(cards).toHaveLength(2);
    expect(
      cards.some((c) => c.getAttribute("data-comment-kind") === "reply"),
    ).toBe(true);
  });

  it("submits an inline reply through the reply affordance", async () => {
    const onReply = vi.fn();
    render(
      <CommentThreadList
        comments={comments}
        config={config}
        onReply={onReply}
      />,
    );

    // Expand the root, open its reply box, type, and submit with Enter.
    fireEvent.click(screen.getAllByTestId("comment-card")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    const input = screen.getByTestId("comment-reply-input");
    fireEvent.change(input, { target: { value: "thanks" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(onReply).toHaveBeenCalledTimes(1);
    expect(onReply.mock.calls[0]?.[0]).toMatchObject({ id: "r1" });
    expect(onReply.mock.calls[0]?.[1]).toBe("thanks");
  });
});
