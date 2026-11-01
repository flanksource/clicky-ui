import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as commentStore from "./comments-store";

import { readAll, writeAll, type StoredComment } from "./comments-store";
import { createSource, readSource } from "./pages-store";
import {
  deleteReviewable,
  markReviewable,
  persistReviewDecision,
} from "./reviewable-store";

const roots: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("source-backed review decisions", () => {
  it("persists rejection and approval with source conflict checks and rollback", () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const root = mkdtempSync(join(process.cwd(), ".tmp", "decision-"));
    roots.push(root);
    const pagesDir = join(root, "pages");
    const commentsDir = join(root, "comments");
    mkdirSync(pagesDir);
    mkdirSync(commentsDir);
    const source =
      'export default () => <section data-review-id="design" className="existing">Design</section>;';
    createSource(pagesDir, "review", source, ".tsx");
    const request = {
      pagesDir,
      commentsDir,
      slug: "review",
      expectedSource: source,
    };
    const rejection: StoredComment = {
      id: "reject",
      anchor: '[data-review-id="design"]',
      parentId: null,
      element: { source: "review.tsx", html: "<section>Design</section>" },
      body: "Needs work",
      author: { name: "Reviewer", kind: "user" },
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "open",
      reviewDecision: "rejected",
    };
    persistReviewDecision(request, rejection);
    const rejected = readSource(pagesDir, "review");
    expect(rejected).toContain('className="existing rejected"');
    expect(readAll(commentsDir).review).toMatchObject([
      { id: "reject", reviewDecision: "rejected" },
    ]);
    expect(() =>
      persistReviewDecision(request, { ...rejection, id: "stale" }),
    ).toThrow(/changed since selection/);
    const approval: StoredComment = {
      ...rejection,
      id: "approve",
      reviewDecision: "approved",
      body: "",
    };
    vi.spyOn(commentStore, "writeAll").mockImplementationOnce(() => {
      throw new Error("disk unavailable");
    });
    expect(() =>
      persistReviewDecision({ ...request, expectedSource: rejected }, approval),
    ).toThrow("disk unavailable");
    expect(readSource(pagesDir, "review")).toBe(rejected);
    expect(readAll(commentsDir).review).toHaveLength(1);
    persistReviewDecision({ ...request, expectedSource: rejected }, approval);
    expect(readSource(pagesDir, "review")).toContain('className="existing"');
    expect(readAll(commentsDir).review).toMatchObject([
      { id: "reject", status: "closed" },
      { id: "approve", status: "closed" },
    ]);
  });
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
    createSource(pagesDir, "review", source, ".tsx");

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
    createSource(pagesDir, "review", source, ".tsx");
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
