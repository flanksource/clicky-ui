import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentCard } from "./CommentCard";
import {
  DEFAULT_COMMENT_STATUSES,
  type Comment,
  type CommentConfig,
} from "./comment-types";

const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };

const root: Comment = {
  id: "r1",
  body: "needs review",
  createdAt: "2026-01-01T00:00:00.000Z",
  status: "open",
  author: { name: "Ada" },
};

describe("CommentCard", () => {
  it("expands from the collapsed preview on click", () => {
    render(<CommentCard comment={root} config={config} />);
    fireEvent.click(screen.getByTestId("comment-card"));
    // The expanded header shows the full status label, not just the chip.
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("invokes onUpdateStatus from the actions menu", () => {
    const onUpdateStatus = vi.fn();
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={onUpdateStatus}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Resolved/ }));
    expect(onUpdateStatus).toHaveBeenCalledWith("resolved");
  });

  it("invokes onDelete from the actions menu", () => {
    const onDelete = vi.fn();
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("toggles a checklist item", () => {
    const onChecklistToggle = vi.fn();
    const withChecklist: Comment = {
      ...root,
      checklist: [{ label: "Verify totals", status: "open" }],
    };
    render(
      <CommentCard
        comment={withChecklist}
        config={config}
        defaultExpanded
        onChecklistToggle={onChecklistToggle}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Verify totals" }));
    expect(onChecklistToggle).toHaveBeenCalledWith(0);
  });
});
