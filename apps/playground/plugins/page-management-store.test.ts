import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { addComment, readAll } from "./comments-store";
import { deletePage, movePage } from "./page-management-store";
import { createSource, readSource } from "./pages-store";

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
    });

    expect(
      movePage({
        pagesDir,
        commentsDir,
        slug: "old-page",
        nextSlug: "designs/renamed-page",
        title: "Renamed page",
      }),
    ).toEqual({ slug: "designs/renamed-page", movedComments: 1 });
    expect(existsSync(join(pagesDir, "old-page.tsx"))).toBe(false);
    expect(readSource(pagesDir, "designs/renamed-page")).toContain(
      'title: "Renamed page"',
    );
    expect(readSource(pagesDir, "designs/renamed-page")).toContain(
      "<h1>Body stays old</h1>",
    );
    expect(readAll(commentsDir)).toEqual({
      "designs/renamed-page": [expect.objectContaining({ id: "comment-1" })],
    });
  });

  it("moves a page without rewriting its source when title is omitted", () => {
    createSource(pagesDir, "drafts/old-page", SOURCE);

    movePage({
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
        pagesDir,
        commentsDir,
        slug: "old-page",
        nextSlug: "taken",
      }),
    ).toThrow(/already exists/);
    expect(readSource(pagesDir, "old-page")).toBe(SOURCE);
    expect(readSource(pagesDir, "taken")).toBe("taken");
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
