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

  describe("a placed r: range that also carries a quote", () => {
    const QUOTE = { prefix: "Intro", exact: "key phrase", suffix: "inside." };
    const quoted = new Map([["r:quoted", { start: 3, end: 4, quote: QUOTE }]]);
    const measure = (mode: "text" | "block") => measureAnchors({ origin, markdown, anchors: ["r:quoted"], mode, patchRanges: quoted });
    const PHRASE_RECT = { top: 7, left: 11, width: 30, height: 14 };

    beforeEach(() => {
      markdown.querySelector('[data-source-start="3"]')!.textContent = "Intro with the key phrase inside.";
      // jsdom has no layout: only a range over the quoted words has a rect.
      Range.prototype.getClientRects = function (this: Range) {
        return (this.toString() === QUOTE.exact ? [PHRASE_RECT] : []) as unknown as DOMRectList;
      };
    });

    it("highlights the quoted words while they still lie in the matched lines", () => {
      expect([...measure("text")]).toEqual([["r:quoted", [PHRASE_RECT]]]);
    });

    it("falls back to the blocks covering the lines once the quote is gone", () => {
      markdown.querySelector('[data-source-start="3"]')!.textContent = "Intro rewritten entirely.";
      expect([...measure("text")]).toEqual([["r:quoted", [{ top: 30, left: 0, width: 100, height: 20 }]]]);
    });

    it("draws the covering blocks, not the words, when the whole block is the mode", () => {
      expect([...measure("block")]).toEqual([["r:quoted", [{ top: 30, left: 0, width: 100, height: 20 }]]]);
    });
  });

  describe("a placed r: range on a table row", () => {
    // Header on line 12, delimiter on 13, body rows on 14 and 15.
    const ROW_TOP: Record<string, number> = { Name: 120, Alice: 140, Bob: 150 };
    const CELL_WIDTH = 50;
    const CHAR_WIDTH = 10;
    const CELL = { keyColumn: "Name", key: "Bob", column: "Age", row: 1, col: 1 };
    const BOB_ROW = { top: 150, left: 0, width: CELL_WIDTH + CHAR_WIDTH * "25 years".length, height: 8 };

    beforeEach(() => {
      markdown.insertAdjacentHTML(
        "beforeend",
        `<div data-source-start="12" data-source-end="15"><table>
          <thead><tr><th>Name</th><th>Age</th></tr></thead>
          <tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25 years</td></tr></tbody>
        </table></div>`,
      );
      // jsdom has no layout: text sits on its row's line, each cell CELL_WIDTH apart, CHAR_WIDTH per character.
      const textRect = (cell: HTMLTableCellElement, from: number, text: string) => ({
        top: ROW_TOP[(cell.parentElement as HTMLTableRowElement).cells[0]!.textContent!]!,
        left: cell.cellIndex * CELL_WIDTH + from * CHAR_WIDTH,
        width: text.length * CHAR_WIDTH,
        height: 8,
      });
      Range.prototype.getClientRects = function (this: Range) {
        const start = this.startContainer;
        if (start instanceof HTMLTableRowElement) return [...start.cells].map((c) => textRect(c, 0, c.textContent!)) as unknown as DOMRectList;
        const cell = (start instanceof Element ? start : start.parentElement)?.closest("td, th");
        return (cell ? [textRect(cell as HTMLTableCellElement, start instanceof Text ? this.startOffset : 0, this.toString())] : []) as unknown as DOMRectList;
      };
    });
    const measure = (range: { start: number; end: number; cell?: typeof CELL; quote?: { prefix: string; exact: string; suffix: string } }) =>
      [...measureAnchors({ origin, markdown, anchors: ["r:row"], mode: "text", patchRanges: new Map([["r:row", range]]) })];

    it("boxes only the row's text when it carries neither a cell nor a quote, not the whole table", () => {
      expect(measure({ start: 15, end: 15 })).toEqual([["r:row", [BOB_ROW]]]);
    });

    it("boxes only the cell's text when it carries the cell", () => {
      expect(measure({ start: 15, end: 15, cell: CELL })).toEqual([["r:row", [{ top: 150, left: CELL_WIDTH, width: 8 * CHAR_WIDTH, height: 8 }]]]);
    });

    it("boxes the quoted words inside the cell when it carries both", () => {
      expect(measure({ start: 15, end: 15, cell: CELL, quote: { prefix: "", exact: "years", suffix: "" } })).toEqual([
        ["r:row", [{ top: 150, left: CELL_WIDTH + 3 * CHAR_WIDTH, width: 5 * CHAR_WIDTH, height: 8 }]],
      ]);
    });

    it("boxes the row once the cell is gone from the matched lines", () => {
      expect(measure({ start: 15, end: 15, cell: { ...CELL, key: "Dave", row: 4 } })).toEqual([["r:row", [BOB_ROW]]]);
    });
  });

  it("boxes the element an e: anchor's locators find, and leaves out one they cannot find", () => {
    const found = elementAnchor([{ kind: "css", selector: "p:nth-of-type(2)" }]);
    const gone = elementAnchor([{ kind: "css", selector: "#missing" }]);
    const boxes = measureAnchors({ origin, markdown, anchors: [found, gone], mode: "text" });
    expect([...boxes].map(([anchor, list]) => [anchor === found, list])).toEqual([[true, [{ top: 60, left: 0, width: 100, height: 20 }]]]);
  });
});
