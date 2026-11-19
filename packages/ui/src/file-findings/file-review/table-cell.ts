// Anchors inside a rendered GFM table. A table renders as one source block, but
// each of its rows is one source line: the header on the block's first line, the
// delimiter on the next, then one line per body row. That lets a comment narrow
// from the whole table to its row's line, and name its cell as row[key][column].
import type { TableCell } from "../../comments/annotation-types";

const SOURCE_BLOCK = "[data-source-start]";

/** A table row with its body index (-1 for the header) and its source line. */
export type TableRow = { row: HTMLTableRowElement; index: number; line: number };

/**
 * The rows of a block holding a single GFM table, with their source lines.
 * Empty unless the block's lines hold exactly one per row (header, delimiter,
 * body rows), as a table nested in a list or quote with other content does not.
 */
export function tableRows(block: Element): TableRow[] {
  const tables = block.querySelectorAll("table");
  if (tables.length !== 1) return [];
  const rows = [...tables[0]!.rows];
  const { sourceStart, sourceEnd } = (block as HTMLElement).dataset;
  const start = Number(sourceStart);
  if (rows.length === 0 || tables[0]!.tHead?.rows.length !== 1 || rows.length !== Number(sourceEnd) - start) return [];
  return rows.map((row, i) => ({ row, index: i - 1, line: i === 0 ? start : start + 1 + i }));
}

const cellText = (cell: Element | undefined) => (cell?.textContent ?? "").replace(/\s+/g, " ").trim();

function topBlock(node: Node, markdown: Element): Element | null {
  let block: Element | null = null;
  for (let el = node instanceof Element ? node : node.parentElement; el && el !== markdown; el = el.parentElement) {
    if (el.matches(SOURCE_BLOCK)) block = el;
  }
  return block;
}

const cellOf = (node: Node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLTableCellElement>("td, th") ?? null;

const headerTexts = (rows: readonly TableRow[]) => [...rows[0]!.row.cells].map((c) => cellText(c));
const columnTexts = (body: readonly TableRow[], col: number) => body.map((r) => cellText(r.row.cells[col]));

/** The first column, from the left, whose body values are all present and distinct; undefined when none is. */
function keyColumnOf(rows: readonly TableRow[]): number | undefined {
  const body = rows.slice(1);
  for (let col = 0; col < rows[0]!.row.cells.length; col++) {
    const values = columnTexts(body, col);
    if (values.every(Boolean) && new Set(values).size === values.length) return col;
  }
  return undefined;
}

/** The table cell a selection lies wholly inside, and its row's source line; null outside a mapped table or across cells. */
export function tableCellOf(range: Range, markdown: Element): { cell: TableCell; line: number } | null {
  const cell = cellOf(range.startContainer);
  if (!cell || cell !== cellOf(range.endContainer) || !markdown.contains(cell)) return null;
  const block = topBlock(cell, markdown);
  const rows = block ? tableRows(block) : [];
  const own = rows.find(({ row }) => row === cell.parentElement);
  if (!own) return null;
  const keyCol = own.index < 0 ? undefined : keyColumnOf(rows);
  const headers = headerTexts(rows);
  return {
    cell: {
      keyColumn: keyCol === undefined ? "" : headers[keyCol]!,
      key: keyCol === undefined ? "" : cellText(own.row.cells[keyCol]),
      column: headers[cell.cellIndex]!,
      row: own.index,
      col: cell.cellIndex,
    },
    line: own.line,
  };
}

/** The one index whose text is `text`, or undefined when none or several are (or `text` is blank). */
function uniqueIndex(texts: readonly string[], text: string): number | undefined {
  if (!text) return undefined;
  const found = texts.flatMap((t, i) => (t === text ? [i] : []));
  return found.length === 1 ? found[0] : undefined;
}

/**
 * Finds a cell again in `block`'s table, following reordered rows and columns:
 * its row is the one whose `keyColumn` holds `key`, and its column the header
 * `column`, each when exactly one matches; otherwise the captured indices.
 * Null once no such cell exists.
 */
export function resolveTableCell(block: Element, cell: TableCell): { cell: HTMLTableCellElement; line: number } | null {
  const rows = tableRows(block);
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  const headers = headerTexts(rows);
  const keyCol = uniqueIndex(headers, cell.keyColumn);
  const byKey = keyCol === undefined ? undefined : uniqueIndex(columnTexts(body, keyCol), cell.key);
  const row = cell.row < 0 ? header : body[byKey ?? cell.row];
  const found = row?.row.cells[uniqueIndex(headers, cell.column) ?? cell.col];
  return row && found ? { cell: found, line: row.line } : null;
}

/** Reader-facing label: `row[key][column]`, `header[column]`, or `cell[row][col]` when the names are blank. */
export function describeCell(cell: TableCell): string {
  if (cell.row < 0 && cell.column) return `header[${cell.column}]`;
  return cell.key && cell.column ? `row[${cell.key}][${cell.column}]` : `cell[${cell.row}][${cell.col}]`;
}
