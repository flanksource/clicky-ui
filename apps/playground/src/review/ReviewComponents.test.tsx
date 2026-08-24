// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CommentProvider,
  DEFAULT_COMMENT_STATUSES,
  strictAnchorResolver,
  type Comment,
} from "@flanksource/clicky-ui/comments";

import { BestPractice, ReviewVariant } from "./ReviewComponents";

afterEach(cleanup);

function renderReview(
  comments: Comment[],
  callbacks: {
    onCreate?: ReturnType<typeof vi.fn>;
    onUpdateRating?: ReturnType<typeof vi.fn>;
    onDelete?: ReturnType<typeof vi.fn>;
  } = {},
) {
  return render(
    <CommentProvider
      comments={comments}
      config={{ statuses: DEFAULT_COMMENT_STATUSES }}
      resolveAnchor={strictAnchorResolver}
      {...callbacks}
    >
      <BestPractice
        id="preview-first"
        title="Preview before save"
        description="Show the result beside the editor."
      />
      <ReviewVariant
        id="compact-table"
        title="Compact table"
        verdict="Keeps the comparison scannable."
        onDiscard={vi.fn()}
      >
        <div>Live specimen</div>
      </ReviewVariant>
    </CommentProvider>,
  );
}

describe("structured playground review components", () => {
  it("gives best practices and variants stable routable anchors", () => {
    renderReview([]);

    expect(
      screen
        .getByRole("link", { name: "Link to Preview before save" })
        .getAttribute("href"),
    ).toBe("#preview-first");
    expect(
      screen
        .getByRole("link", { name: "Link to Compact table" })
        .getAttribute("href"),
    ).toBe("#compact-table");
  });

  it("creates a rating-only comment at the component anchor", () => {
    const onCreate = vi.fn();
    renderReview([], { onCreate });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Rate Compact table positively",
      }),
    );

    expect(onCreate).toHaveBeenCalledWith({
      anchor: "#compact-table",
      body: "",
      rating: "positive",
    });
  });

  it("changes the local reviewer's existing rating instead of duplicating it", () => {
    const onUpdateRating = vi.fn();
    renderReview(
      [
        {
          id: "rating-1",
          body: "",
          createdAt: "2026-08-23T10:00:00.000Z",
          author: { name: "You", kind: "user" },
          anchor: "#compact-table",
          rating: "positive",
        },
      ],
      { onUpdateRating },
    );

    expect(
      screen.getByRole("button", { name: "Rate Compact table positively" })
        .textContent,
    ).toContain("1");
    fireEvent.click(
      screen.getByRole("button", { name: "Rate Compact table negatively" }),
    );

    expect(onUpdateRating).toHaveBeenCalledWith("rating-1", "negative");
  });

  it("exposes an explicit discard action for a variant", () => {
    const onDiscard = vi.fn();
    render(
      <ReviewVariant
        id="dense-list"
        title="Dense list"
        verdict="Too difficult to scan."
        onDiscard={onDiscard}
      >
        <div>Dense list specimen</div>
      </ReviewVariant>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Discard Dense list" }));

    expect(onDiscard).toHaveBeenCalledOnce();
  });
});
