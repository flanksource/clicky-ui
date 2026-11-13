import { describe, expect, it } from "vitest";
import { capturePatch, patchAnchor } from "../../comments/anchoring/patch-anchor";
import { patchDraft, patchLabel, patchLineRanges, patchSourceMarks, placePatches } from "./patch-comments";

const original = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`);
const source = original.join("\n");
const anchorAt = (start: number, end: number) => patchAnchor(capturePatch(source, start, end));
const thread = anchorAt(7, 8);
const other = anchorAt(10, 10);

describe("placePatches", () => {
  it("places each r: anchor and ignores any other kind", () => {
    const placements = placePatches(source, [thread, "q:{}", "line:3"]);
    expect([...placements].map(([anchor, p]) => [anchor === thread, p.match])).toEqual([[true, { state: "matched", startLine: 7, endLine: 8 }]]);
  });

  it("follows lines inserted above their context and reports a deleted range as outdated", () => {
    const inserted = ["a", "b", ...original].join("\n");
    const deleted = original.filter((_, i) => i !== 6 && i !== 7).join("\n");
    expect({
      moved: placePatches(inserted, [thread]).get(thread)?.match,
      gone: placePatches(deleted, [thread]).get(thread)?.match,
    }).toEqual({ moved: { state: "matched", startLine: 9, endLine: 10 }, gone: { state: "outdated" } });
  });

  it("throws for an r: anchor that is not a patch", () => {
    expect(() => placePatches(source, ["r:{oops"])).toThrow(/not valid JSON/);
  });
});

describe("patchLineRanges", () => {
  it("lists only the placed anchors' current lines", () => {
    const deleted = original.filter((_, i) => i !== 6 && i !== 7).join("\n");
    expect({
      placed: [...patchLineRanges(placePatches(source, [thread, other]))],
      afterDelete: [...patchLineRanges(placePatches(deleted, [thread, other]))],
    }).toEqual({
      placed: [
        [thread, { start: 7, end: 8 }],
        [other, { start: 10, end: 10 }],
      ],
      afterDelete: [],
    });
  });
});

describe("patchSourceMarks", () => {
  it("covers every line of a placed range with a whole-line span, in the lines' own text", () => {
    const marks = patchSourceMarks(source, placePatches(source, [thread]));
    expect(marks).toEqual([
      {
        anchor: thread,
        spans: [
          { line: 7, start: 0, end: "line 7".length },
          { line: 8, start: 0, end: "line 8".length },
        ],
      },
    ]);
  });
});

describe("patchLabel", () => {
  it("names the current lines, or the state and the lines it was captured on", () => {
    const deleted = original.filter((_, i) => i !== 6 && i !== 7).join("\n");
    const placements = placePatches(deleted, [thread]);
    expect({
      current: patchLabel(placePatches(source, [thread]).get(thread)!),
      stale: patchLabel(placements.get(thread)!),
    }).toEqual({ current: "Lines 7–8", stale: "Outdated · Lines 7–8" });
  });

  it("explains an ambiguous hunk", () => {
    const periodic = Array.from({ length: 18 }, (_, i) => "abc"[i % 3]!).join("\n");
    const anchor = patchAnchor(capturePatch(periodic, 10, 10));
    expect(patchLabel(placePatches(`pad\n${periodic}`, [anchor]).get(anchor)!)).toBe("Ambiguous · Line 10");
  });
});

describe("patchDraft", () => {
  it("captures the lines from the raw text with a reader-facing label", () => {
    expect(patchDraft(source, { startLine: 2, endLine: 3 })).toEqual({
      anchor: patchAnchor(capturePatch(source, 2, 3)),
      label: "Lines 2–3",
    });
  });
});
