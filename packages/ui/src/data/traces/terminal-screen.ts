/**
 * A deliberately minimal terminal screen for replaying a `terminal` trace: it
 * settles the sequences a build or test run emits (CR/LF/BS/TAB, cursor moves,
 * erase, SGR colour and weight) into a grid, and serialises the grid back to
 * ANSI text for AnsiHtml. Everything else (OSC, private modes, character sets,
 * backgrounds, 256/truecolour) is consumed and ignored, as AnsiHtml cannot draw
 * it.
 */

type Cell = { ch: string; sgr: string };

type SgrState = { bold: boolean; dim: boolean; italic: boolean; underline: boolean; fg: number | null };

export type TerminalScreen = {
  width: number;
  height: number;
  rows: Cell[][];
  row: number;
  col: number;
  style: SgrState;
  /** `style` serialised as SGR parameters, stored on each cell written. */
  sgr: string;
  saved: { row: number; col: number } | null;
  /** An escape sequence cut off at the end of the last write. */
  pending: string;
};

const BLANK: Cell = { ch: " ", sgr: "" };
const TAB_STOP = 8;
/** A sequence this long without a terminator is garbage; its ESC is dropped. */
const MAX_PENDING = 4096;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function createScreen(width: number, height: number): TerminalScreen {
  if (!(width > 0) || !(height > 0)) throw new Error(`terminal screen needs a positive size, got ${width}x${height}`);
  return {
    width,
    height,
    rows: Array.from({ length: height }, () => []),
    row: 0,
    col: 0,
    style: { bold: false, dim: false, italic: false, underline: false, fg: null },
    sgr: "",
    saved: null,
    pending: "",
  };
}

export function resizeScreen(screen: TerminalScreen, width: number, height: number): void {
  if (!(width > 0) || !(height > 0)) throw new Error(`terminal screen needs a positive size, got ${width}x${height}`);
  if (height < screen.rows.length) {
    const dropFromTop = Math.max(0, screen.row - height + 1);
    screen.rows.splice(0, dropFromTop);
    screen.row -= dropFromTop;
    screen.rows.length = height;
  }
  while (screen.rows.length < height) screen.rows.push([]);
  for (const row of screen.rows) if (row.length > width) row.length = width;
  screen.width = width;
  screen.height = height;
  screen.row = clamp(screen.row, 0, height - 1);
  screen.col = clamp(screen.col, 0, width - 1);
}

function lineFeed(screen: TerminalScreen): void {
  if (screen.row < screen.height - 1) {
    screen.row++;
    return;
  }
  screen.rows.shift();
  screen.rows.push([]);
}

function putChar(screen: TerminalScreen, ch: string): void {
  if (screen.col >= screen.width) {
    screen.col = 0;
    lineFeed(screen);
  }
  const line = screen.rows[screen.row]!;
  while (line.length < screen.col) line.push(BLANK);
  line[screen.col] = { ch, sgr: screen.sgr };
  screen.col++;
}

function eraseLine(screen: TerminalScreen, mode: number): void {
  const line = screen.rows[screen.row]!;
  if (mode === 0) {
    line.length = Math.min(line.length, screen.col);
    return;
  }
  if (mode === 2) {
    line.length = 0;
    return;
  }
  const end = Math.min(screen.col + 1, screen.width);
  while (line.length < end) line.push(BLANK);
  for (let i = 0; i < end; i++) line[i] = BLANK;
}

function eraseDisplay(screen: TerminalScreen, mode: number): void {
  if (mode === 0) {
    eraseLine(screen, 0);
    for (let r = screen.row + 1; r < screen.height; r++) screen.rows[r] = [];
  } else if (mode === 1) {
    for (let r = 0; r < screen.row; r++) screen.rows[r] = [];
    eraseLine(screen, 1);
  } else {
    for (let r = 0; r < screen.height; r++) screen.rows[r] = [];
  }
}

function applySgr(screen: TerminalScreen, tokens: string[]): void {
  const style = screen.style;
  const codes = tokens.length === 0 ? [""] : tokens;
  for (let i = 0; i < codes.length; i++) {
    const token = codes[i]!;
    if (token.includes(":")) continue;
    const code = token === "" ? 0 : Number.parseInt(token, 10);
    if (code === 0) {
      style.bold = style.dim = style.italic = style.underline = false;
      style.fg = null;
    } else if (code === 1) style.bold = true;
    else if (code === 2) style.dim = true;
    else if (code === 3) style.italic = true;
    else if (code === 4) style.underline = true;
    else if (code === 22) style.bold = style.dim = false;
    else if (code === 23) style.italic = false;
    else if (code === 24) style.underline = false;
    else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) style.fg = code;
    else if (code === 39) style.fg = null;
    else if (code === 38 || code === 48 || code === 58) {
      const mode = codes[i + 1];
      i += mode === "5" ? 2 : mode === "2" ? 4 : 0;
    }
  }
  screen.sgr = [
    style.bold ? "1" : "",
    style.dim ? "2" : "",
    style.italic ? "3" : "",
    style.underline ? "4" : "",
    style.fg === null ? "" : String(style.fg),
  ]
    .filter(Boolean)
    .join(";");
}

function csi(screen: TerminalScreen, params: string, final: string): void {
  if (/^[?>=<!]/.test(params)) return;
  const tokens = params === "" ? [] : params.split(";");
  const arg = (index: number, fallback: number): number => {
    const value = Number.parseInt(tokens[index] ?? "", 10);
    return Number.isNaN(value) || value === 0 ? fallback : value;
  };
  const mode = Number.parseInt(tokens[0] ?? "0", 10) || 0;
  const line = screen.rows[screen.row]!;
  switch (final) {
    case "m":
      applySgr(screen, tokens);
      break;
    case "A":
      screen.row = Math.max(0, screen.row - arg(0, 1));
      break;
    case "B":
      screen.row = Math.min(screen.height - 1, screen.row + arg(0, 1));
      break;
    case "C":
      screen.col = Math.min(screen.width - 1, screen.col + arg(0, 1));
      break;
    case "D":
      screen.col = Math.max(0, screen.col - arg(0, 1));
      break;
    case "E":
      screen.row = Math.min(screen.height - 1, screen.row + arg(0, 1));
      screen.col = 0;
      break;
    case "F":
      screen.row = Math.max(0, screen.row - arg(0, 1));
      screen.col = 0;
      break;
    case "G":
      screen.col = clamp(arg(0, 1) - 1, 0, screen.width - 1);
      break;
    case "d":
      screen.row = clamp(arg(0, 1) - 1, 0, screen.height - 1);
      break;
    case "H":
    case "f":
      screen.row = clamp(arg(0, 1) - 1, 0, screen.height - 1);
      screen.col = clamp(arg(1, 1) - 1, 0, screen.width - 1);
      break;
    case "J":
      eraseDisplay(screen, mode);
      break;
    case "K":
      eraseLine(screen, mode);
      break;
    case "P":
      line.splice(screen.col, arg(0, 1));
      break;
    case "X":
      for (let i = 0; i < arg(0, 1) && screen.col + i < line.length; i++) line[screen.col + i] = BLANK;
      break;
    case "@":
      if (line.length > screen.col) line.splice(screen.col, 0, ...Array.from({ length: arg(0, 1) }, () => BLANK));
      line.length = Math.min(line.length, screen.width);
      break;
    case "L":
      screen.rows.splice(screen.row, 0, ...Array.from({ length: arg(0, 1) }, (): Cell[] => []));
      screen.rows.length = screen.height;
      break;
    case "M":
      screen.rows.splice(screen.row, arg(0, 1));
      while (screen.rows.length < screen.height) screen.rows.push([]);
      break;
    case "s":
      screen.saved = { row: screen.row, col: screen.col };
      break;
    case "u":
      if (screen.saved) ({ row: screen.row, col: screen.col } = screen.saved);
      break;
    default:
      break;
  }
}

/** Consumes the escape sequence at `start`; returns the index after it, or -1 when it is cut off. */
function consumeEscape(screen: TerminalScreen, input: string, start: number): number {
  const kind = input[start + 1];
  if (kind === undefined) return -1;
  if (kind === "[") {
    let end = start + 2;
    while (end < input.length && /[\x20-\x3f]/.test(input[end]!)) end++;
    if (end >= input.length) return -1;
    csi(screen, input.slice(start + 2, end).replace(/[\x20-\x2f]/g, ""), input[end]!);
    return end + 1;
  }
  if (kind === "]") {
    for (let end = start + 2; end < input.length; end++) {
      if (input[end] === "\u0007") return end + 1;
      if (input[end] === "\u001b" && input[end + 1] === "\\") return end + 2;
    }
    return -1;
  }
  if ("()*+".includes(kind)) return start + 3 > input.length ? -1 : start + 3;
  if (kind === "7") screen.saved = { row: screen.row, col: screen.col };
  else if (kind === "8" && screen.saved) ({ row: screen.row, col: screen.col } = screen.saved);
  else if (kind === "M") screen.row = Math.max(0, screen.row - 1);
  return start + 2;
}

/** Feeds output to the screen; an escape sequence cut off at the end waits for the next write. */
export function writeScreen(screen: TerminalScreen, data: string): void {
  const input = screen.pending + data;
  screen.pending = "";
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (ch === "\u001b") {
      const next = consumeEscape(screen, input, i);
      if (next === -1) {
        if (input.length - i <= MAX_PENDING) {
          screen.pending = input.slice(i);
          return;
        }
        i++;
        continue;
      }
      i = next;
      continue;
    }
    i++;
    if (ch === "\r") screen.col = 0;
    else if (ch === "\n") lineFeed(screen);
    else if (ch === "\b") screen.col = Math.max(0, screen.col - 1);
    else if (ch === "\t") screen.col = Math.min(screen.width - 1, (Math.floor(screen.col / TAB_STOP) + 1) * TAB_STOP);
    else if (ch < " " || ch === "\u007f") continue;
    else {
      const codePoint = input.codePointAt(i - 1)!;
      const full = String.fromCodePoint(codePoint);
      i += full.length - 1;
      putChar(screen, full);
    }
  }
}

function trimmed(row: Cell[]): Cell[] {
  let end = row.length;
  while (end > 0 && row[end - 1]!.ch === " ") end--;
  return row.slice(0, end);
}

/** The screen as plain text, one line per row, trailing blanks trimmed. */
export function screenText(screen: TerminalScreen): string {
  return screen.rows.map((row) => trimmed(row).map((cell) => cell.ch).join("")).join("\n");
}

function transition(from: string, to: string): string {
  if (to === "") return "\u001b[0m";
  return from === "" ? `\u001b[${to}m` : `\u001b[0;${to}m`;
}

/** The screen as ANSI text (weight, italic, underline, foreground) for AnsiHtml. */
export function screenToAnsi(screen: TerminalScreen): string {
  let current = "";
  return screen.rows
    .map((row) => {
      let line = "";
      for (const cell of trimmed(row)) {
        if (cell.sgr !== current) {
          line += transition(current, cell.sgr);
          current = cell.sgr;
        }
        line += cell.ch;
      }
      return line;
    })
    .join("\n");
}
