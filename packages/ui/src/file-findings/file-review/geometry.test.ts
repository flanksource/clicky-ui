import { describe, expect, it } from "vitest";
import { layoutCards, textLines } from "./geometry";

const CARD_HEIGHT = 50;
const GAP = 8;

const card = (anchor: string, desired: number, order = 0) => ({ anchor, desired, order, height: CARD_HEIGHT });

describe("layoutCards", () => {
  it("pushes overlapping cards down in anchor order when none is focused", () => {
    const tops = layoutCards({ cards: [card("b", 10, 1), card("a", 10, 0), card("c", 200)], focused: null, gap: GAP });
    expect(Object.fromEntries(tops)).toEqual({ a: 10, b: 10 + CARD_HEIGHT + GAP, c: 200 });
  });

  it("keeps the focused card level with its anchor and pushes the cards above it up", () => {
    const tops = layoutCards({ cards: [card("a", 100), card("b", 120)], focused: "b", gap: GAP });
    expect(Object.fromEntries(tops)).toEqual({ a: 120 - GAP - CARD_HEIGHT, b: 120 });
  });

  it("never places a card above the top of the rail", () => {
    const tops = layoutCards({ cards: [card("a", 0), card("b", 10)], focused: "b", gap: GAP });
    expect(Object.fromEntries(tops)).toEqual({ a: 0, b: CARD_HEIGHT + GAP });
  });
});

describe("textLines", () => {
  it("merges rects on one visual line into their horizontal union", () => {
    const rects = [
      { top: 0, left: 40, width: 20, height: 16 },
      { top: 1, left: 0, width: 30, height: 15 },
      { top: 20, left: 0, width: 50, height: 16 },
    ];
    expect(textLines(rects)).toEqual([
      { top: 0, left: 0, width: 60, height: 16 },
      { top: 20, left: 0, width: 50, height: 16 },
    ]);
  });
});
