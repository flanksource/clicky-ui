import { describe, expect, it } from "vitest";

import type { StoredComment } from "./comments-store";
import { recordReviewDecision } from "./review-decisions";

const author = { name: "You", kind: "user" } as const;
const element = { source: "page.tsx:1", html: "<div></div>" };

function decision(
  id: string,
  reviewDecision: "approved" | "rejected" | "revision_requested",
  body = "",
): StoredComment {
  return {
    id,
    createdAt: `2026-09-28T00:00:0${id === "first" ? 1 : 2}.000Z`,
    body,
    author,
    anchor: '[data-review-id="review-one"]',
    parentId: null,
    status: "open",
    reviewDecision,
    element,
  };
}

describe("review decisions", () => {
  it("requires a comment for rejection and revision", () => {
    expect(() =>
      recordReviewDecision([], decision("first", "rejected")),
    ).toThrow(/comment/i);
    expect(() =>
      recordReviewDecision([], decision("first", "revision_requested")),
    ).toThrow(/comment/i);
  });

  it("retains earlier rationale but closes it when approval supersedes it", () => {
    const rejected = decision("first", "rejected", "Alignment is wrong");
    const approved = decision("second", "approved");
    const result = recordReviewDecision([rejected], approved);

    expect(result).toMatchObject([
      {
        id: "first",
        body: "Alignment is wrong",
        status: "closed",
        closedBy: author,
      },
      { id: "second", reviewDecision: "approved", status: "closed" },
    ]);
  });
});
