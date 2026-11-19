import { beforeEach, describe, expect, it } from "vitest";
import { describeCell, resolveTableCell, tableCellOf, tableRows } from "./table-cell";

// A GFM table at source lines 3-7: header (3), delimiter (4), then one line per body row (5-7).
const TABLE_START = 3;
const tableBlock = (rows: string[][], start = TABLE_START, end = start + rows.length) => `
  <div data-source-start="${start}" data-source-end="${end}"><table>
    <thead><tr>${rows[0]!.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .slice(1)
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("")}</tbody>
  </table></div>`;

const PEOPLE = [
  ["Name", "Age", "City"],
  ["Alice", "30", "Paris"],
  ["Bob", "25", "Rome"],
  ["Carol", "41", "Oslo"],
];

function render(html: string): HTMLElement {
  document.body.innerHTML = `<div id="md"><p data-source-start="1" data-source-end="1">Intro</p>${html}</div>`;
  return document.querySelector<HTMLElement>("#md")!;
}

const cellAt = (markdown: Element, text: string) => [...markdown.querySelectorAll("td, th")].find((cell) => cell.textContent === text)!;

function selectIn(from: Element, to: Element = from, fromOffset = 0, toOffset?: number): Range {
  const range = document.createRange();
  range.setStart(from.firstChild!, fromOffset);
  range.setEnd(to.firstChild!, toOffset ?? to.firstChild!.textContent!.length);
  return range;
}

describe("tableRows", () => {
  it("gives the header the table's first line and each body row the line after the delimiter", () => {
    const markdown = render(tableBlock(PEOPLE));
    const block = markdown.querySelector("[data-source-start='3']")!;
    expect(tableRows(block).map(({ index, line }) => [index, line])).toEqual([
      [-1, TABLE_START],
      [0, TABLE_START + 2],
      [1, TABLE_START + 3],
      [2, TABLE_START + 4],
    ]);
  });

  it("maps no rows when the block's lines do not hold exactly one line per row, as for a table inside a list", () => {
    const markdown = render(tableBlock(PEOPLE, TABLE_START, TABLE_START + PEOPLE.length + 2));
    expect(tableRows(markdown.querySelector("[data-source-start='3']")!)).toEqual([]);
  });

  it("maps no rows for a block that is not a table", () => {
    const markdown = render(tableBlock(PEOPLE));
    expect(tableRows(markdown.querySelector("p")!)).toEqual([]);
  });
});

describe("tableCellOf", () => {
  let markdown: HTMLElement;
  beforeEach(() => {
    markdown = render(tableBlock(PEOPLE));
  });

  it("names the cell a selection lies in by its row's first-column value and its column header, with its row's source line", () => {
    expect(tableCellOf(selectIn(cellAt(markdown, "25"), cellAt(markdown, "25"), 0, 1), markdown)).toEqual({
      cell: { keyColumn: "Name", key: "Bob", column: "Age", row: 1, col: 1 },
      line: TABLE_START + 3,
    });
  });

  it("keys the row on the first column whose values are unique when the first column repeats", () => {
    markdown = render(
      tableBlock([
        ["Team", "Id", "Score"],
        ["Red", "r1", "7"],
        ["Red", "r2", "9"],
      ]),
    );
    expect(tableCellOf(selectIn(cellAt(markdown, "9")), markdown)?.cell).toEqual({ keyColumn: "Id", key: "r2", column: "Score", row: 1, col: 2 });
  });

  it("keys the row on no column when none has unique values, leaving the indices to place it", () => {
    markdown = render(
      tableBlock([
        ["Team", "Score"],
        ["Red", "7"],
        ["Red", "7"],
      ]),
    );
    const second = markdown.querySelectorAll("tbody tr")[1]!.cells[1]!;
    expect(tableCellOf(selectIn(second), markdown)?.cell).toEqual({ keyColumn: "", key: "", column: "Score", row: 1, col: 1 });
  });

  it("names a header cell as row -1 on the table's first line", () => {
    expect(tableCellOf(selectIn(cellAt(markdown, "City")), markdown)).toEqual({
      cell: { keyColumn: "", key: "", column: "City", row: -1, col: 2 },
      line: TABLE_START,
    });
  });

  it("names no cell for a selection spanning two cells", () => {
    expect(tableCellOf(selectIn(cellAt(markdown, "Bob"), cellAt(markdown, "25")), markdown)).toBeNull();
  });

  it("names no cell for a selection outside a table", () => {
    expect(tableCellOf(selectIn(markdown.querySelector("p")!), markdown)).toBeNull();
  });
});

describe("resolveTableCell", () => {
  const BOB_AGE = { keyColumn: "Name", key: "Bob", column: "Age", row: 1, col: 1 };
  const blockOf = (markdown: Element) => markdown.querySelector("[data-source-start='3']")!;

  it("finds the cell by its row's key and its column header", () => {
    const markdown = render(tableBlock(PEOPLE));
    expect(resolveTableCell(blockOf(markdown), BOB_AGE)?.cell.textContent).toBe("25");
  });

  it("follows the row and the column when both are reordered", () => {
    const markdown = render(
      tableBlock([
        ["City", "Age", "Name"],
        ["Paris", "30", "Alice"],
        ["Rome", "25", "Bob"],
      ]),
    );
    // The key column moved from first to last and Bob's row moved up: both are found by name, not index.
    expect(resolveTableCell(blockOf(markdown), { ...BOB_AGE, row: 0, col: 0 })?.cell.textContent).toBe("25");
  });

  it("places the row by its index when its key column is unnamed or its key repeats, and the column by index when its header repeats", () => {
    const markdown = render(
      tableBlock([
        ["Name", "Age", "Age"],
        ["Bob", "25", "26"],
        ["Bob", "35", "36"],
      ]),
    );
    expect([
      resolveTableCell(blockOf(markdown), { keyColumn: "Name", key: "Bob", column: "Age", row: 1, col: 2 })?.cell.textContent,
      resolveTableCell(blockOf(markdown), { keyColumn: "", key: "", column: "Age", row: 0, col: 1 })?.cell.textContent,
    ]).toEqual(["36", "25"]);
  });

  it("resolves a header cell", () => {
    const markdown = render(tableBlock(PEOPLE));
    expect(resolveTableCell(blockOf(markdown), { keyColumn: "", key: "", column: "City", row: -1, col: 2 })?.line).toBe(TABLE_START);
  });

  it("finds nothing once the row or column is gone", () => {
    const markdown = render(tableBlock(PEOPLE));
    expect([
      resolveTableCell(blockOf(markdown), { ...BOB_AGE, key: "Dave", row: 7 }),
      resolveTableCell(blockOf(markdown), { ...BOB_AGE, column: "Height", col: 5 }),
    ]).toEqual([null, null]);
  });
});

describe("describeCell", () => {
  it("reads as row[key][column] for a keyed cell, header[column] for a header cell, cell[row][col] without a key", () => {
    expect([
      describeCell({ keyColumn: "Name", key: "Bob", column: "Age", row: 1, col: 1 }),
      describeCell({ keyColumn: "", key: "", column: "City", row: -1, col: 2 }),
      describeCell({ keyColumn: "", key: "", column: "Score", row: 3, col: 0 }),
    ]).toEqual(["row[Bob][Age]", "header[City]", "cell[3][0]"]);
  });
});
