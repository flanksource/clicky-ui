import { describe, expect, it } from "vitest";
import { computeLineDiff, parseUnifiedDiff, type DiffLine } from "./code-diff";

// Assert the whole row array of the single computed hunk in one comparison.
function linesOf(original: string, modified: string): DiffLine[] {
  const hunks = computeLineDiff(original, modified);
  return hunks.flatMap((h) => h.lines);
}

describe("computeLineDiff", () => {
  it("marks identical input as all context with matching numbers", () => {
    expect(linesOf("a\nb", "a\nb")).toEqual([
      { type: "context", content: "a", oldNumber: 1, newNumber: 1 },
      { type: "context", content: "b", oldNumber: 2, newNumber: 2 },
    ]);
  });

  it("emits pure adds for an empty original", () => {
    expect(linesOf("", "x\ny")).toEqual([
      { type: "add", content: "x", newNumber: 1 },
      { type: "add", content: "y", newNumber: 2 },
    ]);
  });

  it("emits pure removes for an empty modified", () => {
    expect(linesOf("x\ny", "")).toEqual([
      { type: "remove", content: "x", oldNumber: 1 },
      { type: "remove", content: "y", oldNumber: 2 },
    ]);
  });

  it("represents a replacement as remove then add between context", () => {
    expect(linesOf("a\nb\nc", "a\nX\nc")).toEqual([
      { type: "context", content: "a", oldNumber: 1, newNumber: 1 },
      { type: "remove", content: "b", oldNumber: 2 },
      { type: "add", content: "X", newNumber: 2 },
      { type: "context", content: "c", oldNumber: 3, newNumber: 3 },
    ]);
  });

  it("tracks independent old/new numbering through interleaved edits", () => {
    expect(linesOf("1\n2\n3\n4", "1\n3\n4\n5")).toEqual([
      { type: "context", content: "1", oldNumber: 1, newNumber: 1 },
      { type: "remove", content: "2", oldNumber: 2 },
      { type: "context", content: "3", oldNumber: 3, newNumber: 2 },
      { type: "context", content: "4", oldNumber: 4, newNumber: 3 },
      { type: "add", content: "5", newNumber: 4 },
    ]);
  });

  it("returns no hunks when both sides are empty", () => {
    expect(computeLineDiff("", "")).toEqual([]);
  });

  it("normalizes a single trailing newline so it is not a spurious change", () => {
    expect(linesOf("a\nb\n", "a\nb")).toEqual([
      { type: "context", content: "a", oldNumber: 1, newNumber: 1 },
      { type: "context", content: "b", oldNumber: 2, newNumber: 2 },
    ]);
  });
});

describe("parseUnifiedDiff", () => {
  it("parses a single hunk with old/new line numbers from the header", () => {
    const diff = "@@ -1,3 +1,3 @@\n a\n-b\n+B\n c\n";
    expect(parseUnifiedDiff(diff)).toEqual([
      {
        header: "@@ -1,3 +1,3 @@",
        lines: [
          { type: "context", content: "a", oldNumber: 1, newNumber: 1 },
          { type: "remove", content: "b", oldNumber: 2 },
          { type: "add", content: "B", newNumber: 2 },
          { type: "context", content: "c", oldNumber: 3, newNumber: 3 },
        ],
      },
    ]);
  });

  it("continues numbering per hunk from each header", () => {
    const diff = "@@ -1,2 +1,2 @@\n a\n-b\n+B\n@@ -10,2 +10,2 @@\n x\n-y\n+Y\n";
    expect(parseUnifiedDiff(diff)).toEqual([
      {
        header: "@@ -1,2 +1,2 @@",
        lines: [
          { type: "context", content: "a", oldNumber: 1, newNumber: 1 },
          { type: "remove", content: "b", oldNumber: 2 },
          { type: "add", content: "B", newNumber: 2 },
        ],
      },
      {
        header: "@@ -10,2 +10,2 @@",
        lines: [
          { type: "context", content: "x", oldNumber: 10, newNumber: 10 },
          { type: "remove", content: "y", oldNumber: 11 },
          { type: "add", content: "Y", newNumber: 11 },
        ],
      },
    ]);
  });

  it("skips index metadata but records the file path from the headers", () => {
    const diff = [
      "diff --git a/f b/f",
      "index 1111111..2222222 100644",
      "--- a/f",
      "+++ b/f",
      "@@ -1,1 +1,1 @@",
      "-old",
      "+new",
    ].join("\n");
    expect(parseUnifiedDiff(diff)).toEqual([
      {
        header: "@@ -1,1 +1,1 @@",
        path: "f",
        lines: [
          { type: "remove", content: "old", oldNumber: 1 },
          { type: "add", content: "new", newNumber: 1 },
        ],
      },
    ]);
  });

  it("records each file's path across a multi-file diff", () => {
    const diff = [
      "diff --git a/src/a.ts b/src/a.ts",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "@@ -1 +1 @@",
      "-const a = 1;",
      "+const a = 2;",
      "diff --git a/src/b.ts b/src/b.ts",
      "--- a/src/b.ts",
      "+++ b/src/b.ts",
      "@@ -5 +5 @@",
      "-const b = 1;",
      "+const b = 2;",
    ].join("\n");
    const hunks = parseUnifiedDiff(diff);
    expect(hunks.map((hunk) => hunk.path)).toEqual(["src/a.ts", "src/b.ts"]);
    expect(hunks[1]?.lines).toEqual([
      { type: "remove", content: "const b = 1;", oldNumber: 5 },
      { type: "add", content: "const b = 2;", newNumber: 5 },
    ]);
  });

  it("reads a '+++'-prefixed line inside a hunk as added content, not a header", () => {
    // Adding a line whose text is "++ a" appears as "+++ a" in the diff body;
    // hunk line counts keep it from being parsed as a `+++ b/path` file header.
    const diff = "@@ -0,0 +1,2 @@\n+++ a\n+normal\n";
    expect(parseUnifiedDiff(diff)).toEqual([
      {
        header: "@@ -0,0 +1,2 @@",
        lines: [
          { type: "add", content: "++ a", newNumber: 1 },
          { type: "add", content: "normal", newNumber: 2 },
        ],
      },
    ]);
  });

  it("skips '\\ No newline at end of file' markers", () => {
    const diff = "@@ -1,1 +1,1 @@\n-old\n\\ No newline at end of file\n+new\n\\ No newline at end of file\n";
    expect(parseUnifiedDiff(diff)).toEqual([
      {
        header: "@@ -1,1 +1,1 @@",
        lines: [
          { type: "remove", content: "old", oldNumber: 1 },
          { type: "add", content: "new", newNumber: 1 },
        ],
      },
    ]);
  });

  it("throws on a malformed hunk header instead of dropping it", () => {
    expect(() => parseUnifiedDiff("@@ not a header @@\n a\n")).toThrow(/Malformed unified diff/);
  });
});
