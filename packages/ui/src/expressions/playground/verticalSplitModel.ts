export const EDITOR_LINE_HEIGHT = 20;

const PANE_HEADER_HEIGHT = 33;
const EDITOR_CHROME = 12;

export function rowsToPaneHeight(rows: number): number {
  return PANE_HEADER_HEIGHT + rows * EDITOR_LINE_HEIGHT + EDITOR_CHROME;
}
