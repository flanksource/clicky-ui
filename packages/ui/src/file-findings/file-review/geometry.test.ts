import { beforeEach, describe, expect, it } from "vitest";
import { elementAnchor } from "../../comments/anchoring/dom-anchor";
import { layoutCards, measureAnchors, textLines } from "./geometry";

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

describe("measureAnchors for line-range and element anchors", () => {
  // jsdom lays nothing out: give each block a rect by its source line so the boxes tell the blocks apart.
  const blockRect = (el: Element) => {
    const top = Number((el as HTMLElement).dataset.sourceStart ?? 0) * 10;
    return { top, left: 0, width: 100, height: 20, right: 100, bottom: top + 20, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
  };
  let origin: HTMLElement;
  let markdown: HTMLElement;
  beforeEach(() => {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
    document.body.innerHTML = `
      <div id="origin"><div id="md" data-annotated-markdown="">
        <h1 data-source-start="1" data-source-end="1">Title</h1>
        <p data-source-start="3" data-source-end="4">Intro</p>
        <p data-source-start="6" data-source-end="6">Middle</p>
        <p data-source-start="8" data-source-end="9">Outro</p>
      </div></div>`;
    origin = document.querySelector<HTMLElement>("#origin")!;
    markdown = document.querySelector<HTMLElement>("#md")!;
    origin.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 200 }) as DOMRect;
    for (const block of markdown.querySelectorAll("[data-source-start]")) block.getBoundingClientRect = () => blockRect(block);
  });

  it("covers every block a placed r: range overlaps, in document order, and skips an unplaced one", () => {
    const boxes = measureAnchors({
      origin,
      markdown,
      anchors: ["r:placed", "r:unplaced"],
      mode: "text",
      patchRanges: new Map([["r:placed", { start: 4, end: 8 }]]),
    });
    expect([...boxes].map(([anchor, list]) => [anchor, list.map((box) => box.top)])).toEqual([["r:placed", [30, 60, 80]]]);
  });

  it("boxes the element an e: anchor's locators find, and leaves out one they cannot find", () => {
    const found = elementAnchor([{ kind: "css", selector: "p:nth-of-type(2)" }]);
    const gone = elementAnchor([{ kind: "css", selector: "#missing" }]);
    const boxes = measureAnchors({ origin, markdown, anchors: [found, gone], mode: "text" });
    expect([...boxes].map(([anchor, list]) => [anchor === found, list])).toEqual([[true, [{ top: 60, left: 0, width: 100, height: 20 }]]]);
  });
});
