import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  assertSlug,
  createSource,
  pagePath,
  readSource,
  sourceExists,
  writeSource,
} from "./pages-store";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratchRoot = join(appRoot, ".tmp");

const SOURCE = 'export default function A() {\n  return <h1>a</h1>;\n}\n';

describe("assertSlug", () => {
  it.each(["welcome", "agent-inbox", "a1", "dashboards/agent-inbox", "a/b/c"])(
    "accepts %s",
    (slug) => {
      expect(assertSlug(slug)).toBe(slug);
    },
  );

  it.each([
    ["", "empty"],
    ["../secret", "traversal"],
    ["/etc/passwd", "absolute"],
    ["a/../../b", "nested traversal"],
    ["Welcome", "uppercase"],
    ["_draft", "underscore prefix — the registry would hide it"],
    ["-leading", "leading hyphen"],
    ["with space", "space"],
    ["file.tsx", "extension"],
    ["a//b", "empty segment"],
    ["a/", "trailing slash"],
  ])("rejects %s (%s)", (slug) => {
    expect(() => assertSlug(slug)).toThrow();
  });

  it("rejects a non-string", () => {
    expect(() => assertSlug(42)).toThrow(/page slug is required/);
  });
});

describe("pagePath", () => {
  it("maps a slug to a .tsx file inside the pages directory", () => {
    expect(pagePath("/repo/src/pages", "dashboards/metrics")).toBe(
      "/repo/src/pages/dashboards/metrics.tsx",
    );
  });

  it("refuses a traversal attempt before touching the filesystem", () => {
    expect(() => pagePath("/repo/src/pages", "../../etc/passwd")).toThrow(/invalid page slug/);
  });
});

describe("page sources on disk", () => {
  let pagesDir: string;

  beforeEach(() => {
    mkdirSync(scratchRoot, { recursive: true });
    pagesDir = mkdtempSync(join(scratchRoot, "pages-"));
  });

  afterEach(() => {
    rmSync(pagesDir, { recursive: true, force: true });
  });

  it("round-trips a source", () => {
    writeSource(pagesDir, "welcome", SOURCE);

    expect(readSource(pagesDir, "welcome")).toBe(SOURCE);
    expect(readFileSync(join(pagesDir, "welcome.tsx"), "utf8")).toBe(SOURCE);
  });

  it("creates parent directories for a nested slug", () => {
    writeSource(pagesDir, "dashboards/metrics", SOURCE);

    expect(existsSync(join(pagesDir, "dashboards", "metrics.tsx"))).toBe(true);
  });

  it("leaves no temp file behind after an atomic write", () => {
    writeSource(pagesDir, "welcome", SOURCE);

    expect(existsSync(join(pagesDir, "welcome.tsx.tmp"))).toBe(false);
  });

  it("overwrites on write but refuses to clobber on create", () => {
    createSource(pagesDir, "welcome", SOURCE);
    writeSource(pagesDir, "welcome", "updated");

    expect(readSource(pagesDir, "welcome")).toBe("updated");
    expect(() => createSource(pagesDir, "welcome", SOURCE)).toThrow(/already exists/);
  });

  it("throws when reading a page that does not exist", () => {
    expect(() => readSource(pagesDir, "missing")).toThrow(/page "missing" does not exist/);
  });

  it("reports existence without throwing", () => {
    expect(sourceExists(pagesDir, "welcome")).toBe(false);
    writeSource(pagesDir, "welcome", SOURCE);
    expect(sourceExists(pagesDir, "welcome")).toBe(true);
  });

  it("rejects a non-string source rather than writing garbage", () => {
    expect(() => writeSource(pagesDir, "welcome", undefined as unknown as string)).toThrow(
      /source must be a string/,
    );
    expect(existsSync(join(pagesDir, "welcome.tsx"))).toBe(false);
  });

  it("cannot escape the pages directory even when a sibling file exists", () => {
    const outside = join(pagesDir, "..", "outside.tsx");
    writeFileSync(outside, "untouched", "utf8");

    expect(() => writeSource(pagesDir, "../outside", SOURCE)).toThrow(/invalid page slug/);
    expect(readFileSync(outside, "utf8")).toBe("untouched");
    rmSync(outside, { force: true });
  });
});
