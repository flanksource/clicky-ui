import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentProvider } from "./CommentProvider";
import { CommentSidePanel } from "./CommentSidePanel";
import { strictAnchorResolver, useCommentContext } from "./comment-context";
import type { Comment } from "./comment-types";

const config = {
  statuses: [{ value: "open", label: "Open", unresolved: true }],
};

const comments: Comment[] = [
  {
    id: "comment-1",
    body: "Review this amount",
    createdAt: "2026-01-01T00:00:00.000Z",
    anchor: "cell-1",
    author: { name: "Ada" },
  },
];

function TestSurface({ scrollTo }: { scrollTo: ReturnType<typeof vi.fn> }) {
  const ctx = useCommentContext();
  return (
    <div>
      <div
        data-testid="comment-content"
        ref={(container) => {
          if (!container) return;
          Object.defineProperties(container, {
            scrollTop: { configurable: true, value: 0, writable: true },
            clientHeight: { configurable: true, value: 400 },
            scrollTo: { configurable: true, value: scrollTo },
          });
          container.getBoundingClientRect = () =>
            ({ top: 50, height: 400 }) as DOMRect;
          ctx.contentRef.current = container;
        }}
      >
        <div
          ref={(anchor) => {
            if (!anchor) return;
            anchor.getBoundingClientRect = () =>
              ({ top: 250, height: 30 }) as DOMRect;
            ctx.registerAnchor("cell-1", anchor);
          }}
        />
      </div>
      <button type="button" onClick={ctx.openCommentList}>
        Open comments
      </button>
      <CommentSidePanel focusedAlignment="anchor" />
    </div>
  );
}

describe("CommentSidePanel anchor navigation", () => {
  it("scrolls and focuses a clicked thread while preserving interactive controls", () => {
    const scrollTo = vi.fn();
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={scrollTo} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
    expect(screen.getByTestId("comment-all-rail")).toBeInTheDocument();
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("comment-card"));
    expect(scrollTo).toHaveBeenCalledWith({ top: 188, behavior: "smooth" });
    expect(screen.getByTestId("comment-focused-rail")).toHaveStyle({
      top: "250px",
    });
    expect(screen.getByText("Review this amount")).toBeVisible();

    const focused = screen.getByTestId("comment-focused-rail");
    focused.getBoundingClientRect = () =>
      ({
        top: 12 + (Number.parseFloat(focused.style.top) || 0),
      }) as DOMRect;
    Object.defineProperty(focused, "offsetTop", {
      configurable: true,
      get: () => 12 + (Number.parseFloat(focused.style.top) || 0),
    });

    fireEvent.scroll(screen.getByTestId("comment-content"));
    expect(focused).toHaveStyle({ top: "238px" });
    fireEvent.scroll(screen.getByTestId("comment-content"));
    expect(focused).toHaveStyle({ top: "238px" });
  });

  it("keeps comments with no exact registered anchor visible but unavailable", () => {
    const scrollTo = vi.fn();
    render(
      <CommentProvider
        comments={[
          ...comments,
          {
            id: "comment-2",
            body: "Legacy comment",
            createdAt: "2026-01-02T00:00:00.000Z",
            anchor: "cell-2",
            author: { name: "Bo" },
          },
        ]}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={scrollTo} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    expect(screen.getByText("cell-2 · Unavailable")).toBeVisible();
    fireEvent.click(screen.getAllByTestId("comment-card")[1]);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.getByTestId("comment-all-rail")).toBeVisible();
  });

  it("collapses cards outside the focused thread", () => {
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    expect(screen.getByTestId("comment-card")).toHaveAttribute(
      "role",
      "button",
    );

    fireEvent.click(screen.getByTestId("comment-card"));
    expect(screen.getByTestId("comment-card")).not.toHaveAttribute("role");

    fireEvent.click(screen.getByRole("button", { name: "All comments (1)" }));
    expect(screen.getByTestId("comment-card")).toHaveAttribute(
      "role",
      "button",
    );
  });

  it("exposes a direct reply while distinguishing a new root comment", async () => {
    const onReply = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={onReply}
        onCreate={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    fireEvent.click(screen.getByTestId("comment-card"));

    expect(screen.getByRole("button", { name: "Reply" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add another top-level comment…" }),
    ).toBeVisible();
    expect(
      screen.queryByTestId("comment-compose-input"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.change(screen.getByPlaceholderText("Write a reply…"), {
      target: { value: "Compare the render cost." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(onReply).toHaveBeenCalledWith({
        parentId: "comment-1",
        body: "Compare the render cost.",
        anchor: "cell-1",
      });
    });
  });

  it("renders an agent reply in the focused rail even though replies carry no anchor", () => {
    const reply: Comment = {
      id: "reply-1",
      body: "Done — the cell now renders a checkmark.",
      createdAt: "2026-01-01T01:00:00.000Z",
      parentId: "comment-1",
      author: { name: "Claude Code", kind: "agent" },
    };
    render(
      <CommentProvider
        comments={[...comments, reply]}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    fireEvent.click(screen.getAllByTestId("comment-card")[0]);

    const focused = screen.getByTestId("comment-focused-rail");
    expect(focused).toHaveTextContent("Claude Code");
    expect(focused).toHaveTextContent(reply.body);
  });

  it("opens straight into the comment list when seeded with a rail mode", () => {
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
        initialRailMode="all"
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    expect(screen.getByTestId("comment-all-rail")).toBeInTheDocument();
    expect(screen.getByText("Review this amount")).toBeVisible();
  });

  it("hides resolved threads until the resolved toggle is used", () => {
    const statusConfig = {
      statuses: [
        { value: "open", label: "Open", unresolved: true },
        { value: "resolved", label: "Resolved" },
      ],
    };
    const mixed: Comment[] = [
      {
        id: "c-open",
        body: "Still open",
        createdAt: "2026-01-01T00:00:00.000Z",
        anchor: "cell-1",
        status: "open",
        author: { name: "Ada" },
      },
      {
        id: "c-done",
        body: "Already resolved",
        createdAt: "2026-01-02T00:00:00.000Z",
        anchor: "cell-1",
        status: "resolved",
        author: { name: "Bo" },
      },
    ];
    render(
      <CommentProvider
        comments={mixed}
        config={statusConfig}
        resolveAnchor={strictAnchorResolver}
        initialRailMode="all"
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    expect(screen.getByText("Still open")).toBeVisible();
    expect(screen.queryByText("Already resolved")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resolved (1)" }));
    expect(screen.getByText("Already resolved")).toBeVisible();
    expect(screen.getByText("Still open")).toBeVisible();
  });

  it("pins the rail header outside the anchor-offset box", () => {
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
        onReply={vi.fn()}
      >
        <TestSurface scrollTo={vi.fn()} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open comments" }));
    fireEvent.click(screen.getByTestId("comment-card"));

    const header = screen.getByTestId("comment-rail-header");
    expect(header).toHaveClass("sticky");
    expect(
      screen.getByTestId("comment-focused-rail").contains(header),
    ).toBe(false);
    expect(screen.getByTestId("comment-side-panel").contains(header)).toBe(true);
  });
});
