/**
 * Decompiled source rows against the original bytecode line numbers.
 *
 * `JvmClassSource.sourceLineNumbers` holds one bytecode line per decompiled row
 * (index = row), 0 where the decompiler mapped nothing. The gutter shows those
 * numbers, so a link to "line 270" has to be translated back to a row, and a
 * clicked row forward to a line.
 */

export type MappedRow = {
  /** 0-based decompiled row. */
  row: number;
  /** The line that row is labelled with: the one asked for, or the earlier line it sits under. */
  line: number;
};

/** Whether the gutter shows bytecode lines rather than plain row numbers. */
export function hasLineMap(lineNumbers: readonly number[]): boolean {
  return lineNumbers.some((line) => line > 0);
}

/**
 * The row holding bytecode `line`. A row mapped to exactly `line` wins (the
 * first of several is where the statement starts); otherwise the row of the
 * nearest mapped line above, because a statement spanning several lines is
 * recorded under its first.
 */
export function mappedRow(lineNumbers: readonly number[], line: number): MappedRow | null {
  if (line <= 0) return null;
  let found: MappedRow | null = null;
  for (const [row, mapped] of lineNumbers.entries()) {
    if (mapped > 0 && mapped <= line && (found === null || mapped > found.line)) found = { row, line: mapped };
  }
  return found;
}

/**
 * The 0-based row that displays bytecode `line`, or -1 when there is none.
 * Without a mapping the gutter shows row numbers, so the line is the row.
 */
export function rowForLine(lineNumbers: readonly number[], line: number): number {
  if (line <= 0) return -1;
  if (!hasLineMap(lineNumbers)) return line - 1;
  return mappedRow(lineNumbers, line)?.row ?? -1;
}

/** The number the gutter shows for a 0-based row; 0 for a row it leaves blank. */
export function lineForRow(lineNumbers: readonly number[], row: number): number {
  if (row < 0) return 0;
  if (!hasLineMap(lineNumbers)) return row + 1;
  return Math.max(lineNumbers[row] ?? 0, 0);
}

/** The gutter text of a 0-based row; "" when the mapping skips it. */
export function gutterLabel(lineNumbers: readonly number[], row: number): string {
  const line = lineForRow(lineNumbers, row);
  return line > 0 ? String(line) : "";
}
