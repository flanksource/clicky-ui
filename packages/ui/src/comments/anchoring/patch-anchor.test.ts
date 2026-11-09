import { describe, expect, it } from "vitest";
import {
  PATCH_PREFIX,
  capturePatch,
  describePatch,
  isPatchAnchor,
  matchPatch,
  parsePatchAnchor,
  patchAnchor,
} from "./patch-anchor";

const lines = (count: number, prefix = "line") => Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);
const SOURCE = lines(10).join("\n");

describe("capturePatch", () => {
  it("captures the range and up to three context lines each side, normalising CRLF", () => {
    expect(capturePatch("a\r\nb\r\nc\r\nd\r\ne\r\nf\r\ng\r\nh", 4, 5)).toEqual({
      version: 1,
      startLine: 4,
      endLine: 5,
      before: ["a", "b", "c"],
      lines: ["d", "e"],
      after: ["f", "g", "h"],
    });
  });

  it("has fewer context lines at the file edges", () => {
    expect(capturePatch(SOURCE, 1, 1)).toMatchObject({ before: [], lines: ["line 1"], after: ["line 2", "line 3", "line 4"] });
    expect(capturePatch(SOURCE, 10, 10)).toMatchObject({ before: ["line 7", "line 8", "line 9"], after: [] });
  });

  it.each([
    [0, 1],
    [2, 1],
    [1, 11],
  ])("rejects the range %i-%i outside the file", (start, end) => {
    expect(() => capturePatch(SOURCE, start, end)).toThrow("outside the file");
  });
});

describe("patchAnchor", () => {
  it("round-trips through parsePatchAnchor behind the r: prefix", () => {
    const patch = capturePatch(SOURCE, 4, 6);
    const anchor = patchAnchor(patch);
    expect({ prefix: anchor.startsWith(PATCH_PREFIX), is: isPatchAnchor(anchor), parsed: parsePatchAnchor(anchor) }).toEqual({
      prefix: true,
      is: true,
      parsed: patch,
    });
  });

  it("rejects an anchor that is not r: JSON of a patch", () => {
    expect(isPatchAnchor("q:{}")).toBe(false);
    expect(() => parsePatchAnchor("q:{}")).toThrow(/expected an "r:" patch anchor/);
    expect(() => parsePatchAnchor("r:{not json")).toThrow(/not valid JSON/);
    expect(() => parsePatchAnchor('r:{"version":1,"startLine":1}')).toThrow(/not a patch/);
  });

  it("describes the covered lines", () => {
    expect([describePatch(capturePatch(SOURCE, 3, 3)), describePatch(capturePatch(SOURCE, 3, 5))]).toEqual(["Line 3", "Lines 3–5"]);
  });
});

describe("matchPatch mirrors the server's ResolvePatch", () => {
  // Ten distinct lines with the range at 5-6 so every insertion above is outside its 3 context lines.
  const original = lines(10);
  const patch = capturePatch(original.join("\n"), 5, 6);

  it("matches the hunk where it was captured", () => {
    expect(matchPatch(original.join("\n"), patch)).toEqual({ state: "matched", startLine: 5, endLine: 6 });
  });

  it("follows the range when lines are inserted above the context", () => {
    const edited = ["new 1", "new 2", ...original].join("\n");
    expect(matchPatch(edited, patch)).toEqual({ state: "matched", startLine: 7, endLine: 8 });
  });

  it("follows the range when lines are removed above the context", () => {
    const edited = original.slice(1).join("\n");
    expect(matchPatch(edited, patch)).toEqual({ state: "matched", startLine: 4, endLine: 5 });
  });

  it("is outdated once the range's lines are deleted", () => {
    const edited = original.filter((_, i) => i !== 4 && i !== 5).join("\n");
    expect(matchPatch(edited, patch)).toEqual({ state: "outdated" });
  });

  it("is outdated when only the context changed, as there is no fuzzy fallback", () => {
    const edited = original.map((text, i) => (i === 3 ? "edited" : text)).join("\n");
    expect(matchPatch(edited, patch)).toEqual({ state: "outdated" });
  });

  // A period-3 document: the captured hunk recurs every third line.
  const periodic = Array.from({ length: 18 }, (_, i) => "abc"[i % 3]!);

  it("is ambiguous when the whole hunk repeats away from where it was captured", () => {
    const captured = capturePatch(periodic.join("\n"), 10, 10);
    expect(matchPatch(["pad", ...periodic].join("\n"), captured)).toEqual({ state: "ambiguous" });
  });

  it("prefers the recorded position when the hunk also occurs elsewhere", () => {
    const captured = capturePatch(periodic.join("\n"), 10, 10);
    expect(matchPatch(periodic.join("\n"), captured)).toEqual({ state: "matched", startLine: 10, endLine: 10 });
  });

  it("is whitespace-sensitive", () => {
    const edited = original.map((text, i) => (i === 4 ? `${text} ` : text)).join("\n");
    expect(matchPatch(edited, patch)).toEqual({ state: "outdated" });
  });

  it("normalises CRLF in the source", () => {
    expect(matchPatch(original.join("\r\n"), patch)).toEqual({ state: "matched", startLine: 5, endLine: 6 });
  });

  it.each([
    ["a version other than 1", { ...patch, version: 2 }],
    ["no lines", { ...patch, lines: [], endLine: 4 }],
    ["a start line below 1", { ...patch, startLine: 0, endLine: 1 }],
    ["an end line that disagrees with the lines", { ...patch, endLine: 9 }],
    ["more than three lines before", { ...patch, before: ["a", "b", "c", "d"] }],
    ["more than three lines after", { ...patch, after: ["a", "b", "c", "d"] }],
  ])("is outdated for %s", (_name, invalid) => {
    expect(matchPatch(original.join("\n"), invalid)).toEqual({ state: "outdated" });
  });
});
