// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSource, listFolderPages, pagePath, readSource, writeSource } from "./pages-store";

describe("pages store", () => {
  let pagesDir: string;

  beforeEach(() => {
    pagesDir = mkdtempSync(join(tmpdir(), "playground-pages-"));
    mkdirSync(join(pagesDir, "docs"));
  });

  afterEach(() => {
    rmSync(pagesDir, { recursive: true, force: true });
  });

  const write = (file: string, text = "") => writeFileSync(join(pagesDir, file), text);

  it.each([
    ["docs/guide.tsx", "docs/guide.tsx"],
    ["docs/guide.md", "docs/guide.md"],
    ["docs/guide.mdx", "docs/guide.mdx"],
  ])("resolves a slug to its existing %s", (file, expected) => {
    write(file);

    expect(pagePath(pagesDir, "docs/guide")).toBe(join(pagesDir, expected));
  });

  it("names a page that does not exist yet with the requested extension, .tsx by default", () => {
    expect(pagePath(pagesDir, "docs/new")).toBe(join(pagesDir, "docs/new.tsx"));
    expect(pagePath(pagesDir, "docs/new", ".md")).toBe(join(pagesDir, "docs/new.md"));
  });

  it("keeps an existing page's file whatever extension is requested", () => {
    write("docs/guide.md");

    expect(pagePath(pagesDir, "docs/guide", ".tsx")).toBe(join(pagesDir, "docs/guide.md"));
  });

  it("refuses a slug with two page files as ambiguous", () => {
    write("docs/guide.tsx");
    write("docs/guide.md");

    expect(() => pagePath(pagesDir, "docs/guide")).toThrow(
      expect.objectContaining({ statusCode: 409, message: expect.stringContaining("docs/guide.tsx and docs/guide.md") }),
    );
  });

  it.each(["../outside", "docs/../../outside", "/etc/passwd", "Docs/Guide"])("refuses the slug %s", (slug) => {
    expect(() => pagePath(pagesDir, slug)).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  it("creates a markdown page and reads and writes it back through its slug", () => {
    createSource(pagesDir, "docs/notes", "# Notes\n", ".md");
    writeSource(pagesDir, "docs/notes", "# Notes, edited\n");

    expect(readFileSync(join(pagesDir, "docs/notes.md"), "utf8")).toBe("# Notes, edited\n");
    expect(readSource(pagesDir, "docs/notes")).toBe("# Notes, edited\n");
  });

  it("refuses to create a page whose slug another file type already holds", () => {
    write("docs/guide.tsx");

    expect(() => createSource(pagesDir, "docs/guide", "# Guide\n", ".md")).toThrow(
      expect.objectContaining({ statusCode: 409 }),
    );
  });

  it("lists markdown pages in a folder beside components, skipping helpers and tests", () => {
    write("docs/guide.md");
    write("docs/intro.mdx");
    write("docs/widget.tsx");
    write("docs/widget.test.tsx");
    write("docs/_partial.md");
    write("docs/notes.txt");

    expect(listFolderPages(pagesDir, "docs")).toEqual(["docs/guide", "docs/intro", "docs/widget"]);
  });
});
