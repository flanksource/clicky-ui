import { describe, expect, it } from "vitest";
import { blameAge, blameLines, isUncommitted, type BlameCommit } from "./blame";

const OLD: BlameCommit = { sha: "a1b2c3d4", author: "Dana", date: "2024-01-01T00:00:00Z", summary: "Add retry" };
const NEW: BlameCommit = { sha: "e5f6a7b8", author: "Lee", date: "2026-01-01T00:00:00Z", summary: "Cap retries" };
const MID: BlameCommit = { sha: "c9d0e1f2", author: "Kim", date: "2025-01-01T00:00:00Z", summary: "Log retries" };

describe("blameLines", () => {
  it("gives every line its commit, marks where each range opens, and ranks age oldest 0 to newest 1", () => {
    const lines = blameLines(
      [
        { startLine: 1, lineCount: 2, commit: OLD },
        { startLine: 3, lineCount: 1, commit: NEW },
        { startLine: 4, lineCount: 1, commit: MID },
      ],
      4,
    );
    expect([...lines].map(([line, b]) => [line, b.commit.sha, b.first, Number(b.recency.toFixed(2))])).toEqual([
      [1, "a1b2c3d4", true, 0],
      [2, "a1b2c3d4", false, 0],
      [3, "e5f6a7b8", true, 1],
      [4, "c9d0e1f2", true, 0.5],
    ]);
  });

  it("rejects blame for more lines than the source has", () => {
    expect(() => blameLines([{ startLine: 2, lineCount: 3, commit: OLD }], 3)).toThrow("blame covers lines 2-4 but the source has 3 lines");
  });
});

describe("blameAge", () => {
  const now = new Date("2026-10-29T12:00:00Z");
  it.each([
    ["2026-10-29T08:00:00Z", "today"],
    ["2026-10-24T12:00:00Z", "5d"],
    ["2026-07-01T12:00:00Z", "4mo"],
    ["2023-10-01T12:00:00Z", "3y"],
  ])("%s is %s old", (date, age) => {
    expect(blameAge(date, now)).toBe(age);
  });
});

it("treats the all-zero sha as uncommitted", () => {
  expect([isUncommitted({ ...OLD, sha: "0000000000000000000000000000000000000000" }), isUncommitted(OLD)]).toEqual([true, false]);
});
