import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { addComment, readAll } from "./comments-store";
import { deleteFolder, deletePage, movePage } from "./page-management-store";
import { createSource, readSource, sourceExists } from "./pages-store";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratchRoot = join(appRoot, ".tmp");
const SOURCE = `export const meta = { title: "Old page", description: "Keep" };

export default function OldPage() {
  return <h1>Body stays old</h1>;
}
`;

describe("page management", () => {
  let pagesDir: string;
  let commentsDir: string;

  beforeEach(() => {
    mkdirSync(scratchRoot, { recursive: true });
    pagesDir = mkdtempSync(join(scratchRoot, "managed-pages-"));
    commentsDir = mkdtempSync(join(scratchRoot, "managed-comments-"));
  });

  afterEach(() => {
    rmSync(pagesDir, { recursive: true, force: true });
    rmSync(commentsDir, { recursive: true, force: true });
  });

  it("renames the path and title while moving every comment to the new slug", () => {
    createSource(pagesDir, "old-page", SOURCE);
    addComment(commentsDir, "old-page", {
      id: "comment-1",
      body: "Keep this feedback",
      createdAt: "2026-08-22T00:00:00.000Z",
      author: { name: "Reviewer", kind: "user" },
      status: "open",
      parentId: null,
      anchor: ":scope",
      element: {
        componentName: "OldPage",
        source: "OldPage at /workspace/src/old-page.tsx:3:1",
        html: "<h1>Body stays old</h1>",
      },
    });

    expect(
      movePage({
        sourceRoot: pagesDir,
        pagesDir,
        commentsDir,
        slug: "old-page",
        nextSlug: "designs/renamed-page",
        title: "Renamed page",
      }),
    ).toEqual({
      slug: "designs/renamed-page",
      movedComments: 1,
      updatedReferences: 0,
      updatedFiles: 1,
    });
    expect(existsSync(join(pagesDir, "old-page.tsx"))).toBe(false);
    expect(readSource(pagesDir, "designs/renamed-page")).toContain(
      'title: "Renamed page"',
    );
    expect(readSource(pagesDir, "designs/renamed-page")).toContain(
      "<h1>Body stays old</h1>",
    );
    expect(readAll(commentsDir)).toEqual({
      "designs/renamed-page": [
        expect.objectContaining({
          id: "comment-1",
          element: {
            componentName: "OldPage",
            source: "OldPage at /workspace/src/old-page.tsx:3:1",
            html: "<h1>Body stays old</h1>",
          },
        }),
      ],
    });
  });

  it("moves a page without rewriting its source when title is omitted", () => {
    createSource(pagesDir, "drafts/old-page", SOURCE);

    movePage({
      sourceRoot: pagesDir,
      pagesDir,
      commentsDir,
      slug: "drafts/old-page",
      nextSlug: "approved/old-page",
    });

    expect(readSource(pagesDir, "approved/old-page")).toBe(SOURCE);
  });

  it("rejects derived metadata before moving the page or its comments", () => {
    const derived = 'export const meta = pageMetadata("old-page");\n';
    createSource(pagesDir, "old-page", derived);
    addComment(commentsDir, "old-page", {
      id: "comment-1",
      body: "Keep this feedback",
      createdAt: "2026-08-22T00:00:00.000Z",
      author: { name: "Reviewer", kind: "user" },
    });

    expect(() =>
      movePage({
        sourceRoot: pagesDir,
        pagesDir,
        commentsDir,
        slug: "old-page",
        nextSlug: "renamed-page",
        title: "Renamed page",
      }),
    ).toThrow(/simple string-literal meta\.title/);
    expect(readSource(pagesDir, "old-page")).toBe(derived);
    expect(existsSync(join(pagesDir, "renamed-page.tsx"))).toBe(false);
    expect(readAll(commentsDir)).toHaveProperty("old-page");
  });

  it("refuses a destination conflict without changing either page", () => {
    createSource(pagesDir, "old-page", SOURCE);
    createSource(pagesDir, "taken", "taken");

    expect(() =>
      movePage({
        sourceRoot: pagesDir,
        pagesDir,
        commentsDir,
        slug: "old-page",
        nextSlug: "taken",
      }),
    ).toThrow(/already exists/);
    expect(readSource(pagesDir, "old-page")).toBe(SOURCE);
    expect(readSource(pagesDir, "taken")).toBe("taken");
  });

  it("rebases the moved page and updates incoming imports and page links", () => {
    const source = [
      'import { DesignSystemPage } from "../design-system/DesignSystemPage";',
      'import { fixture } from "./_access-review-decisions/fixture";',
      "export default function AccessReview() { return null; }",
    ].join("\n");
    createSource(pagesDir, "access-review-decisions", source);
    const consumer = join(pagesDir, "review.tsx");
    writeFileSync(
      consumer,
      [
        'import AccessReview from "./access-review-decisions";',
        'export const href = "?page=access-review-decisions";',
      ].join("\n"),
    );

    expect(
      movePage({
        sourceRoot: pagesDir,
        pagesDir,
        commentsDir,
        slug: "access-review-decisions",
        nextSlug: "trust/access-review-decisions",
      }),
    ).toEqual({
      slug: "trust/access-review-decisions",
      movedComments: 0,
      updatedReferences: 4,
      updatedFiles: 2,
    });
    expect(readSource(pagesDir, "trust/access-review-decisions")).toBe(
      [
        'import { DesignSystemPage } from "../../design-system/DesignSystemPage";',
        'import { fixture } from "../_access-review-decisions/fixture";',
        "export default function AccessReview() { return null; }",
      ].join("\n"),
    );
    expect(readFileSync(consumer, "utf8")).toBe(
      [
        'import AccessReview from "./trust/access-review-decisions";',
        'export const href = "?page=trust/access-review-decisions";',
      ].join("\n"),
    );
  });

  it("rolls back the page and rewritten references when a write fails", () => {
    createSource(pagesDir, "review", SOURCE);
    const consumer = join(pagesDir, "consumer.ts");
    const consumerSource = [
      'import Review from "./review";',
      'export const href = "?page=review";',
    ].join("\n");
    writeFileSync(consumer, consumerSource);

    expect(() =>
      movePage({
        sourceRoot: pagesDir,
        pagesDir,
        commentsDir,
        slug: "review",
        nextSlug: "approved/review",
        writeReference: (file, source) => {
          if (source.includes("approved/review")) throw new Error("simulated write failure");
          writeFileSync(file, source);
        },
      }),
    ).toThrow(/page move failed and was rolled back/);
    expect(sourceExists(pagesDir, "review")).toBe(true);
    expect(sourceExists(pagesDir, "approved/review")).toBe(false);
    expect(readSource(pagesDir, "review")).toBe(SOURCE);
    expect(readFileSync(consumer, "utf8")).toBe(consumerSource);
  });

  it("deletes a folder with its pages, nested folders and feedback", () => {
    createSource(pagesDir, "trust/signoff", SOURCE);
    createSource(pagesDir, "trust/nested/review", SOURCE);
    createSource(pagesDir, "designs/keep", SOURCE);
    // Helpers and colocated tests are not artifacts: they go with the folder,
    // but they never had a slug, so they are not reported as deleted pages.
    writeFileSync(join(pagesDir, "trust", "_helper.tsx"), SOURCE);
    writeFileSync(join(pagesDir, "trust", "signoff.test.tsx"), SOURCE);
    for (const [slug, id] of [
      ["trust/signoff", "comment-1"],
      ["trust/nested/review", "comment-2"],
      ["designs/keep", "comment-3"],
    ] as const) {
      addComment(commentsDir, slug, {
        id,
        body: "Feedback",
        createdAt: "2026-08-22T00:00:00.000Z",
        author: { name: "Reviewer", kind: "user" },
      });
    }

    expect(deleteFolder({ pagesDir, commentsDir, folder: "trust" })).toEqual({
      folder: "trust",
      deletedPages: ["trust/nested/review", "trust/signoff"],
      deletedComments: 2,
    });
    expect(existsSync(join(pagesDir, "trust"))).toBe(false);
    expect(sourceExists(pagesDir, "designs/keep")).toBe(true);
    expect(Object.keys(readAll(commentsDir))).toEqual(["designs/keep"]);
    // The holding area used during the delete must not survive beside pages.
    expect(readdirSync(pagesDir)).toEqual(["designs"]);
  });

  it("refuses to delete a folder that does not exist", () => {
    expect(() =>
      deleteFolder({ pagesDir, commentsDir, folder: "missing" }),
    ).toThrow(/folder "missing" does not exist/);
  });

  it("puts the folder back when the comment rewrite fails", () => {
    createSource(pagesDir, "trust/signoff", SOURCE);
    addComment(commentsDir, "trust/signoff", {
      id: "comment-1",
      body: "Feedback",
      createdAt: "2026-08-22T00:00:00.000Z",
      author: { name: "Reviewer", kind: "user" },
    });

    expect(() =>
      deleteFolder({
        pagesDir,
        commentsDir,
        folder: "trust",
        writeComments: () => {
          throw new Error("simulated write failure");
        },
      }),
    ).toThrow(/folder deletion failed and was rolled back/);
    expect(sourceExists(pagesDir, "trust/signoff")).toBe(true);
    expect(readSource(pagesDir, "trust/signoff")).toBe(SOURCE);
    expect(readAll(commentsDir)["trust/signoff"]).toHaveLength(1);
  });

  it("deletes the page and all feedback without leaving a backup", () => {
    createSource(pagesDir, "old-page", SOURCE);
    addComment(commentsDir, "old-page", {
      id: "comment-1",
      body: "Delete with the page",
      createdAt: "2026-08-22T00:00:00.000Z",
      author: { name: "Reviewer", kind: "user" },
    });

    expect(deletePage({ pagesDir, commentsDir, slug: "old-page" })).toEqual({
      slug: "old-page",
      deletedComments: 1,
    });
    expect(existsSync(join(pagesDir, "old-page.tsx"))).toBe(false);
    expect(readAll(commentsDir)).toEqual({});
    expect(readdirSync(pagesDir)).toEqual([]);
  });
});
