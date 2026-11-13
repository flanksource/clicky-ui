import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CommentCard } from "./CommentCard";
import { DEFAULT_COMMENT_STATUSES, type Comment } from "./comment-types";

const comment: Comment = {
  id: "review-result",
  body: "Review findings",
  createdAt: "2026-01-01T00:00:00Z",
  author: {
    name: "markdown-review",
    kind: "agent",
    model: "claude-opus-5-5",
    effort: "high",
  },
};

it.each([false, true])("shows the named review and runtime icons when expanded=%s", (expanded) => {
  render(<CommentCard comment={comment} config={{ statuses: DEFAULT_COMMENT_STATUSES }} defaultExpanded={expanded} />);
  expect(screen.getByText("markdown-review")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "markdown-review" }).querySelector("svg")).toHaveClass("text-[#C15F3C]");
  expect(screen.getByLabelText("High effort").querySelector("svg")).not.toBeNull();
  expect(screen.getByTitle("markdown-review · claude-opus-5-5 · high effort")).toBeInTheDocument();
});
