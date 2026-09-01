import { describe, expect, it } from "vitest";
import { DOCUMENT_ANCHOR, type Comment } from "@flanksource/clicky-ui/comments";

import { commentsForFolder, commentsToMarkdown, groupByPage } from "./markdown";
import type { PageComment } from "./useComments";
import type { CommentElementContext } from "../../plugins/comments-model";

const BUTTON_ANCHOR = ":scope > div:nth-child(1) > button:nth-child(2)";
const HEADING_ANCHOR = ":scope > h1:nth-child(1)";

function comment(
  overrides: Partial<Comment> & { id: string; createdAt: string },
): Comment {
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

const MARKDOWN_OPTIONS = {
  labels: LABELS,
  pageUrl: (slug: string) =>
    `http://localhost:5274/?page=${encodeURIComponent(slug)}`,
  pagePath: (slug: string) => `apps/playground/src/pages/${slug}.tsx`,
};

const RAW_ANCHOR_OPTIONS = { ...MARKDOWN_OPTIONS, labels: {} };

/** One page's worth of notes — the shape the toolbar's primary action passes. */
function page(slug: string, comments: Comment[]) {
  return [{ page: slug, comments }];
}

describe("commentsToMarkdown", () => {
  it("reports an empty page explicitly rather than emitting a bare heading", () => {
    expect(commentsToMarkdown(page("welcome", []), RAW_ANCHOR_OPTIONS)).toBe(
      [
        "## Playground feedback — welcome",
        "- URL: http://localhost:5274/?page=welcome",
        "- source: `apps/playground/src/pages/welcome.tsx`",
        "",
        "_No comments._",
        "",
      ].join("\n"),
    );
  });

  it("reports an empty result when there is not even a page to name", () => {
    expect(commentsToMarkdown([], RAW_ANCHOR_OPTIONS)).toBe("_No comments._\n");
  });

  it("renders anchor, status and author for a single note", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({
          id: "c1",
          createdAt: "2026-01-01T00:00:00.000Z",
          body: "too tight at 1440px",
        }),
      ]),
      MARKDOWN_OPTIONS,
    );

    expect(markdown).toBe(
      [
        "## Playground feedback — welcome",
        "- URL: http://localhost:5274/?page=welcome",
        "- source: `apps/playground/src/pages/welcome.tsx`",
        "",
        '### 1. button.btn.primary "Approve"',
        `- anchor: \`${BUTTON_ANCHOR}\``,
        "- status: open",
        "- You: too tight at 1440px",
        "",
      ].join("\n"),
    );
  });

  it("includes the rating in copied feedback", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({
          id: "c1",
          createdAt: "2026-01-01T00:00:00.000Z",
          rating: "negative",
        }),
      ]),
      MARKDOWN_OPTIONS,
    );

    expect(markdown).toContain("- rating: negative");
  });

  it("includes the captured React component, source stack, and HTML", () => {
    const rich = comment({
      id: "c1",
      createdAt: "2026-01-01T00:00:00.000Z",
      body: "make the action clearer",
    }) as Comment & { element: CommentElementContext };
    rich.element = {
      componentName: "ApproveButton",
      source: [
        "ApproveButton at /workspace/src/ApproveButton.tsx:27:5",
        "ReviewPage at /workspace/src/ReviewPage.tsx:14:3",
      ].join("\n"),
      html: '<button class="btn-primary">Approve</button>',
    };

    const markdown = commentsToMarkdown(
      page("welcome", [rich]),
      MARKDOWN_OPTIONS,
    );

    expect(markdown).toContain("**Component:** `<ApproveButton>`");
    expect(markdown).toContain(
      "```\nApproveButton at /workspace/src/ApproveButton.tsx:27:5\n" +
        "ReviewPage at /workspace/src/ReviewPage.tsx:14:3\n```",
    );
    expect(markdown).toContain(
      '**HTML:**\n```html\n<button class="btn-primary">Approve</button>\n```',
    );
  });

  it("nests replies under their root", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({
          id: "root",
          createdAt: "2026-01-01T00:00:00.000Z",
          body: "too tight",
        }),
        comment({
          id: "reply",
          createdAt: "2026-01-01T01:00:00.000Z",
          parentId: "root",
          body: "agreed",
          author: { name: "Agent", kind: "agent" },
        }),
      ]),
      MARKDOWN_OPTIONS,
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
      MARKDOWN_OPTIONS,
    );

    expect(markdown.indexOf("replied: first")).toBeLessThan(
      markdown.indexOf("replied: second"),
    );
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
      MARKDOWN_OPTIONS,
    );

    expect(markdown.indexOf('### 1. h1 "Pricing"')).toBeLessThan(
      markdown.indexOf('### 2. button.btn.primary "Approve"'),
    );
  });

  it("labels page-level comments and omits the anchor line", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({
          id: "c1",
          createdAt: "2026-01-01T00:00:00.000Z",
          anchor: DOCUMENT_ANCHOR,
        }),
      ]),
      MARKDOWN_OPTIONS,
    );

    expect(markdown).toContain("### 1. Page-level");
    expect(markdown).not.toContain("- anchor:");
  });

  it("falls back to the raw anchor when no label has been resolved", () => {
    const markdown = commentsToMarkdown(
      page("welcome", [
        comment({ id: "c1", createdAt: "2026-01-01T00:00:00.000Z" }),
      ]),
      RAW_ANCHOR_OPTIONS,
    );

    expect(markdown).toContain(`### 1. ${BUTTON_ANCHOR}`);
  });

  it("emits one heading per page and restarts numbering", () => {
    const markdown = commentsToMarkdown(
      [
        {
          page: "welcome",
          comments: [
            comment({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
          ],
        },
        {
          page: "reconcile",
          comments: [
            comment({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
          ],
        },
      ],
      MARKDOWN_OPTIONS,
    );

    expect(markdown).toContain("## Playground feedback — welcome");
    expect(markdown).toContain("## Playground feedback — reconcile");
    expect(markdown.match(/### 1\./g)).toHaveLength(2);
    expect(markdown.indexOf("— welcome")).toBeLessThan(
      markdown.indexOf("— reconcile"),
    );
  });

  it("keeps labels only for the page whose DOM is live, showing raw anchors elsewhere", () => {
    const markdown = commentsToMarkdown(
      [
        {
          page: "welcome",
          comments: [
            comment({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
          ],
        },
        {
          page: "reconcile",
          comments: [
            comment({
              id: "b",
              createdAt: "2026-01-02T00:00:00.000Z",
              anchor: HEADING_ANCHOR,
            }),
          ],
        },
      ],
      {
        ...MARKDOWN_OPTIONS,
        labels: { [BUTTON_ANCHOR]: 'button.btn.primary "Approve"' },
      },
    );

    expect(markdown).toContain('### 1. button.btn.primary "Approve"');
    expect(markdown).toContain(`### 1. ${HEADING_ANCHOR}`);
  });
});

describe("groupByPage", () => {
  function pageComment(
    id: string,
    slug: string,
    createdAt: string,
  ): PageComment {
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

    expect(grouped.map((section) => section.page)).toEqual([
      "welcome",
      "reconcile",
    ]);
    expect(grouped[0]?.comments.map((entry) => entry.id)).toEqual(["a", "c"]);
  });

  it("drops the page key from the comments it groups", () => {
    const grouped = groupByPage([
      pageComment("a", "welcome", "2026-01-01T00:00:00.000Z"),
    ]);

    expect(grouped[0]?.comments[0]).not.toHaveProperty("page");
  });

  it("selects a folder's root page and every descendant page", () => {
    const comments = [
      pageComment("a", "flanksource", "2026-01-01T00:00:00.000Z"),
      pageComment(
        "b",
        "flanksource/foundations/colors",
        "2026-01-02T00:00:00.000Z",
      ),
      pageComment(
        "c",
        "flanksource/patterns/forms",
        "2026-01-03T00:00:00.000Z",
      ),
      pageComment("d", "makerprint/scad-studio", "2026-01-04T00:00:00.000Z"),
    ];

    expect(
      commentsForFolder(comments, "flanksource").map(({ page }) => page),
    ).toEqual([
      "flanksource",
      "flanksource/foundations/colors",
      "flanksource/patterns/forms",
    ]);
  });
});
