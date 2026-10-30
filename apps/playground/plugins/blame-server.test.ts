import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { assertRepoPath, blameFile, parseBlamePorcelain } from "./blame-server";

const ADD = "3f9c2a1b7d4e5f60718293a4b5c6d7e8f9012345";
const FIX = "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b";

// Shape of `git blame --porcelain`: commit fields only on a sha's first group.
const PORCELAIN = [
  `${ADD} 1 1 2`,
  "author Dana Reyes",
  "author-mail <dana@example.com>",
  "author-time 1710411120",
  "author-tz +0000",
  "summary Add retry helper",
  "filename retry.go",
  "\tpackage retry",
  `${ADD} 2 2`,
  "\t",
  `${FIX} 3 3 1`,
  "author Sam Okafor",
  "author-time 1762101600",
  "summary Stop retrying when the context is cancelled",
  "filename retry.go",
  "\tfunc Do() {}",
  `${ADD} 3 4 1`,
  "filename retry.go",
  "\t// end",
  "",
].join("\n");

describe("parseBlamePorcelain", () => {
  it("rebuilds the source and one range per run of lines, reusing a commit's fields on its later groups", () => {
    const dana = { sha: ADD, author: "Dana Reyes", date: "2024-03-14T10:12:00.000Z", summary: "Add retry helper" };
    expect(parseBlamePorcelain(PORCELAIN)).toEqual({
      source: "package retry\n\nfunc Do() {}\n// end",
      ranges: [
        { startLine: 1, lineCount: 2, commit: dana },
        { startLine: 3, lineCount: 1, commit: { sha: FIX, author: "Sam Okafor", date: "2025-11-02T16:40:00.000Z", summary: "Stop retrying when the context is cancelled" } },
        { startLine: 4, lineCount: 1, commit: dana },
      ],
    });
  });
});

describe("assertRepoPath", () => {
  it.each([[null], ["/etc/passwd"], ["../secrets.txt"], ["docs/../../x"]])("rejects %s", (path) => {
    expect(() => assertRepoPath(path)).toThrow();
  });

  it("accepts a path inside the checkout", () => {
    expect(assertRepoPath("apps/playground/README.md")).toBe("apps/playground/README.md");
  });
});

describe("blameFile", () => {
  it("blames a tracked file: its source matches the file and the ranges cover every line in order", async () => {
    const root = resolve(import.meta.dirname, "../../..");
    const path = "packages/ui/src/data/git/git-dates.ts";
    const blame = await blameFile(root, path);
    const lines = blame.source.split("\n").length;
    const covered = blame.ranges.reduce((next, range) => (range.startLine === next ? next + range.lineCount : -1), 1);
    expect({ source: `${blame.source}\n`, covered }).toEqual({ source: readFileSync(resolve(root, path), "utf8"), covered: lines + 1 });
  });
});
