import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("resolves an open root from the visible check action", () => {
    const onUpdateStatus = vi.fn();
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={onUpdateStatus}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Resolve comment" }));
    expect(onUpdateStatus).toHaveBeenCalledWith("resolved");
  });

  it("shows a status update error when resolving fails", async () => {
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={vi.fn().mockRejectedValue(new Error("resolve failed"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resolve comment" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Couldn't update comment: resolve failed",
      ),
    );
  });

  it("keeps non-resolve statuses and delete in the actions menu", async () => {
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));

    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: /In progress/ }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("menuitem", { name: /Resolved/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete" }),
    ).toBeInTheDocument();
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
