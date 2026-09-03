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
  it.each([
    ["positive", "Positive rating"],
    ["negative", "Negative rating"],
  ] as const)(
    "renders a %s rating on a rating-only comment",
    (rating, label) => {
      render(
        <CommentCard
          comment={{ ...root, body: "", rating }}
          config={config}
          defaultExpanded
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.queryByTestId("comment-markdown")).not.toBeInTheDocument();
    },
  );

  it("expands from the collapsed preview on click", () => {
    render(<CommentCard comment={root} config={config} />);
    fireEvent.click(screen.getByTestId("comment-card"));
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("resolves an open root from the actions menu", () => {
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
    fireEvent.click(screen.getByRole("menuitem", { name: "Resolve" }));
    expect(onUpdateStatus).toHaveBeenCalledWith("resolved");
  });

  it("offers a human close action only for a resolved root", () => {
    const onClose = vi.fn();
    const onUpdateStatus = vi.fn();
    render(
      <CommentCard
        comment={{ ...root, status: "resolved" }}
        config={config}
        defaultExpanded
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
      />,
    );

    expect(screen.getByText("Resolved")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Close", "Reopen"]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUpdateStatus).not.toHaveBeenCalled();
  });

  it("renders human closure attribution and never offers close twice", () => {
    render(
      <CommentCard
        comment={{
          ...root,
          status: "closed",
          closedAt: "2026-01-02T00:00:00.000Z",
          closedBy: { name: "Bo", kind: "user" },
        }}
        config={config}
        defaultExpanded
        onClose={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByText("Closed by Bo")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    expect(screen.queryByRole("menuitem", { name: "Close" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Reopen" })).toBeVisible();
  });

  it("resolves an open root from the collapsed actions menu without expanding", () => {
    const onUpdateStatus = vi.fn();
    render(
      <CommentCard
        comment={root}
        config={config}
        onUpdateStatus={onUpdateStatus}
        onReply={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Resolve" }));

    expect(onUpdateStatus).toHaveBeenCalledWith("resolved");
    expect(
      screen.queryByRole("button", { name: "Reply" }),
    ).not.toBeInTheDocument();
  });

  it("closes an open root when closed is the configured completion status", () => {
    const onUpdateStatus = vi.fn();
    render(
      <CommentCard
        comment={root}
        config={{
          statuses: [
            {
              value: "open",
              label: "Open",
              unresolved: true,
              stage: "active",
            },
            { value: "closed", label: "Closed", stage: "resolved" },
          ],
        }}
        onUpdateStatus={onUpdateStatus}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Resolve" }));

    expect(onUpdateStatus).toHaveBeenCalledWith("closed");
  });

  it.each(["resolved", "closed"])(
    "does not offer a resolve action for a %s root",
    (status) => {
      render(
        <CommentCard
          comment={{ ...root, status }}
          config={config}
          onUpdateStatus={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Resolve comment" }),
      ).not.toBeInTheDocument();
    },
  );

  it.each(["resolved", "closed"])(
    "reopens a %s root to the first unresolved status",
    (status) => {
      const onUpdateStatus = vi.fn();
      render(
        <CommentCard
          comment={{ ...root, status }}
          config={config}
          defaultExpanded
          onUpdateStatus={onUpdateStatus}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Reopen" }));

      expect(onUpdateStatus).toHaveBeenCalledWith("open");
    },
  );

  it("shows a status update error when resolving fails", async () => {
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={vi.fn().mockRejectedValue(new Error("resolve failed"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Resolve" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Couldn't update comment: resolve failed",
      ),
    );
  });

  it("shows a status update error when collapsed resolving fails", async () => {
    render(
      <CommentCard
        comment={root}
        config={config}
        onUpdateStatus={vi.fn().mockRejectedValue(new Error("resolve failed"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Resolve" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Couldn't update comment: resolve failed",
      ),
    );
  });

  it("orders the root actions as Delete, Resolve, Copy, Maximise", async () => {
    render(
      <CommentCard
        comment={root}
        config={config}
        defaultExpanded
        onUpdateStatus={vi.fn()}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        onMaximize={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));

    await waitFor(() =>
      expect(screen.getAllByRole("menuitem")).toHaveLength(4),
    );
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Delete", "Resolve", "Copy", "Maximise"]);
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
