import { describe, expect, it } from "vitest";
import type { GraphLayoutGroupBox, GroupMemberWindow } from "./graph-columns-layout";
import {
  clampWindowStart,
  revealMember,
  revealWindowStart,
  wheelRows,
  windowedPositions,
  windowRows,
} from "./graph-group-window";

// Twelve 22px rows under a 24px header, ten shown at once: the drawn area runs from y 124 to 344.
const ROW = 22;
const TOP = 124;
const IDS = Array.from({ length: 12 }, (_, index) => `m${index}`);
const WINDOW: GroupMemberWindow = { members: IDS, tops: IDS.map((_, index) => index * ROW), rows: 10, top: TOP, height: 10 * ROW, footerHeight: 18 };
const BOX: GraphLayoutGroupBox = { id: "1:AsPolicy", group: "AsPolicy", level: 1, x: 10, y: 100, width: 180, height: 24 + 10 * ROW + 18, record: true, headerHeight: 24, window: WINDOW };
const PLAIN: GraphLayoutGroupBox = { id: "0:pkg", group: "pkg", level: 0, x: 10, y: 10, width: 180, height: 80, record: false, headerHeight: 0 };
const X = 100;
const natural = (index: number) => ({ x: X, y: TOP + index * ROW + ROW / 2 });
const POSITIONS = { ...Object.fromEntries(IDS.map((id, index) => [id, natural(index)])), root: { x: 300, y: 50 } };

describe("clampWindowStart", () => {
  it("keeps a start between the first row and the last full window", () => {
    expect([-3, 0, 1, 2, 5].map((start) => clampWindowStart(WINDOW, start))).toEqual([0, 0, 1, 2, 2]);
  });
});

describe("revealWindowStart", () => {
  it("scrolls just far enough to bring a member into view, and leaves a shown member or a stranger alone", () => {
    expect([
      revealWindowStart(WINDOW, 0, "m11"),
      revealWindowStart(WINDOW, 2, "m0"),
      revealWindowStart(WINDOW, 1, "m5"),
      revealWindowStart(WINDOW, 1, "root"),
    ]).toEqual([2, 0, 1, 1]);
  });
});

describe("revealMember", () => {
  it("moves the window of the box holding the member", () => {
    expect(revealMember([PLAIN, BOX], { [BOX.id]: 0 }, "m11")).toEqual({ [BOX.id]: 2 });
  });

  it("returns the same starts when nothing has to move", () => {
    const starts = { [BOX.id]: 1 };
    const results = [revealMember([PLAIN, BOX], starts, "m4"), revealMember([PLAIN, BOX], starts, undefined), revealMember([PLAIN, BOX], starts, "root")];
    expect(results.every((result) => result === starts)).toBe(true);
  });
});

describe("windowedPositions", () => {
  it("shifts shown members up by the rows scrolled past and pins hidden ones to the window's top or bottom edge", () => {
    const { positions, hidden } = windowedPositions(POSITIONS, [PLAIN, BOX], { [BOX.id]: 1 });
    expect({
      m0: positions.m0, m1: positions.m1, m10: positions.m10, m11: positions.m11, root: positions.root, hidden: [...hidden].sort(),
    }).toEqual({
      m0: { x: X, y: TOP },
      m1: { x: X, y: TOP + ROW / 2 },
      m10: { x: X, y: TOP + 9 * ROW + ROW / 2 },
      m11: { x: X, y: TOP + 10 * ROW },
      root: { x: 300, y: 50 },
      hidden: ["m0", "m11"],
    });
  });

  it("clamps a start past the last full window", () => {
    const { hidden } = windowedPositions(POSITIONS, [BOX], { [BOX.id]: 9 });
    expect([...hidden].sort()).toEqual(["m0", "m1"]);
  });

  it("starts an unscrolled window at its first member", () => {
    const { positions, hidden } = windowedPositions(POSITIONS, [BOX], {});
    expect({ m0: positions.m0, hidden: [...hidden].sort() }).toEqual({ m0: natural(0), hidden: ["m10", "m11"] });
  });
});

describe("windowRows", () => {
  it("counts the rows shown from one, as the footer says them", () => {
    expect([windowRows(WINDOW, 0), windowRows(WINDOW, 2)]).toEqual([{ first: 1, last: 10, total: 12 }, { first: 3, last: 12, total: 12 }]);
  });
});

describe("wheelRows", () => {
  it("turns wheel travel into whole rows, carrying the remainder to the next event", () => {
    expect([wheelRows(0, 30, ROW), wheelRows(8, 30, ROW), wheelRows(0, -50, ROW), wheelRows(0, 5, ROW)]).toEqual([
      { rows: 1, carry: 8 },
      { rows: 1, carry: 16 },
      { rows: -2, carry: -6 },
      { rows: 0, carry: 5 },
    ]);
  });
});
