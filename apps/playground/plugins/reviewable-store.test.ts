import { configureTestComments } from "./testing/comments-store";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as commentStore from "./comments-store";

import {
  readAll,
  writeAll,
  type StoredComment,
} from "./testing/comments-store";
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
  it("persists rejection and approval with source conflict checks and rollback", async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const root = mkdtempSync(join(process.cwd(), ".tmp", "decision-"));
    roots.push(root);
    const pagesDir = join(root, "pages");
    const commentsDir = join(root, "comments");
    configureTestComments(commentsDir);
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
    const savedRejection = await persistReviewDecision(request, rejection);
    const rejected = readSource(pagesDir, "review");
    expect(rejected).toContain('className="existing rejected"');
    expect((await readAll(commentsDir)).review).toMatchObject([
      { id: savedRejection.id, reviewDecision: "rejected" },
    ]);
    await expect(
      persistReviewDecision(request, { ...rejection, id: "stale" }),
    ).rejects.toThrow(/changed since selection/);
    const approval: StoredComment = {
      ...rejection,
      id: "approve",
      reviewDecision: "approved",
      body: "",
    };
    vi.spyOn(commentStore, "writeAll").mockImplementationOnce(() => {
      throw new Error("disk unavailable");
    });
    await expect(
      persistReviewDecision(
                { ...request, expectedSource: rejected },
                approval,
              ),
    ).rejects.toThrow("disk unavailable");
    expect(readSource(pagesDir, "review")).toBe(rejected);
    expect((await readAll(commentsDir)).review).toHaveLength(1);
    const savedApproval = await persistReviewDecision(
      { ...request, expectedSource: rejected },
      { ...approval, id: "approve-retry" },
    );
    expect(readSource(pagesDir, "review")).toContain('className="existing"');
    expect((await readAll(commentsDir)).review).toMatchObject([
      { id: savedRejection.id, status: "closed" },
      { id: savedApproval.id, status: "closed" },
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
    configureTestComments(commentsDir);
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

  it("removes the selected literal row and its review thread while preserving other variants", async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    const root = mkdtempSync(join(process.cwd(), ".tmp", "reviewable-"));
    roots.push(root);
    const pagesDir = join(root, "pages");
    const commentsDir = join(root, "comments");
    configureTestComments(commentsDir);
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
    await writeAll(commentsDir, {
      review: [
        comment("first", '[data-review-id="review-first"]'),
        comment("reply", '[data-review-id="review-first"]', "first"),
        comment("second", '[data-review-id="review-second"]'),
      ],
    });

    const result = await deleteReviewable({
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
    expect(
      (await readAll(commentsDir)).review?.map((entry) => entry.id),
    ).toEqual(["second"]);
  });
});
