import { sourceRangeOf } from "./source-marks";
import { tableRows } from "./table-cell";

/** An inclusive, 1-based range of source lines. */
export type LineRange = { startLine: number; endLine: number };

const SOURCE_BLOCK = "[data-source-start]";

/** Whether `range` covers some of `node`'s contents, not merely reaching its edge. */
function touches(range: Range, node: Node): boolean {
  const own = document.createRange();
  own.selectNodeContents(node);
  return range.compareBoundaryPoints(Range.END_TO_START, own) < 0 && range.compareBoundaryPoints(Range.START_TO_END, own) > 0;
}

/**
 * The source lines of the rendered blocks (`Markdown sourceBlocks`) a
 * selection in Preview touches, from the first block's start to the last
 * block's end; in a table, only the lines of the rows it touches. A selection
 * that merely reaches the edge of a block does not cover it. Null when it
 * touches no block.
 */
export function previewSelectionLines(range: Range, markdown: Element): LineRange | null {
  const covered: LineRange[] = [];
  for (const block of markdown.querySelectorAll<HTMLElement>(SOURCE_BLOCK)) {
    if (block.parentElement?.closest(SOURCE_BLOCK) || !touches(range, block)) continue;
    const rows = tableRows(block).filter(({ row }) => touches(range, row));
    if (rows.length > 0) covered.push(...rows.map(({ line }) => ({ startLine: line, endLine: line })));
    else covered.push({ startLine: Number(block.dataset.sourceStart), endLine: Number(block.dataset.sourceEnd) });
  }
  if (covered.length === 0) return null;
  return {
    startLine: Math.min(...covered.map((block) => block.startLine)),
    endLine: Math.max(...covered.map((block) => block.endLine)),
  };
}

/**
 * The source lines a selection in the Source listing covers. A selection that
 * ends at the very start of a later line does not include that line. Null when
 * either end is outside the lines' text.
 */
export function sourceSelectionLines(range: Range): LineRange | null {
  const covered = sourceRangeOf(range);
  if (!covered) return null;
  const { start, end } = covered;
  const endLine = end.column === 0 && end.line > start.line ? end.line - 1 : end.line;
  return { startLine: start.line, endLine };
}
