import { describe, expect, it } from "vitest";
import { DOCUMENT_ANCHOR, type Comment } from "@flanksource/clicky-ui/comments";

import { commentsToMarkdown, groupByPage } from "./markdown";
import type { PageComment } from "./useComments";

const BUTTON_ANCHOR = ":scope > div:nth-child(1) > button:nth-child(2)";
const HEADING_ANCHOR = ":scope > h1:nth-child(1)";

function comment(overrides: Partial<Comment> & { id: string; createdAt: string }): Comment {
  return {
    body: "a note",
    author: { name: "You", kind: "user" },
    status: "open",
    anchor: BUTTON_ANCHOR,
    ...overrides,
  };
}

const LABELS = {
  [BUTTON_ANCHOR]: 'button.btn.primary "Approve"',
  [HEADING_ANCHOR]: 'h1 "Pricing"',
};

/** One page's worth of notes — the shape the toolbar's primary action passes. */
function page(slug: string, comments: Comment[]) {
  return [{ page: slug, comments }];
}

describe("commentsToMarkdown", () => {
  it("reports an empty page explicitly rather than emitting a bare heading", () => {
    expect(commentsToMarkdown(page("welcome", []), {})).toBe(
      "## Playground feedback — welcome\n\n_No comments._\n",
    );
  });

  it("reports an empty result when there is not even a page to name", () => {
    expect(commentsToMarkdown([], {})).toBe("_No comments._\n");
  });

  it("renders anchor, status and author for a single note", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z", body: "too tight at 1440px" }),
      ]),
      LABELS,
    );

    expect(markdown).toBe(
      [
        "## Playground feedback — welcome",
        "",
        '### 1. button.btn.primary "Approve"',
        `- anchor: \`${BUTTON_ANCHOR}\``,
        "- status: open",
        "- You: too tight at 1440px",
        "",
      ].join("\n"),
    );
  });

  it("nests replies under their root", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "root", createdAt: "2026-01-01T00:00:00.000Z", body: "too tight" }),
        comment({
          id: "reply",
          createdAt: "2026-01-01T01:00:00.000Z",
          parentId: "root",
          body: "agreed",
          author: { name: "Agent", kind: "agent" },
        }),
      ]),
      LABELS,
    );

    expect(markdown).toContain("- You: too tight");
    expect(markdown).toContain("  - Agent replied: agreed");
  });

  it("orders replies by creation time regardless of input order", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "root", createdAt: "2026-01-01T00:00:00.000Z" }),
        comment({
          id: "late",
          createdAt: "2026-01-03T00:00:00.000Z",
          parentId: "root",
          body: "second",
        }),
        comment({
          id: "early",
          createdAt: "2026-01-02T00:00:00.000Z",
          parentId: "root",
          body: "first",
        }),
      ]),
      LABELS,
    );

    expect(markdown.indexOf("replied: first")).toBeLessThan(markdown.indexOf("replied: second"));
  });

  it("orders sections by when each anchor was first commented on", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "late", createdAt: "2026-01-02T00:00:00.000Z" }),
        comment({
          id: "early",
          createdAt: "2026-01-01T00:00:00.000Z",
          anchor: HEADING_ANCHOR,
        }),
      ]),
      LABELS,
    );

    expect(markdown.indexOf('### 1. h1 "Pricing"')).toBeLessThan(
      markdown.indexOf('### 2. button.btn.primary "Approve"'),
    );
  });

  it("labels page-level comments and omits the anchor line", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z", anchor: DOCUMENT_ANCHOR }),
      ]),
      LABELS,
    );

    expect(markdown).toContain("### 1. Page-level");
    expect(markdown).not.toContain("- anchor:");
  });

  it("falls back to the raw anchor when no label has been resolved", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z" })]),
      {},
    );

    expect(markdown).toContain(`### 1. ${BUTTON_ANCHOR}`);
  });

  it("emits one heading per page and restarts numbering", () => {
    const markdown = commentsToMarkdown(
      [
        { page: "welcome", comments: [comment({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" })] },
        { page: "reconcile", comments: [comment({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" })] },
      ],
      LABELS,
    );

    expect(markdown).toContain("## Playground feedback — welcome");
    expect(markdown).toContain("## Playground feedback — reconcile");
    expect(markdown.match(/### 1\./g)).toHaveLength(2);
    expect(markdown.indexOf("— welcome")).toBeLessThan(markdown.indexOf("— reconcile"));
  });

  it("keeps labels only for the page whose DOM is live, showing raw anchors elsewhere", () => {
    const markdown = commentsToMarkdown(
      [
        { page: "welcome", comments: [comment({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" })] },
        {
          page: "reconcile",
          comments: [
            comment({ id: "b", createdAt: "2026-01-02T00:00:00.000Z", anchor: HEADING_ANCHOR }),
          ],
        },
      ],
      { [BUTTON_ANCHOR]: 'button.btn.primary "Approve"' },
    );

    expect(markdown).toContain('### 1. button.btn.primary "Approve"');
    expect(markdown).toContain(`### 1. ${HEADING_ANCHOR}`);
  });
});

describe("groupByPage", () => {
  function pageComment(id: string, slug: string, createdAt: string): PageComment {
    return { ...comment({ id, createdAt }), page: slug };
  }

  it("returns nothing for an empty listing", () => {
    expect(groupByPage([])).toEqual([]);
  });

  it("collects each page's comments under one section, in first-seen order", () => {
    const grouped = groupByPage([
      pageComment("a", "welcome", "2026-01-01T00:00:00.000Z"),
      pageComment("b", "reconcile", "2026-01-02T00:00:00.000Z"),
      pageComment("c", "welcome", "2026-01-03T00:00:00.000Z"),
    ]);

    expect(grouped.map((section) => section.page)).toEqual(["welcome", "reconcile"]);
    expect(grouped[0]?.comments.map((entry) => entry.id)).toEqual(["a", "c"]);
  });

  it("drops the page key from the comments it groups", () => {
    const grouped = groupByPage([pageComment("a", "welcome", "2026-01-01T00:00:00.000Z")]);

    expect(grouped[0]?.comments[0]).not.toHaveProperty("page");
  });
});
