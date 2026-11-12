import { beforeEach, describe, expect, it } from "vitest";
import { previewSelectionLines, sourceSelectionLines } from "./selection-lines";

function selectText(from: Element, to: Element, fromOffset = 0, toOffset?: number): Range {
  const range = document.createRange();
  range.setStart(from.firstChild!, fromOffset);
  range.setEnd(to.firstChild!, toOffset ?? to.firstChild!.textContent!.length);
  return range;
}

describe("previewSelectionLines", () => {
  let markdown: HTMLElement;
  const block = (selector: string) => markdown.querySelector(selector)!;
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="md">
        <h1 data-source-start="1" data-source-end="1">Title</h1>
        <p data-source-start="3" data-source-end="4">First paragraph over two lines</p>
        <ul data-source-start="6" data-source-end="8"><li>one</li><li>two</li></ul>
        <p data-source-start="10" data-source-end="10">Last</p>
      </div>`;
    markdown = document.querySelector<HTMLElement>("#md")!;
  });

  it("covers the whole block a selection inside it touches", () => {
    expect(previewSelectionLines(selectText(block("p"), block("p"), 2, 7), markdown)).toEqual({ startLine: 3, endLine: 4 });
  });

  it("covers the first block's start to the last block's end across blocks", () => {
    expect(previewSelectionLines(selectText(block("p"), block("ul li:last-child")), markdown)).toEqual({ startLine: 3, endLine: 8 });
  });

  it("covers a whole list for a selection inside one of its items", () => {
    expect(previewSelectionLines(selectText(block("li"), block("li")), markdown)).toEqual({ startLine: 6, endLine: 8 });
  });

  it("does not cover a block the selection only reaches the edge of", () => {
    const range = document.createRange();
    range.setStart(block("h1").firstChild!, 0);
    range.setEnd(block("p"), 0);
    expect(previewSelectionLines(range, markdown)).toEqual({ startLine: 1, endLine: 1 });
  });

  it("is null when the selection touches no block", () => {
    document.body.insertAdjacentHTML("beforeend", "<p id='outside'>outside</p>");
    const outside = document.querySelector("#outside")!;
    expect(previewSelectionLines(selectText(outside, outside), markdown)).toBeNull();
  });
});

describe("sourceSelectionLines", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ol>
        <li><span data-source-text="1">alpha</span></li>
        <li><span data-source-text="2">beta</span></li>
        <li><span data-source-text="3">gamma</span></li>
      </ol>`;
  });
  const text = (line: number) => document.querySelector(`[data-source-text="${line}"]`)!;

  it("returns the lines between the selection's ends", () => {
    expect(sourceSelectionLines(selectText(text(1), text(3), 1, 2))).toEqual({ startLine: 1, endLine: 3 });
  });

  it("leaves out a last line the selection only reaches the start of", () => {
    expect(sourceSelectionLines(selectText(text(1), text(3), 0, 0))).toEqual({ startLine: 1, endLine: 2 });
  });

  it("keeps a selection that starts and ends on one line to that line", () => {
    expect(sourceSelectionLines(selectText(text(2), text(2), 1, 3))).toEqual({ startLine: 2, endLine: 2 });
  });

  it("is null when an end is outside the listing's text", () => {
    document.body.insertAdjacentHTML("beforeend", "<p id='outside'>outside</p>");
    const outside = document.querySelector("#outside")!;
    expect(sourceSelectionLines(selectText(text(1), outside))).toBeNull();
  });
});
