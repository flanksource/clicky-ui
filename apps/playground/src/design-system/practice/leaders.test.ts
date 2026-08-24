import { describe, expect, it } from "vitest";

import { computeLeaders, leaderPath, type Rect } from "./leaders";

const target: Rect = { left: 0, top: 100, width: 200, height: 40 };
const cardBeside: Rect = { left: 400, top: 90, width: 260, height: 120 };

describe("computeLeaders", () => {
  it("numbers notes in the order given and marks the target's trailing edge", () => {
    const leaders = computeLeaders(
      ["header", "toolbar"],
      new Map([
        ["header", target],
        ["toolbar", { ...target, top: 200 }],
      ]),
      new Map([
        ["header", cardBeside],
        ["toolbar", { ...cardBeside, top: 220 }],
      ]),
    );

    expect(leaders.map(({ id, index, marker }) => ({ id, index, marker }))).toEqual([
      { id: "header", index: 1, marker: { x: 210, y: 120 } },
      { id: "toolbar", index: 2, marker: { x: 210, y: 220 } },
    ]);
  });

  it("anchors a tall region near its top edge so its line does not cut across the specimen", () => {
    const rail = { left: 0, top: 0, width: 240, height: 600 };
    const [leader] = computeLeaders(["rail"], new Map([["rail", rail]]), new Map());
    expect(leader?.marker).toEqual({ x: 250, y: 28 });
  });

  it("keeps the numbering of a note whose element is missing from the specimen", () => {
    const leaders = computeLeaders(
      ["missing", "toolbar"],
      new Map([["toolbar", target]]),
      new Map([["toolbar", cardBeside]]),
    );

    expect(leaders).toHaveLength(1);
    expect(leaders[0]).toMatchObject({ id: "toolbar", index: 2 });
  });

  it("drops the line but keeps the marker when the card is not beside the target", () => {
    const stacked = computeLeaders(
      ["header"],
      new Map([["header", target]]),
      new Map([["header", { left: 0, top: 400, width: 260, height: 120 }]]),
    );

    expect(stacked[0]?.path).toBeNull();
    expect(stacked[0]?.marker).toEqual({ x: 210, y: 120 });
  });

  it("draws a card with no measured position as a marker only", () => {
    const leaders = computeLeaders(["header"], new Map([["header", target]]), new Map());
    expect(leaders[0]?.path).toBeNull();
  });
});

describe("leaderPath", () => {
  it("bends symmetrically between the two endpoints", () => {
    expect(leaderPath({ x: 100, y: 50 }, { x: 300, y: 90 })).toBe(
      "M 100 50 C 200 50, 200 90, 300 90",
    );
  });

  it("refuses a path shorter than the minimum gap, so lines never double back", () => {
    expect(leaderPath({ x: 100, y: 50 }, { x: 110, y: 90 })).toBeNull();
  });
});
