// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createSource,
  listFolderPages,
  pagePath,
  pagesFilePath,
  readPagesFile,
  readSource,
  writePagesFile,
  writeSource,
} from "./pages-store";
import { sourceHash } from "./source-hash";

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

  describe("pages files", () => {
    const helper = "docs/_helper/diagram.tsx";

    beforeEach(() => {
      mkdirSync(join(pagesDir, "docs/_helper"));
      write(helper, "export const a = 1;\n");
    });

    it("reads a _ helper with its content hash", () => {
      const read = readPagesFile(pagesDir, helper);

      expect(read).toEqual({ file: helper, source: "export const a = 1;\n", hash: sourceHash("export const a = 1;\n") });
    });

    it("writes a _ helper when the hash it was opened at is current, and returns the new hash", () => {
      const { hash } = readPagesFile(pagesDir, helper);

      const written = writePagesFile(pagesDir, helper, "export const a = 2;\n", hash);

      expect(written).toEqual({ file: helper, hash: sourceHash("export const a = 2;\n") });
      expect(readFileSync(join(pagesDir, helper), "utf8")).toBe("export const a = 2;\n");
    });

    it("refuses a write with 409 when the file changed since it was opened", () => {
      const { hash } = readPagesFile(pagesDir, helper);
      write(helper, "export const a = 3;\n");

      expect(() => writePagesFile(pagesDir, helper, "export const a = 2;\n", hash)).toThrow(
        expect.objectContaining({ statusCode: 409, message: expect.stringContaining("changed since it was opened") }),
      );
      expect(readFileSync(join(pagesDir, helper), "utf8")).toBe("export const a = 3;\n");
    });

    it.each([
      ["a parent segment", "docs/../docs/_helper/diagram.tsx", 400],
      ["an absolute path", "/etc/hosts.ts", 400],
      ["a backslash", "docs\\_helper\\diagram.tsx", 400],
      ["an empty segment", "docs//_helper/diagram.tsx", 400],
      ["another extension", "docs/guide.md", 400],
      ["a missing file", "docs/_helper/missing.tsx", 404],
    ])("refuses %s", (_name, rel, statusCode) => {
      write("docs/guide.md", "# guide");

      expect(() => pagesFilePath(pagesDir, rel)).toThrow(expect.objectContaining({ statusCode }));
    });

    it("refuses a symlinked file and a file under a symlinked directory", () => {
      const outside = mkdtempSync(join(tmpdir(), "playground-outside-"));
      writeFileSync(join(outside, "leak.tsx"), "export const leak = 1;\n");
      symlinkSync(join(outside, "leak.tsx"), join(pagesDir, "docs/_helper/link.tsx"));
      symlinkSync(outside, join(pagesDir, "docs/linked"));

      try {
        expect(() => pagesFilePath(pagesDir, "docs/_helper/link.tsx")).toThrow(
          expect.objectContaining({ statusCode: 400, message: expect.stringContaining("symbolic link") }),
        );
        expect(() => pagesFilePath(pagesDir, "docs/linked/leak.tsx")).toThrow(
          expect.objectContaining({ statusCode: 400, message: expect.stringContaining("symbolic link") }),
        );
      } finally {
        rmSync(outside, { recursive: true, force: true });
      }
    });
  });
});
