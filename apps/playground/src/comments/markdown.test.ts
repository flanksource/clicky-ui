import { describe, expect, it } from "vitest";
import { DOCUMENT_ANCHOR, type Comment } from "@flanksource/clicky-ui/comments";

import { commentsToMarkdown } from "./markdown";

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

describe("commentsToMarkdown", () => {
  it("reports an empty page explicitly rather than emitting a bare heading", () => {
    expect(commentsToMarkdown("welcome", [], {})).toBe(
      "## Playground feedback — welcome\n\n_No comments._\n",
    );
  });

  it("renders anchor, status and author for a single note", () => {
    const markdown = commentsToMarkdown(
      "welcome",
      [comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z", body: "too tight at 1440px" })],
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
      "welcome",
      [
        comment({ id: "root", createdAt: "2026-01-01T00:00:00.000Z", body: "too tight" }),
        comment({
          id: "reply",
          createdAt: "2026-01-01T01:00:00.000Z",
          parentId: "root",
          body: "agreed",
          author: { name: "Agent", kind: "agent" },
        }),
      ],
      LABELS,
    );

    expect(markdown).toContain("- You: too tight");
    expect(markdown).toContain("  - Agent replied: agreed");
  });

  it("orders sections by when each anchor was first commented on", () => {
    const markdown = commentsToMarkdown(
      "welcome",
      [
        comment({ id: "late", createdAt: "2026-01-02T00:00:00.000Z" }),
        comment({
          id: "early",
          createdAt: "2026-01-01T00:00:00.000Z",
          anchor: HEADING_ANCHOR,
        }),
      ],
      LABELS,
    );

    expect(markdown.indexOf('### 1. h1 "Pricing"')).toBeLessThan(
      markdown.indexOf('### 2. button.btn.primary "Approve"'),
    );
  });

  it("labels page-level comments and omits the anchor line", () => {
    const markdown = commentsToMarkdown(
      "welcome",
      [comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z", anchor: DOCUMENT_ANCHOR })],
      LABELS,
    );

    expect(markdown).toContain("### 1. Page-level");
    expect(markdown).not.toContain("- anchor:");
  });

  it("falls back to the raw anchor when no label has been resolved", () => {
    const markdown = commentsToMarkdown(
      "welcome",
      [comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z" })],
      {},
    );

    expect(markdown).toContain(`### 1. ${BUTTON_ANCHOR}`);
  });
});
