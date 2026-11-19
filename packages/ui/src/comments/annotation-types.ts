import type { CommentLocator } from "./anchoring/model";
export type CommentScreenshotUnavailableReason =
  | "unsupported"
  | "cancelled"
  | "failed";
export type CommentScreenshotCapture =
  | { status: "captured"; dataUrl: string }
  | { status: "unavailable"; reason: CommentScreenshotUnavailableReason };
/** The exact words of a selection with a few characters of the text on each side, as the W3C TextQuoteSelector. */
export type TextQuote = { prefix: string; exact: string; suffix: string };
/**
 * A cell of a rendered markdown table. Its row is named by `key`, the row's text
 * in `keyColumn`: the first column (from the left) whose body values are all
 * unique, both blank when none is. `column` is its header text. `row` (0-based
 * body row, -1 for the header) and `col` are where it was captured, used when
 * those names repeat or are gone.
 */
export type TableCell = { keyColumn: string; key: string; column: string; row: number; col: number };
/** A rectangle on an image as fractions of its width and height: every field in [0, 1] and `x + w`, `y + h` at most 1. */
export type RegionAnchor = { x: number; y: number; w: number; h: number };
export type PatchAnchor = {
  version: number;
  startLine: number;
  endLine: number;
  before: string[];
  lines: string[];
  after: string[];
};
export type AnnotationCapture = {
  kind: "document" | "dom" | "code-range" | "region";
  version: 1;
  view: "source" | "form" | "rich";
  revision?: string;
  screenshotUrl?: string;
  source?: string;
  label?: string;
  location?: { state: string; startLine?: number; endLine?: number };
  anchor?: string;
  patch?: PatchAnchor;
  html?: string;
  locators?: CommentLocator[];
  /**
   * The exact selected words, a sibling of the selector's other fields (as gavel
   * stores it), never nested in `patch`. On a `dom` capture of a text selection
   * it sits beside `anchor` (the `e:` locators of the containing element); on a
   * `code-range` made from rendered prose it sits beside `patch` and must lie in
   * the patch's lines, which stay authoritative.
   */
  quote?: TextQuote;
  /** The table cell a `code-range` selection lies in, a sibling of `patch` whose one line is the cell's row. */
  cell?: TableCell;
  region?: RegionAnchor;
};
