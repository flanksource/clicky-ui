import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { readAll, writeAll, type StoredComment } from "./comments-store";
import { createSource, readSource } from "./pages-store";
import { deleteReviewable, markReviewable } from "./reviewable-store";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("delete reviewable", () => {
  it("marks the selected source element and rejects a stale source revision", () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const root = mkdtempSync(join(process.cwd(), ".tmp", "reviewable-"));
    roots.push(root);
    const pagesDir = join(root, "pages");
    const commentsDir = join(root, "comments");
    mkdirSync(pagesDir);
    mkdirSync(commentsDir);
    const source =
      'export default function Page() { return <main><section id="target">Review me</section></main>; }';
    createSource(pagesDir, "review", source);

    const marked = markReviewable({
      pagesDir,
      commentsDir,
      slug: "review",
      expectedSource: source,
      domId: "target",
    });

    expect(readSource(pagesDir, "review")).toContain(
      `data-review-id="${marked.reviewId}"`,
    );
    expect(() =>
      markReviewable({
        pagesDir,
        commentsDir,
        slug: "review",
        expectedSource: source,
        domId: "target",
      }),
    ).toThrow(/changed since selection/);
  });

  it("removes the selected literal row and its review thread while preserving other variants", () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const root = mkdtempSync(join(process.cwd(), ".tmp", "reviewable-"));
    roots.push(root);
    const pagesDir = join(root, "pages");
    const commentsDir = join(root, "comments");
    mkdirSync(pagesDir);
    mkdirSync(commentsDir);
    const source = `const variants = [{ id: "first", reviewId: "review-first" }, { id: "second", reviewId: "review-second" }];
export default function Page() { return <main>{variants.map((variant) => <section key={variant.id} id={variant.id} data-review-id={variant.reviewId}>{variant.id}</section>)}</main>; }`;
    createSource(pagesDir, "review", source);
    const comment = (
      id: string,
      anchor: string,
      parentId: string | null = null,
    ): StoredComment => ({
      id,
      anchor,
      parentId,
      body: "Feedback",
      createdAt: "2026-01-01T00:00:00.000Z",
      author: { name: "Reviewer", kind: "user" },
      status: "open",
      ...(!parentId
        ? { element: { source: "review.tsx", html: "<section />" } }
        : {}),
    });
    writeAll(commentsDir, {
      review: [
        comment("first", '[data-review-id="review-first"]'),
        comment("reply", '[data-review-id="review-first"]', "first"),
        comment("second", '[data-review-id="review-second"]'),
      ],
    });

    const result = deleteReviewable({
      pagesDir,
      commentsDir,
      slug: "review",
      expectedSource: source,
      reviewId: "review-first",
      associatedCommentIds: [],
    });

    expect(result.removedComments).toBe(2);
    expect(readSource(pagesDir, "review")).not.toContain('id: "first"');
    expect(readSource(pagesDir, "review")).toContain('id: "second"');
    expect(readAll(commentsDir).review?.map((entry) => entry.id)).toEqual([
      "second",
    ]);
  });
});
