import { describe, expect, it } from "vitest";
import { DOCUMENT_ANCHOR, type Comment } from "../comments/comment-types";
import { resolveCommentStage } from "../lib/comment-stage";
import {
  FINDINGS_COMMENT_CONFIG,
  blockAnchor,
  findingsToComments,
  lineAnchor,
  lineRangeAnchorResolver,
} from "./findings-comments";
import type { FileFinding } from "./types";

const lintFinding: FileFinding = {
  file: "pkg/a.go",
  line: 41,
  severity: "warning",
  message: "Error return value is not checked",
  source: "golangci-lint",
  rule: "errcheck",
  kind: "lint",
};

describe("findingsToComments", () => {
  it("maps a finding to a root comment anchored on its line", () => {
    const [comment] = findingsToComments([lintFinding]);

    expect(comment).toMatchObject<Partial<Comment>>({
      body: "Error return value is not checked\n\n`errcheck`",
      anchor: "line:41",
      author: { name: "golangci-lint", kind: "agent" },
      status: "warning",
      facets: { severity: "warning", source: "golangci-lint", kind: "lint" },
    });
    expect(comment?.parentId ?? null).toBeNull();
  });

  it("leaves the rule out of the body when the finding has none", () => {
    const [comment] = findingsToComments([{ ...lintFinding, rule: undefined }]);

    expect(comment?.body).toBe("Error return value is not checked");
  });

  it("gives every comment a distinct id that sorts in finding order", () => {
    const findings = Array.from({ length: 12 }, (_, i) => ({ ...lintFinding, line: i + 1 }));

    const ids = findingsToComments(findings).map((c) => c.id);

    expect(new Set(ids).size).toBe(12);
    expect(ids).toEqual(ids.slice().sort());
  });

  it("is active for every severity, so the side panel lists all of them as open", () => {
    for (const status of FINDINGS_COMMENT_CONFIG.statuses) {
      expect(resolveCommentStage(FINDINGS_COMMENT_CONFIG, status.value)).toBe("active");
    }
    expect(FINDINGS_COMMENT_CONFIG.statuses.map((s) => s.value)).toEqual(["error", "warning", "info"]);
  });
});

describe("lineRangeAnchorResolver", () => {
  const registered = [blockAnchor(1, 1), blockAnchor(3, 4), blockAnchor(6, 20), blockAnchor(8, 9)];

  it.each([
    ["the block that contains the line", 4, "L3-4"],
    ["the smallest of several blocks that contain the line", 8, "L8-9"],
    ["a line that is the first line of its block", 6, "L6-20"],
  ])("resolves to %s", (_name, line, expected) => {
    expect(lineRangeAnchorResolver(lineAnchor(line), registered)).toBe(expected);
  });

  it("falls back to the nearest block above a line that lies between blocks", () => {
    expect(lineRangeAnchorResolver(lineAnchor(2), [blockAnchor(1, 1), blockAnchor(3, 4)])).toBe("L1-1");
  });

  it("falls back to the document anchor when no block starts above the line", () => {
    expect(lineRangeAnchorResolver(lineAnchor(1), [blockAnchor(5, 6), DOCUMENT_ANCHOR])).toBe(DOCUMENT_ANCHOR);
  });

  it("resolves to nothing when nothing suitable is registered", () => {
    expect(lineRangeAnchorResolver(lineAnchor(1), [blockAnchor(5, 6)])).toBeNull();
  });

  it("resolves a block anchor to itself, and rejects an anchor it does not understand", () => {
    expect(lineRangeAnchorResolver("L3-4", registered)).toBe("L3-4");
    expect(() => lineRangeAnchorResolver("section:intro", registered)).toThrow(/section:intro/);
  });
});
